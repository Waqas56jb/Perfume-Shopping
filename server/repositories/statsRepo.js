/* ─────────────────────────────────────────────────────────────────────────
 *  Stats repository
 *  Read-only aggregates for the admin dashboard.
 * ───────────────────────────────────────────────────────────────────────── */

import { supabase, throwIfError } from '../db.js';

export async function getOverview() {
  // Total counters
  const tablesToCount = ['chat_sessions', 'chat_messages', 'chat_leads', 'products'];
  const counters = {};

  for (const t of tablesToCount) {
    const { count, error } = await supabase
      .from(t)
      .select('*', { count: 'exact', head: true });
    throwIfError(error, `getOverview/${t}`);
    counters[t] = count || 0;
  }

  // Leads + escalations on chat_sessions
  const { count: leadsFromSessions } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('lead_captured', true);

  const { count: escalations } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('escalated', true);

  // Tokens total
  const { data: tokenRow } = await supabase
    .from('chat_sessions')
    .select('total_tokens');

  const totalTokens = (tokenRow || []).reduce((s, r) => s + (r.total_tokens || 0), 0);

  // Average messages per session
  const avgMessages =
    counters.chat_sessions > 0
      ? Math.round((counters.chat_messages / counters.chat_sessions) * 10) / 10
      : 0;

  // Lead conversion %
  const conversionRate =
    counters.chat_sessions > 0
      ? Math.round(((leadsFromSessions || 0) / counters.chat_sessions) * 1000) / 10
      : 0;

  return {
    totalSessions: counters.chat_sessions,
    totalMessages: counters.chat_messages,
    totalLeads: counters.chat_leads,
    totalProducts: counters.products,
    leadsFromSessions: leadsFromSessions || 0,
    escalations: escalations || 0,
    totalTokens,
    avgMessages,
    conversionRate,
  };
}

export async function getDailySeries(days = 14) {
  const { data, error } = await supabase
    .from('v_daily_stats')
    .select('*')
    .limit(days);
  throwIfError(error, 'getDailySeries');
  return (data || []).reverse();
}

export async function getTopIntents(limit = 8) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('intent')
    .not('intent', 'is', null)
    .eq('role', 'assistant');
  throwIfError(error, 'getTopIntents');
  const counts = {};
  for (const r of data || []) counts[r.intent] = (counts[r.intent] || 0) + 1;
  return Object.entries(counts)
    .map(([intent, count]) => ({ intent, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getTopProductSuggestions(limit = 10) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('suggested_product_ids')
    .eq('role', 'assistant');
  throwIfError(error, 'getTopProductSuggestions');
  const counts = {};
  for (const r of data || []) {
    for (const slug of r.suggested_product_ids || []) {
      counts[slug] = (counts[slug] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([slug, count]) => ({ slug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getRedactionEvents(limit = 25) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, session_id, redacted_terms, detected_forbidden, created_at, content')
    .or('detected_forbidden.not.is.null,redacted_terms.neq.{}')
    .order('created_at', { ascending: false })
    .limit(limit);
  throwIfError(error, 'getRedactionEvents');
  return data || [];
}
