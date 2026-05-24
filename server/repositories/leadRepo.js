/* ─────────────────────────────────────────────────────────────────────────
 *  Lead repository
 *  Captures customer contact details surfaced through the chatbot,
 *  plus the products they showed interest in, the total amount, and a
 *  lifecycle status (new / contacted / delivered / cancelled).
 * ───────────────────────────────────────────────────────────────────────── */

import { supabase, throwIfError } from '../db.js';

const LEAD_STATUSES = ['new', 'contacted', 'delivered', 'cancelled'];

export async function captureLead({
  sessionId,
  email,
  name,
  phone,
  marketingOptIn = false,
  source = 'chatbot',
  notes,
  address,
  productIds,
  productNames,
  totalAmount,
  currency,
}) {
  const payload = {
    session_id: sessionId || null,
    email: email.trim().toLowerCase(),
    name: name || null,
    phone: phone || null,
    marketing_opt_in: marketingOptIn,
    source,
    notes: notes || null,
    address: address || null,
    product_ids: Array.isArray(productIds) ? productIds : [],
    product_names: Array.isArray(productNames) ? productNames : [],
    total_amount: typeof totalAmount === 'number' && Number.isFinite(totalAmount) ? totalAmount : null,
    currency: currency || 'EUR',
  };

  // We do NOT touch `status` on upsert — that's the admin's column.
  const { data, error } = await supabase
    .from('chat_leads')
    .upsert(payload, { onConflict: 'email' })
    .select()
    .single();
  throwIfError(error, 'captureLead');
  return data;
}

export async function listLeads({ limit = 100, offset = 0, status } = {}) {
  let q = supabase
    .from('chat_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
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

export async function getLeadById(id) {
  const { data, error } = await supabase
    .from('chat_leads')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  throwIfError(error, 'getLeadById');
  return data;
}

export async function updateLeadStatus(id, status) {
  if (!LEAD_STATUSES.includes(status)) {
    throw new Error(`Invalid status "${status}". Must be one of: ${LEAD_STATUSES.join(', ')}`);
  }
  const { data, error } = await supabase
    .from('chat_leads')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  throwIfError(error, 'updateLeadStatus');
  return data;
}

export { LEAD_STATUSES };
