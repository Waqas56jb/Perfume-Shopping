/* ─────────────────────────────────────────────────────────────────────────
 *  /api/admin/* — protected data + admin actions
 *  All routes require requireAdmin middleware (mounted from server.js).
 * ───────────────────────────────────────────────────────────────────────── */

import express from 'express';
import { supabase, throwIfError } from '../db.js';
import {
  getOverview,
  getDailySeries,
  getTopIntents,
  getTopProductSuggestions,
  getRedactionEvents,
} from '../repositories/statsRepo.js';
import { listRecentConversations } from '../repositories/chatRepo.js';
import { listLeads } from '../repositories/leadRepo.js';
import {
  listProducts,
  listDupeMappings,
  listForbiddenTerms,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug,
} from '../repositories/productRepo.js';
import {
  getMaskedSettings,
  setManySettings,
  invalidateCache as invalidateSettingsCache,
  getSetting,
} from '../repositories/settingsRepo.js';
import { listPrompts, getActivePrompt, createPrompt, activatePrompt, deactivatePrompt, deletePrompt } from '../repositories/promptRepo.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const adminDataRouter = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPT_FILE_PATH = path.join(__dirname, '..', 'prompts', 'system.md');

/* ════════════════ STATS / DASHBOARD ════════════════ */

adminDataRouter.get('/stats/overview', async (_req, res) => {
  try {
    const overview = await getOverview();
    res.json(overview);
  } catch (err) {
    console.error('stats/overview:', err);
    res.status(500).json({ error: 'internal_error', message: err.message });
  }
});

/**
 * Periodic breakdown — today / week / month / year.
 * Returns visits (chat_sessions), leads, estimated revenue.
 * "Lead value" is configurable via app_settings.lead_value (default 40 EUR).
 */
adminDataRouter.get('/stats/periods', async (_req, res) => {
  try {
    const leadValue = Number(await getSetting('lead_value')) || 40;

    const now = new Date();
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek  = new Date(startOfDay); startOfWeek.setDate(startOfDay.getDate() - 6);    // last 7 days
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear  = new Date(now.getFullYear(), 0, 1);

    async function countSince(table, col, since) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .gte(col, since.toISOString());
      throwIfError(error, `countSince/${table}`);
      return count || 0;
    }

    const [vT, vW, vM, vY] = await Promise.all([
      countSince('chat_sessions', 'created_at', startOfDay),
      countSince('chat_sessions', 'created_at', startOfWeek),
      countSince('chat_sessions', 'created_at', startOfMonth),
      countSince('chat_sessions', 'created_at', startOfYear),
    ]);
    const [lT, lW, lM, lY] = await Promise.all([
      countSince('chat_leads', 'created_at', startOfDay),
      countSince('chat_leads', 'created_at', startOfWeek),
      countSince('chat_leads', 'created_at', startOfMonth),
      countSince('chat_leads', 'created_at', startOfYear),
    ]);

    const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);

    res.json({
      leadValueEur: leadValue,
      visits:      { today: vT, week: vW, month: vM, year: vY },
      leads:       { today: lT, week: lW, month: lM, year: lY },
      revenue: {
        today: lT * leadValue,
        week:  lW * leadValue,
        month: lM * leadValue,
        year:  lY * leadValue,
      },
      conversion: {
        today: pct(lT, vT),
        week:  pct(lW, vW),
        month: pct(lM, vM),
        year:  pct(lY, vY),
      },
    });
  } catch (err) {
    console.error('stats/periods:', err);
    res.status(500).json({ error: 'internal_error', message: err.message });
  }
});

