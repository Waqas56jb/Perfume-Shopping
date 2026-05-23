/* ─────────────────────────────────────────────────────────────────────────
 *  Fetch wrapper for /api/admin/*
 *  Attaches the bearer token, parses JSON, throws ApiError on non-2xx.
 * ───────────────────────────────────────────────────────────────────────── */

// Default to the deployed backend. For local dev, override in admin/.env.local
// with: VITE_API_URL=http://localhost:3001
const BASE_URL = import.meta.env.VITE_API_URL || 'https://perfume-shopping-backend.vercel.app';
const TOKEN_KEY = 'eleganza-admin-token';

export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
    const p = payload as { code?: string; error?: string } | undefined;
    this.code = p?.code || p?.error;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  /** Set false to skip the Authorization header (e.g. login). */
  auth?: boolean;
}

export async function apiRequest<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal, auth = true } = opts;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  // Try to parse JSON; tolerate empty bodies.
  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const message =
      (payload as { message?: string })?.message ||
      (payload as { error?: string })?.error ||
      `Request failed (HTTP ${res.status})`;
    throw new ApiError(message, res.status, payload);
  }

  return payload as T;
}

/**
 * Upload a single file via multipart/form-data.
 * Pass the file under field name "photo" (or override with `field`).
 */
export async function apiUploadFile<T = unknown>(
  path: string,
  file: File,
  { field = 'photo' }: { field?: string } = {},
): Promise<T> {
  const t = getToken();
  const form = new FormData();
  form.append(field, file);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: t ? { Authorization: `Bearer ${t}` } : {},
    body: form,
  });
  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }
  if (!res.ok) {
    const message =
      (payload as { message?: string })?.message ||
      (payload as { error?: string })?.error ||
      `Upload failed (HTTP ${res.status})`;
    throw new ApiError(message, res.status, payload);
  }
  return payload as T;
}

/** Trigger a file download from an admin endpoint (e.g. CSV export). */
export async function apiDownload(path: string, filename: string) {
  const t = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  if (!res.ok) throw new ApiError(`Download failed (${res.status})`, res.status);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
