/* ─────────────────────────────────────────────────────────────────────────
 *  Chat repository
 *  Reads & writes for chat_sessions, chat_messages, analytics_events.
 *  Drop-in destination for the current in-memory sessionStore.js — wire
 *  these calls from server.js once you're ready to persist conversations.
 * ───────────────────────────────────────────────────────────────────────── */

import { supabase, throwIfError } from '../db.js';

/* ─── Sessions ────────────────────────────────────────────────────────── */
export async function createChatSession(params = {}) {
  const {
    language = 'fr',
    customerEmail,
    customerName,
    ip,
    userAgent,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
  } = params;

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      language,
      customer_email: customerEmail || null,
      customer_name: customerName || null,
      ip_address: ip || null,
      user_agent: userAgent || null,
      referrer: referrer || null,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
    })
    .select('*')
    .single();
  throwIfError(error, 'createChatSession');
  return data;
}

export async function getChatSession(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  throwIfError(error, 'getChatSession');
  return data;
}

export async function touchChatSession(id, patch = {}) {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ ...patch, last_active_at: new Date().toISOString() })
    .eq('id', id);
  throwIfError(error, 'touchChatSession');
}

export async function markLead(sessionId, { email, name, phone }) {
  const { error } = await supabase
    .from('chat_sessions')
    .update({
      lead_captured: true,
      customer_email: email || null,
      customer_name: name || null,
      customer_phone: phone || null,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
  throwIfError(error, 'markLead');
}

export async function markEscalation(sessionId, reason) {
  const { error } = await supabase
    .from('chat_sessions')
    .update({
      escalated: true,
      escalation_reason: reason || null,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
  throwIfError(error, 'markEscalation');
}

/* ─── Messages ────────────────────────────────────────────────────────── */
export async function appendChatMessage({
  sessionId,
  role,
  content,
  intent = null,
  suggestedProductIds = [],
  quickReplies = null,
  detectedForbidden = null,
  redactedTerms = [],
  routedProductId = null,
  captureLead = false,
  escalateToHuman = false,
  promptTokens = null,
  completionTokens = null,
  totalTokens = null,
  model = null,
  latencyMs = null,
}) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role,
      content,
      intent,
      suggested_product_ids: suggestedProductIds,
      quick_replies: quickReplies,
      detected_forbidden: detectedForbidden,
      redacted_terms: redactedTerms,
      routed_product_id: routedProductId,
      capture_lead: captureLead,
      escalate_to_human: escalateToHuman,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      model,
      latency_ms: latencyMs,
    })
    .select('id, created_at')
    .single();
  throwIfError(error, 'appendChatMessage');

  // Roll up session counters
  if (totalTokens || true) {
    const { error: incErr } = await supabase.rpc('increment_session_stats', {
      p_session_id: sessionId,
      p_tokens: totalTokens || 0,
    });
    // The RPC is optional — if it doesn't exist, fall back to two-step update.
    if (incErr && incErr.code === '42883') {
      const session = await getChatSession(sessionId);
      if (session) {
        await touchChatSession(sessionId, {
          message_count: (session.message_count || 0) + 1,
          total_tokens: (session.total_tokens || 0) + (totalTokens || 0),
        });
      }
    }
  }

  return data;
}

export async function getRecentMessages(sessionId, limit = 16) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  throwIfError(error, 'getRecentMessages');
  return (data || []).reverse();
}

/* ─── Analytics events ────────────────────────────────────────────────── */
export async function logAnalyticsEvent({ sessionId, eventType, payload = null }) {
  const { error } = await supabase
    .from('analytics_events')
    .insert({ session_id: sessionId, event_type: eventType, payload });
  throwIfError(error, 'logAnalyticsEvent');
}

/* ─── Admin reads ─────────────────────────────────────────────────────── */
export async function listRecentConversations({ limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('v_recent_conversations')
    .select('*')
    .range(offset, offset + limit - 1);
  throwIfError(error, 'listRecentConversations');
  return data || [];
}

export async function getDailyStats(days = 14) {
  const { data, error } = await supabase
    .from('v_daily_stats')
    .select('*')
    .limit(days);
  throwIfError(error, 'getDailyStats');
  return data || [];
}
