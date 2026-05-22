/* ─────────────────────────────────────────────────────────────────────────
 *  Admin auth repository
 *  All admin-user / password-reset / session reads & writes live here so
 *  the rest of the server stays free of SQL/Supabase concerns.
 * ───────────────────────────────────────────────────────────────────────── */

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { supabase, throwIfError } from '../db.js';

const BCRYPT_ROUNDS = 12;
const SESSION_TTL_HOURS = 24 * 30;          // 30 days
const RESET_TTL_MINUTES = 30;

/* ─── Hashing helpers ─────────────────────────────────────────────────── */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function generateOpaqueToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/* ─── Admin users ─────────────────────────────────────────────────────── */
export async function createAdminUser({ email, password, name, role = 'admin' }) {
  const password_hash = await hashPassword(password);
  const { data, error } = await supabase
    .from('admin_users')
    .insert({ email: email.toLowerCase().trim(), password_hash, name, role })
    .select('id, email, name, role, is_active, created_at')
    .single();
  throwIfError(error, 'createAdminUser');
  return data;
}

export async function findAdminByEmail(email) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();
  throwIfError(error, 'findAdminByEmail');
  return data;
}

export async function findAdminById(id) {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, name, role, is_active, last_login_at, created_at')
    .eq('id', id)
    .maybeSingle();
  throwIfError(error, 'findAdminById');
  return data;
}

export async function updateLastLogin(userId) {
  const { error } = await supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString(), failed_attempts: 0, locked_until: null })
    .eq('id', userId);
  throwIfError(error, 'updateLastLogin');
}

export async function recordFailedLogin(userId, currentAttempts) {
  const nextAttempts = (currentAttempts || 0) + 1;
  const locked_until = nextAttempts >= 5 ? new Date(Date.now() + 15 * 60_000).toISOString() : null;
  const { error } = await supabase
    .from('admin_users')
    .update({ failed_attempts: nextAttempts, locked_until })
    .eq('id', userId);
  throwIfError(error, 'recordFailedLogin');
  return { nextAttempts, locked_until };
}

export async function updatePassword(userId, newPlain) {
  const password_hash = await hashPassword(newPlain);
  const { error } = await supabase
    .from('admin_users')
    .update({ password_hash, failed_attempts: 0, locked_until: null })
    .eq('id', userId);
  throwIfError(error, 'updatePassword');
}

/* ─── Password reset tokens ───────────────────────────────────────────── */
export async function issuePasswordReset({ userId, ip, userAgent }) {
  const token = generateOpaqueToken();
  const token_hash = sha256(token);
  const expires_at = new Date(Date.now() + RESET_TTL_MINUTES * 60_000).toISOString();
  const { error } = await supabase
    .from('admin_password_resets')
    .insert({ user_id: userId, token_hash, expires_at, ip_address: ip, user_agent: userAgent });
  throwIfError(error, 'issuePasswordReset');
  return { token, expires_at };
}

export async function consumePasswordReset(rawToken) {
  const token_hash = sha256(rawToken);
  const { data, error } = await supabase
    .from('admin_password_resets')
    .select('id, user_id, expires_at, used_at')
    .eq('token_hash', token_hash)
    .maybeSingle();
  throwIfError(error, 'consumePasswordReset/find');

  if (!data) return null;
  if (data.used_at) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  const { error: updateErr } = await supabase
    .from('admin_password_resets')
    .update({ used_at: new Date().toISOString() })
    .eq('id', data.id);
  throwIfError(updateErr, 'consumePasswordReset/markUsed');

  return { userId: data.user_id };
}

/* ─── Admin sessions ──────────────────────────────────────────────────── */
export async function createSessionToken({ userId, ip, userAgent }) {
  const token = generateOpaqueToken();
  const token_hash = sha256(token);
  const expires_at = new Date(Date.now() + SESSION_TTL_HOURS * 3_600_000).toISOString();
  const { error } = await supabase
    .from('admin_sessions')
    .insert({ user_id: userId, token_hash, expires_at, ip_address: ip, user_agent: userAgent });
  throwIfError(error, 'createSessionToken');
  return { token, expires_at };
}

export async function verifySessionToken(rawToken) {
  if (!rawToken) return null;
  const token_hash = sha256(rawToken);
  const { data, error } = await supabase
    .from('admin_sessions')
    .select('id, user_id, expires_at, revoked_at, admin_users!inner(id,email,name,role,is_active)')
    .eq('token_hash', token_hash)
    .maybeSingle();
  throwIfError(error, 'verifySessionToken');

  if (!data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at) < new Date()) return null;
  if (!data.admin_users.is_active) return null;

  return {
    sessionId: data.id,
    user: data.admin_users,
  };
}

export async function revokeSession(rawToken) {
  if (!rawToken) return;
  const token_hash = sha256(rawToken);
  const { error } = await supabase
    .from('admin_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', token_hash);
  throwIfError(error, 'revokeSession');
}

export async function revokeAllSessionsForUser(userId, exceptToken = null) {
  let q = supabase
    .from('admin_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);
  if (exceptToken) q = q.neq('token_hash', sha256(exceptToken));
  const { error } = await q;
  throwIfError(error, 'revokeAllSessionsForUser');
}
