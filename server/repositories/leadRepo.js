/* ─────────────────────────────────────────────────────────────────────────
 *  Lead repository
 *  Captures customer contact details surfaced through the chatbot.
 * ───────────────────────────────────────────────────────────────────────── */

import { supabase, throwIfError } from '../db.js';

export async function captureLead({ sessionId, email, name, phone, marketingOptIn = false, source = 'chatbot', notes }) {
  const payload = {
    session_id: sessionId || null,
    email: email.trim().toLowerCase(),
    name: name || null,
    phone: phone || null,
    marketing_opt_in: marketingOptIn,
    source,
    notes: notes || null,
  };

  // Upsert on email so re-submissions don't error
  const { data, error } = await supabase
    .from('chat_leads')
    .upsert(payload, { onConflict: 'email' })
    .select()
    .single();
  throwIfError(error, 'captureLead');
  return data;
}

export async function listLeads({ limit = 100, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('chat_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  throwIfError(error, 'listLeads');
  return data || [];
}

export async function getLeadByEmail(email) {
  const { data, error } = await supabase
    .from('chat_leads')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();
  throwIfError(error, 'getLeadByEmail');
  return data;
}
