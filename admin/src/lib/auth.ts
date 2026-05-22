import { apiRequest, ApiError, setToken, getToken, clearToken } from './api';
import type { AdminUser, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth';

const USER_KEY = 'eleganza-admin-user';

export class AuthError extends Error {
  field?: 'email' | 'password' | 'token' | 'global';
  constructor(message: string, field?: AuthError['field']) {
    super(message);
    this.name = 'AuthError';
    this.field = field;
  }
}

export function getStoredUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}
function storeUser(u: AdminUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}
function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken() && getStoredUser());
}

/* ─── Login ──────────────────────────────────────────────────────────── */
export async function login({ email, password }: LoginRequest): Promise<AdminUser> {
  try {
    const res = await apiRequest<{ token: string; user: AdminUser }>('/api/admin/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    setToken(res.token);
    storeUser(res.user);
    return res.user;
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'invalid_credentials') throw new AuthError(err.message, 'global');
      if (err.code === 'account_locked') throw new AuthError(err.message, 'global');
      if (err.status >= 500) throw new AuthError('Le serveur est momentanément indisponible.', 'global');
      throw new AuthError(err.message, 'global');
    }
    throw new AuthError('Une erreur réseau est survenue.', 'global');
  }
}

/* ─── Me ─────────────────────────────────────────────────────────────── */
export async function fetchMe(): Promise<AdminUser | null> {
  try {
    const res = await apiRequest<{ user: AdminUser }>('/api/admin/auth/me');
    storeUser(res.user);
    return res.user;
  } catch {
    return null;
  }
}

/* ─── Logout ─────────────────────────────────────────────────────────── */
export async function logout() {
  try {
    await apiRequest('/api/admin/auth/logout', { method: 'POST' });
  } catch {
    /* ignore */
  }
  clearToken();
  clearUser();
}

/* ─── Forgot password ────────────────────────────────────────────────── */
export async function requestPasswordReset({ email }: ForgotPasswordRequest): Promise<{ delivered: true }> {
  await apiRequest('/api/admin/auth/forgot-password', { method: 'POST', body: { email }, auth: false });
  return { delivered: true };
}

/* ─── Reset password ─────────────────────────────────────────────────── */
export async function resetPassword({ token, password }: ResetPasswordRequest): Promise<{ ok: true }> {
  try {
    await apiRequest('/api/admin/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      auth: false,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'invalid_token') throw new AuthError(err.message, 'token');
      if (err.code === 'weak_password') throw new AuthError(err.message, 'password');
      throw new AuthError(err.message, 'global');
    }
    throw new AuthError('Une erreur est survenue. Veuillez réessayer.', 'global');
  }
}

/* ─── Change password (while logged in) ───────────────────────────────── */
export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    await apiRequest('/api/admin/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.code === 'wrong_password') throw new AuthError(err.message, 'password');
      throw new AuthError(err.message, 'global');
    }
    throw new AuthError('Une erreur est survenue.', 'global');
  }
}
