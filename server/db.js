/* ─────────────────────────────────────────────────────────────────────────
 *  Supabase Client
 *  Single connection point for all DB access. Uses the SERVICE ROLE key —
 *  bypasses RLS, so this module must NEVER be imported by browser code.
 * ───────────────────────────────────────────────────────────────────────── */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✖ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  console.error('   Copy server/.env.example to server/.env and fill in the values.');
  process.exit(1);
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: { schema: 'public' },
  global: {
    headers: { 'x-application-name': 'eleganza-server' },
  },
});

/* ─── Connection probe ────────────────────────────────────────────────── */
export async function pingDatabase() {
  // Lightweight query that touches the database without depending on any
  // specific row. Counts rows in admin_users (always present after schema).
  const { count, error } = await supabase
    .from('admin_users')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return { ok: false, error: error.message, code: error.code };
  }
  return { ok: true, adminCount: count };
}

/* ─── Convenience wrapper around supabase errors ──────────────────────── */
export function throwIfError(error, context = 'database') {
  if (error) {
    const err = new Error(`[${context}] ${error.message}`);
    err.code = error.code;
    err.details = error.details;
    err.hint = error.hint;
    throw err;
  }
}
