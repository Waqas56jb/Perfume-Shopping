/* ─────────────────────────────────────────────────────────────────────────
 *  Customer chatbot — minimal API client for /api/chat
 * ───────────────────────────────────────────────────────────────────────── */

import type { Product, QuickReply } from '../types/chat';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SESSION_STORAGE_KEY = 'eleganza-chat-session';

export interface ChatApiResponse {
  sessionId: string;
  reply: string;
  intent: string;
  products: Product[];
  productIds: string[];
  quickReplies: Omit<QuickReply, 'id'>[];
  captureLead: boolean;
  escalateToHuman: boolean;
  meta: {
    routedFrom: string | null;
    detectedForbidden: string | null;
    redacted: string[];
    language: string;
    model?: string;
  };
}

export class ChatApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
  }
}

export function getStoredSessionId(): string | null {
  try { return sessionStorage.getItem(SESSION_STORAGE_KEY); } catch { return null; }
}
export function setStoredSessionId(id: string) {
  try { sessionStorage.setItem(SESSION_STORAGE_KEY, id); } catch { /* ignore */ }
}
export function clearStoredSessionId() {
  try { sessionStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* ignore */ }
}

export async function sendChatMessage(
  message: string,
  sessionId?: string | null,
  signal?: AbortSignal,
): Promise<ChatApiResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ message, sessionId: sessionId || undefined }),
    signal,
  });

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }

  if (!res.ok) {
    const msg = (payload as { message?: string; error?: string })?.message
      || (payload as { error?: string })?.error
      || `HTTP ${res.status}`;
    throw new ChatApiError(msg, res.status);
  }

  return payload as ChatApiResponse;
}

export async function submitLead(
  sessionId: string,
  data: { email: string; name?: string; phone?: string; marketingOptIn?: boolean },
) {
  const res = await fetch(`${API_BASE}/api/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, ...data }),
  });
  if (!res.ok) throw new ChatApiError('Lead submission failed', res.status);
  return res.json();
}
