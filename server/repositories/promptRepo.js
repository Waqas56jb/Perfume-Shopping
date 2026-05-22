/* ─────────────────────────────────────────────────────────────────────────
 *  Prompt repository
 *  Stores edited system prompts with versioning. Only ONE row can be active.
 * ───────────────────────────────────────────────────────────────────────── */

import { supabase, throwIfError } from '../db.js';

export async function listPrompts({ limit = 50 } = {}) {
  const { data, error } = await supabase
    .from('system_prompts')
    .select('id, version, is_active, notes, created_by, created_at, content, appendix')
    .order('created_at', { ascending: false })
    .limit(limit);
  throwIfError(error, 'listPrompts');
  return data || [];
}

export async function getActivePrompt() {
  const { data, error } = await supabase
    .from('system_prompts')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();
  throwIfError(error, 'getActivePrompt');
  return data;
}

export async function createPrompt({ version, content, appendix = null, notes = null, createdBy = null, activate = false }) {
  const { data, error } = await supabase
    .from('system_prompts')
    .insert({ version, content, appendix, notes, created_by: createdBy, is_active: false })
    .select()
    .single();
  throwIfError(error, 'createPrompt');
  if (activate) await activatePrompt(data.id);
  return data;
}

export async function activatePrompt(id) {
  // Atomic-ish: deactivate all, activate one. Partial unique index prevents
  // dirty intermediate states from sticking.
  const { error: deErr } = await supabase
    .from('system_prompts')
    .update({ is_active: false })
    .eq('is_active', true);
  throwIfError(deErr, 'activatePrompt/deactivateOthers');

  const { error } = await supabase
    .from('system_prompts')
    .update({ is_active: true })
    .eq('id', id);
  throwIfError(error, 'activatePrompt/activate');
}

export async function deactivatePrompt(id) {
  const { error } = await supabase
    .from('system_prompts')
    .update({ is_active: false })
    .eq('id', id);
  throwIfError(error, 'deactivatePrompt');
}

export async function deletePrompt(id) {
  const { error } = await supabase.from('system_prompts').delete().eq('id', id);
  throwIfError(error, 'deletePrompt');
}
