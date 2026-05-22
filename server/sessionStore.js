/* ─────────────────────────────────────────────────────────────────────────
 *  In-memory conversation store
 *  Stores conversation history per session so the agent has multi-turn context.
 *  Replace this with Redis / Postgres when persistence is required.
 * ───────────────────────────────────────────────────────────────────────── */

import { randomUUID } from 'node:crypto';

const MAX_HISTORY_TURNS = Number(process.env.MAX_HISTORY_TURNS || 16);
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MINUTES || 180) * 60 * 1000;

/**
 * Session shape:
 * {
 *   id: string,
 *   createdAt: number,
 *   lastActiveAt: number,
 *   language: 'fr' | 'en' | ...,
 *   messages: Array<{ role: 'user'|'assistant'|'system', content: string, timestamp: number }>,
 *   profile: { name?: string, email?: string, gender?: 'F'|'H'|'U', interest?: string },
 *   leadCaptured: boolean,
 *   escalated: boolean,
 *   meta: Record<string, any>
 * }
 */

const sessions = new Map();

function now() {
  return Date.now();
}

export function createSession({ language = 'fr', meta = {} } = {}) {
  const id = randomUUID();
  const session = {
    id,
    createdAt: now(),
    lastActiveAt: now(),
    language,
    messages: [],
    profile: {},
    leadCaptured: false,
    escalated: false,
    meta,
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id) {
  if (!id) return null;
  const s = sessions.get(id);
  if (!s) return null;
  if (now() - s.lastActiveAt > SESSION_TTL_MS) {
    sessions.delete(id);
    return null;
  }
  return s;
}

export function getOrCreateSession(id, options = {}) {
  const existing = getSession(id);
  if (existing) return existing;
  return createSession(options);
}

export function appendMessage(sessionId, message) {
  const s = getSession(sessionId);
  if (!s) return null;
  s.messages.push({ ...message, timestamp: now() });
  s.lastActiveAt = now();
  // Keep only the last N messages (excluding any leading system message)
  const cap = MAX_HISTORY_TURNS;
  if (s.messages.length > cap) {
    s.messages = s.messages.slice(s.messages.length - cap);
  }
  return s;
}

export function updateProfile(sessionId, patch) {
  const s = getSession(sessionId);
  if (!s) return null;
  s.profile = { ...s.profile, ...patch };
  s.lastActiveAt = now();
  return s;
}

export function markLeadCaptured(sessionId, capture) {
  const s = getSession(sessionId);
  if (!s) return null;
  s.leadCaptured = true;
  s.profile = { ...s.profile, ...capture };
  s.lastActiveAt = now();
  return s;
}

export function markEscalated(sessionId, reason) {
  const s = getSession(sessionId);
  if (!s) return null;
  s.escalated = true;
  s.meta.escalationReason = reason;
  s.lastActiveAt = now();
  return s;
}

/* ─── Periodic cleanup of stale sessions ──────────────────────────────────── */
let cleanupTimer = null;
export function startSessionCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const t = now();
    for (const [id, s] of sessions) {
      if (t - s.lastActiveAt > SESSION_TTL_MS) sessions.delete(id);
    }
  }, 60 * 1000).unref?.();
}

export function stopSessionCleanup() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

export function getStats() {
  return {
    activeSessions: sessions.size,
    ttlMinutes: SESSION_TTL_MS / 60000,
    maxHistoryTurns: MAX_HISTORY_TURNS,
  };
}
