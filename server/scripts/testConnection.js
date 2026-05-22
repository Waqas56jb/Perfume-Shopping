#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────
 *  Supabase connection smoke test
 *  Usage:  node scripts/testConnection.js
 * ───────────────────────────────────────────────────────────────────────── */

import 'dotenv/config';
import { supabase, pingDatabase } from '../db.js';

async function main() {
  console.log('');
  console.log('🔌  Eleganza · Supabase connection probe');
  console.log('────────────────────────────────────────────────');
  console.log('URL:        ', process.env.SUPABASE_URL);
  console.log('Service key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '(set)' : '(MISSING)');
  console.log('');

  // 1. Ping
  const ping = await pingDatabase();
  if (!ping.ok) {
    console.error('✖ Ping failed:', ping.error);
    if (ping.code === '42P01') {
      console.error('  → Table public.admin_users does not exist. Run db/schema.sql first.');
    }
    process.exit(1);
  }
  console.log(`✓ admin_users:        ${ping.adminCount ?? 0} row(s)`);

  // 2. Count every table
  const tables = [
    'admin_users',
    'admin_password_resets',
    'admin_sessions',
    'products',
    'dupe_mappings',
    'forbidden_terms',
    'chat_sessions',
    'chat_messages',
    'chat_leads',
    'analytics_events',
    'system_prompts',
    'customers',
  ];

  for (const t of tables) {
    const { count, error } = await supabase
      .from(t)
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`✖ ${t.padEnd(24)} → ${error.message}`);
    } else {
      console.log(`✓ ${t.padEnd(24)} ${String(count ?? 0).padStart(5)} row(s)`);
    }
  }

  // 3. Views
  console.log('');
  for (const v of ['v_recent_conversations', 'v_daily_stats']) {
    const { error } = await supabase.from(v).select('*', { count: 'exact', head: true });
    console.log(error ? `✖ ${v.padEnd(24)} → ${error.message}` : `✓ ${v.padEnd(24)} reachable`);
  }

  console.log('');
  console.log('All good ✨');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