adminDataRouter.get('/stats/daily', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || '14', 10), 90);
    res.json({ days, series: await getDailySeries(days) });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.get('/stats/intents', async (_req, res) => {
  try { res.json({ intents: await getTopIntents(8) }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.get('/stats/top-products', async (_req, res) => {
  try { res.json({ products: await getTopProductSuggestions(10) }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.get('/stats/redactions', async (_req, res) => {
  try { res.json({ events: await getRedactionEvents(25) }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

/* ════════════════ CONVERSATIONS ════════════════ */

adminDataRouter.get('/conversations', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const offset = parseInt(req.query.offset || '0', 10);
    res.json({ items: await listRecentConversations({ limit, offset }), limit, offset });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: session, error: sErr } = await supabase
      .from('chat_sessions').select('*').eq('id', id).maybeSingle();
    throwIfError(sErr, 'getSession');
    if (!session) return res.status(404).json({ error: 'not_found' });

    const { data: messages, error: mErr } = await supabase
      .from('chat_messages').select('*').eq('session_id', id)
      .order('created_at', { ascending: true });
    throwIfError(mErr, 'getMessages');

    res.json({ session, messages: messages || [] });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

/* ════════════════ LEADS ════════════════ */

adminDataRouter.get('/leads', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const offset = parseInt(req.query.offset || '0', 10);
    res.json({ items: await listLeads({ limit, offset }), limit, offset });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.get('/leads/export.csv', async (_req, res) => {
  try {
    const items = await listLeads({ limit: 5000, offset: 0 });
    const headers = ['email','name','phone','source','marketing_opt_in','created_at'];
    const rows = items.map((l) => headers.map((h) => {
      const v = l[h] ?? '';
      return /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g,'""')}"` : String(v);
    }).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="eleganza-leads.csv"');
    res.send(csv);
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

/* ════════════════ CATALOG — full CRUD ════════════════ */

adminDataRouter.get('/products', async (req, res) => {
  try {
    const inStockOnly = req.query.inStockOnly === 'true';
    res.json({ items: await listProducts({ inStockOnly }) });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.get('/products/:slug', async (req, res) => {
  try {
    const p = await getProductBySlug(req.params.slug);
    if (!p) return res.status(404).json({ error: 'not_found' });
    res.json({ product: p });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.post('/products', async (req, res) => {
  try {
    if (!req.body?.name) return res.status(400).json({ error: 'bad_request', message: 'name est requis.' });
    const created = await createProduct(req.body || {});
    res.json({ product: created });
  } catch (err) {
    const msg = err?.message || 'internal_error';
    const code = String(msg).includes('duplicate key') ? 409 : 500;
    res.status(code).json({ error: code === 409 ? 'duplicate_slug' : 'internal_error', message: msg });
  }
});

adminDataRouter.patch('/products/:slug', async (req, res) => {
  try {
    const updated = await updateProduct(req.params.slug, req.body || {});
    res.json({ product: updated });
  } catch (err) {
    res.status(500).json({ error: 'internal_error', message: err?.message });
  }
});

adminDataRouter.delete('/products/:slug', async (req, res) => {
  try {
    await deleteProduct(req.params.slug);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'internal_error', message: err?.message });
  }
});

adminDataRouter.get('/dupe-mappings', async (_req, res) => {
  try { res.json({ items: await listDupeMappings({ activeOnly: false }) }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.get('/forbidden-terms', async (_req, res) => {
  try { res.json({ items: await listForbiddenTerms({ activeOnly: false }) }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

/* ════════════════ SETTINGS ════════════════ */

adminDataRouter.get('/settings', async (_req, res) => {
  try { res.json({ settings: await getMaskedSettings() }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.patch('/settings', async (req, res) => {
  try {
    const allowed = ['openai_api_key','openai_model','openai_temperature','openai_max_tokens','active_prompt_id','lead_value'];
    const patch = {};
    for (const k of allowed) {
      if (k in (req.body || {})) patch[k] = req.body[k];
    }
    if (Object.keys(patch).length === 0)
      return res.status(400).json({ error: 'bad_request', message: 'Aucun paramètre valide fourni.' });
    await setManySettings(patch, req.admin.id);
    invalidateSettingsCache();
    res.json({ ok: true, updated: Object.keys(patch) });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

/* ════════════════ PROMPT EDITOR ════════════════ */

adminDataRouter.get('/prompts', async (_req, res) => {
  try { res.json({ items: await listPrompts({ limit: 50 }) }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.get('/prompts/active', async (_req, res) => {
  try { res.json({ prompt: await getActivePrompt() }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

/**
 * Returns the EFFECTIVE prompt — DB active if present, otherwise the file.
 * This is what the admin needs to see + edit.
 */
adminDataRouter.get('/prompts/effective', async (_req, res) => {
  try {
    const active = await getActivePrompt();
    if (active) {
      return res.json({ source: 'db', version: active.version, content: active.content, appendix: active.appendix });
    }
    // Fallback to file
    let fileContent = '';
    try {
      fileContent = readFileSync(PROMPT_FILE_PATH, 'utf8');
    } catch (err) {
      return res.status(500).json({ error: 'internal_error', message: 'Impossible de lire prompts/system.md: ' + err.message });
    }
    res.json({ source: 'file', version: 'system.md', content: fileContent, appendix: null });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.post('/prompts', async (req, res) => {
  try {
    const { version, content, appendix, notes, activate } = req.body || {};
    if (!version || !content)
      return res.status(400).json({ error: 'bad_request', message: 'version et content sont requis.' });
    const p = await createPrompt({
      version, content, appendix: appendix || null, notes: notes || null,
      createdBy: req.admin.id, activate: Boolean(activate),
    });
    res.json({ prompt: p });
  } catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.post('/prompts/:id/activate', async (req, res) => {
  try { await activatePrompt(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.post('/prompts/:id/deactivate', async (req, res) => {
  try { await deactivatePrompt(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});

adminDataRouter.delete('/prompts/:id', async (req, res) => {
  try { await deletePrompt(req.params.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: 'internal_error', message: err.message }); }
});
