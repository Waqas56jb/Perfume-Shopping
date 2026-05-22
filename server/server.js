/* ─────────────────────────────────────────────────────────────────────────
 *  Eleganza Chatbot Backend
 *
 *  Public chatbot endpoint (anonymous) — /api/chat, /api/lead, /api/session
 *  Protected admin endpoints — /api/admin/*  (bearer token via admin_sessions)
 *
 *  Storage:
 *    - In-memory rolling window for hot conversation state (legacy)
 *    - Supabase for persistence: sessions, messages, leads, settings, prompts
 *
 *  OpenAI key resolution:  admin settings > OPENAI_API_KEY env
 *  Prompt resolution:      active DB row   > prompts/system.md file
 * ───────────────────────────────────────────────────────────────────────── */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { buildSystemPrompt, getPromptStats } from './systemPrompt.js';
import {
  PRODUCTS,
  getProductById,
  detectMappedProduct,
  redactForbidden,
  findForbiddenTerm,
  inStockIds,
} from './knowledgeBase.js';
import { getProductBySlug as dbGetProductBySlug } from './repositories/productRepo.js';
import { pingDatabase } from './db.js';
import { getOpenAI } from './openaiClient.js';
import {
  createSession,
  getSession,
  getOrCreateSession,
  appendMessage,
  markLeadCaptured,
  markEscalated,
  startSessionCleanup,
  getStats,
} from './sessionStore.js';
import {
  createChatSession as dbCreateSession,
  appendChatMessage as dbAppendMessage,
  markLead as dbMarkLead,
  markEscalation as dbMarkEscalation,
} from './repositories/chatRepo.js';
import { captureLead as dbCaptureLead } from './repositories/leadRepo.js';

import { adminAuthRouter } from './routes/adminAuth.js';
import { adminDataRouter } from './routes/adminData.js';
import { requireAdmin } from './middleware/requireAdmin.js';

/* ─── Config ───────────────────────────────────────────────────────────── */
const PORT = Number(process.env.PORT || 3001);
const ALLOWED_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',').map((s) => s.trim()).filter(Boolean);
// If "*" is in the list, CORS is permissive (dev/internal use). For prod,
// keep an explicit allowlist and remove "*".
const CORS_OPEN = ALLOWED_ORIGINS.includes('*');

if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠ OPENAI_API_KEY not set in env. The server will rely on admin-configured key from Supabase app_settings.');
}

/* ─── Tool definition — built per-request so product_ids enum matches the
 *     LIVE DB catalog. New products added in the admin panel become valid
 *     recommendations on the very next chat turn.                          */
function buildReplyTool(productIdEnum) {
  const ids = productIdEnum && productIdEnum.length > 0 ? productIdEnum : inStockIds();
  return {
    type: 'function',
    function: {
      name: 'reply_to_customer',
      description:
        'Send your reply to the customer. This is the only channel — include your full natural French (or matching-language) reply text here, plus any structured side-data the UI needs (product recommendations, quick-reply chips, lead-capture intent, escalation flag).',
      parameters: {
        type: 'object',
        properties: {
          reply: { type: 'string', description: 'Your natural reply to the customer.' },
          intent: {
            type: 'string',
            enum: ['welcome','discovery','pitch','objection','upsell','close','lead-capture','escalation','smalltalk','faq','out-of-stock'],
          },
          product_ids: {
            type: 'array', maxItems: 3,
            items: { type: 'string', enum: ids },
          },
          quick_replies: {
            type: 'array', maxItems: 4,
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                value: { type: 'string' },
              },
              required: ['label', 'value'],
            },
          },
          capture_lead: { type: 'boolean' },
          escalate_to_human: { type: 'boolean' },
          /* Customer-detail extraction — whenever the customer reveals
             any of these in their messages, copy the value here so the
             server can persist it to chat_leads and the admin can ship
             the parcel without ever leaving the panel. */
          customer_name:    { type: 'string', description: 'First name or full name the customer just provided. Omit if not mentioned.' },
          customer_email:   { type: 'string', description: 'Email address the customer provided.' },
          customer_phone:   { type: 'string', description: 'Phone number the customer provided.' },
          customer_address: { type: 'string', description: 'Shipping address the customer provided.' },
          order_intent:     { type: 'boolean', description: 'True when the customer confirms they want to order.' },
        },
        required: ['reply', 'intent'],
      },
    },
  };
}

/* ─── Express app ──────────────────────────────────────────────────────── */
const app = express();
app.use(express.json({ limit: '64kb' }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                  // curl, server-to-server
    if (CORS_OPEN) return cb(null, true);                // CLIENT_ORIGIN includes "*"
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Permit any localhost / 127.0.0.1 / private LAN origin during dev,
    // regardless of port — this stops Vite's network IP from breaking auth.
    if (/^https?:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin)) {
      return cb(null, true);
    }
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: false,
}));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/* ─── Health & info ────────────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'eleganza-chatbot',
    products: PRODUCTS.length,
    inStock: inStockIds().length,
    prompt: getPromptStats(),
    sessions: getStats(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/db-health', async (_req, res) => {
  const probe = await pingDatabase();
  if (!probe.ok) {
    return res.status(503).json({
      ok: false,
      error: probe.error,
      code: probe.code,
      hint:
        probe.code === '42P01'
          ? 'Schema not installed — run db/schema.sql in the Supabase SQL editor.'
          : 'Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.',
    });
  }
  res.json({ ok: true, adminCount: probe.adminCount, supabaseUrl: process.env.SUPABASE_URL });
});

/* ─── Admin routes (auth + data) ───────────────────────────────────────── */
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin', requireAdmin, adminDataRouter);

/* ─── Public chatbot session endpoints ─────────────────────────────────── */
app.post('/api/session', (req, res) => {
  const { language, meta } = req.body || {};
  const session = createSession({ language: language || 'fr', meta: meta || {} });
  res.json({ sessionId: session.id, language: session.language });
});

app.get('/api/session/:id', (req, res) => {
  const s = getSession(req.params.id);
  if (!s) return res.status(404).json({ error: 'Session not found or expired.' });
  res.json({
    sessionId: s.id, language: s.language, messages: s.messages,
    profile: s.profile, leadCaptured: s.leadCaptured, escalated: s.escalated, createdAt: s.createdAt,
  });
});

/* ─── Helpers ──────────────────────────────────────────────────────────── */
function detectLanguage(text) {
  if (!text) return 'fr';
  const lower = text.toLowerCase();
  if (/\b(the|hello|hi|please|thanks|i want|i need|for my|gift|order)\b/.test(lower)) return 'en';
  if (/[؀-ۿ]/.test(text)) return 'ar';
  return 'fr';
}

async function hydrateProducts(ids) {
  const out = [];
  for (const id of ids || []) {
    // Prefer DB row (so newly added products show up in chat cards)
    let p = null;
    try { p = await dbGetProductBySlug(id); } catch { /* fallthrough */ }
    if (p && p.in_stock) {
      out.push({
        id: p.slug,
        name: p.name,
        tagline: p.tagline,
        family: p.family,
        notes: { tete: p.notes_tete || [], coeur: p.notes_coeur || [], fond: p.notes_fond || [] },
        gender: p.gender,
        season: p.season || [],
        intensity: p.intensity || 4,
        sillage: p.sillage || 4,
        longevity: p.longevity || 4,
        price: Number(p.price) || 0,
        oldPrice: p.old_price ? Number(p.old_price) : undefined,
        inStock: p.in_stock,
        url: p.url || '#',
      });
      continue;
    }
    // Fallback to in-memory knowledgeBase
    const k = getProductById(id);
    if (k && k.inStock) out.push(k);
  }
  return out;
}

function parseToolCall(toolCalls) {
  if (!Array.isArray(toolCalls)) return null;
  const call = toolCalls.find((tc) => tc?.function?.name === 'reply_to_customer');
  if (!call) return null;
  try { return JSON.parse(call.function.arguments || '{}'); } catch { return null; }
}

function normalizeReply(raw) {
  const safeArr = (v) => (Array.isArray(v) ? v : []);
  const cleanStr = (v, max = 200) => {
    if (typeof v !== 'string') return null;
    const s = v.trim();
    return s.length > 0 ? s.slice(0, max) : null;
  };
  return {
    reply: typeof raw?.reply === 'string' ? raw.reply.trim() : '',
    intent: typeof raw?.intent === 'string' ? raw.intent : 'smalltalk',
    product_ids: safeArr(raw?.product_ids).slice(0, 3),
    quick_replies: safeArr(raw?.quick_replies)
      .slice(0, 4)
      .map((q) => ({
        label: String(q?.label ?? '').slice(0, 40),
        value: String(q?.value ?? q?.label ?? '').slice(0, 200),
      }))
      .filter((q) => q.label && q.value),
    capture_lead: Boolean(raw?.capture_lead),
    escalate_to_human: Boolean(raw?.escalate_to_human),
    customer_name:    cleanStr(raw?.customer_name, 80),
    customer_email:   cleanStr(raw?.customer_email, 120),
    customer_phone:   cleanStr(raw?.customer_phone, 30),
    customer_address: cleanStr(raw?.customer_address, 240),
    order_intent:     Boolean(raw?.order_intent),
  };
}

function fallbackReply() {
  return {
    reply:
      "Je rencontre un instant de silence — pourriez-vous reformuler votre demande ? " +
      'Je suis là pour vous guider parmi nos créations.',
    intent: 'smalltalk',
    product_ids: [],
    quick_replies: [
      { label: 'Voir les best-sellers', value: 'Montrez-moi vos meilleures ventes' },
      { label: 'Découvrir par famille', value: 'Je veux explorer par famille olfactive' },
    ],
    capture_lead: false,
    escalate_to_human: false,
  };
}

/* ─── Chat endpoint ────────────────────────────────────────────────────── */
app.post('/api/chat', async (req, res) => {
  const startedAt = Date.now();
  try {
    const { sessionId: incomingId, message, language } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Missing or empty "message".' });
    }
    if (message.length > 2000) {
      return res.status(413).json({ error: 'Message too long (2000 char max).' });
    }

    /* Session — in-memory (hot context) */
    const session = getOrCreateSession(incomingId, { language: language || detectLanguage(message) });
    const detected = detectLanguage(message);
    if (detected !== session.language) session.language = detected;

    /* Persist session to DB on first turn */
    if (!session.dbId) {
      try {
        const dbRow = await dbCreateSession({
          language: session.language,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          referrer: req.headers.referer,
        });
        session.dbId = dbRow.id;
      } catch (err) {
        console.warn('DB session create failed (continuing in-memory):', err.message);
      }
    }

    /* Pre-LLM router */
    const routedProductHint = detectMappedProduct(message);
    const detectedForbidden = findForbiddenTerm(message);

    /* Build system prompt (DB > file) + live catalog */
    const { prompt: systemPrompt, productIds: liveProductIds } = await buildSystemPrompt({
      routedProductHint, customerLanguage: session.language,
    });

    const history = session.messages.map((m) => ({ role: m.role, content: m.content }));
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    /* OpenAI call — tool enum built from the live catalog */
    let completion, modelUsed = null;
    const REPLY_TOOL_DYNAMIC = buildReplyTool(liveProductIds);
    try {
      const { client, config } = await getOpenAI();
      modelUsed = config.model;
      completion = await client.chat.completions.create({
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        messages,
        tools: [REPLY_TOOL_DYNAMIC],
        tool_choice: { type: 'function', function: { name: 'reply_to_customer' } },
        parallel_tool_calls: false,
      });
    } catch (apiErr) {
      console.error('OpenAI error:', apiErr?.message || apiErr);
      appendMessage(session.id, { role: 'user', content: message });
      const fb = fallbackReply();
      appendMessage(session.id, { role: 'assistant', content: fb.reply });
      return res.status(502).json({
        sessionId: session.id,
        reply: fb.reply, intent: fb.intent,
        products: [], productIds: [], quickReplies: fb.quick_replies,
        captureLead: false, escalateToHuman: false,
        meta: { error: 'upstream_error', message: apiErr?.message || 'upstream' },
      });
    }

    const assistantMsg = completion.choices?.[0]?.message;
    let normalized = normalizeReply(parseToolCall(assistantMsg?.tool_calls) || {});
    if (!normalized.reply) normalized = { ...fallbackReply() };

    /* Safety net — redact any forbidden term that slipped through */
    const { text: cleanReply, redacted } = redactForbidden(normalized.reply);
    if (redacted.length > 0) {
      console.warn('⚠ Model leaked forbidden terms (redacted):', redacted);
    }

    /* Hydrate product objects (DB first → newly added products show up) */
    const products = await hydrateProducts(normalized.product_ids);

    /* Persist turn — in-memory + DB */
    appendMessage(session.id, { role: 'user', content: message });
    appendMessage(session.id, { role: 'assistant', content: cleanReply });

    /* Auto-capture extracted customer details — agent fills in
       customer_email / name / phone / address whenever the user types them.
       Any of these turns the session into a lead the admin can act on. */
    const hasAnyCustomerDetail =
      normalized.customer_email ||
      normalized.customer_name ||
      normalized.customer_phone ||
      normalized.customer_address;

    if (hasAnyCustomerDetail || normalized.capture_lead) {
      const leadPayload = {
        email: normalized.customer_email,
        name: normalized.customer_name,
        phone: normalized.customer_phone,
      };
      markLeadCaptured(session.id, leadPayload);
      if (session.dbId) {
        try {
          await dbMarkLead(session.dbId, leadPayload);
          if (normalized.customer_email) {
            await dbCaptureLead({
              sessionId: session.dbId,
              email: normalized.customer_email,
              name: normalized.customer_name || null,
              phone: normalized.customer_phone || null,
              source: 'chatbot',
              notes: [
                normalized.customer_address ? `Adresse: ${normalized.customer_address}` : null,
                normalized.order_intent ? 'Intention de commande confirmée.' : null,
                normalized.product_ids.length ? `Intéressé(e) par: ${normalized.product_ids.join(', ')}` : null,
              ].filter(Boolean).join(' · ') || null,
            });
          }
        } catch (err) {
          console.warn('DB lead capture (auto) failed:', err.message);
        }
      }
    }
    if (normalized.escalate_to_human) markEscalated(session.id, normalized.intent);

    if (session.dbId) {
      const latencyMs = Date.now() - startedAt;
      try {
        await dbAppendMessage({
          sessionId: session.dbId, role: 'user', content: message,
        });
        await dbAppendMessage({
          sessionId: session.dbId, role: 'assistant', content: cleanReply,
          intent: normalized.intent,
          suggestedProductIds: normalized.product_ids,
          quickReplies: normalized.quick_replies,
          detectedForbidden, redactedTerms: redacted,
          routedProductId: routedProductHint,
          captureLead: normalized.capture_lead,
          escalateToHuman: normalized.escalate_to_human,
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
          model: modelUsed, latencyMs,
        });
        if (normalized.capture_lead) await dbMarkLead(session.dbId, {});
        if (normalized.escalate_to_human) await dbMarkEscalation(session.dbId, normalized.intent);
      } catch (err) {
        console.warn('DB message persist failed:', err.message);
      }
    }

    res.json({
      sessionId: session.id,
      reply: cleanReply, intent: normalized.intent,
      products, productIds: normalized.product_ids,
      quickReplies: normalized.quick_replies,
      captureLead: normalized.capture_lead,
      escalateToHuman: normalized.escalate_to_human,
      meta: {
        routedFrom: routedProductHint || null,
        detectedForbidden, redacted,
        language: session.language,
        usage: completion.usage, model: modelUsed,
      },
    });
  } catch (err) {
    console.error('Chat handler error:', err);
    res.status(500).json({ error: 'internal_error', message: err?.message || 'Unknown error' });
  }
});

/* ─── Lead capture endpoint (public) ───────────────────────────────────── */
app.post('/api/lead', async (req, res) => {
  const { sessionId, email, name, phone, marketingOptIn } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  const s = getSession(sessionId);
  if (!s) return res.status(404).json({ error: 'Session not found.' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email.' });
  }
  markLeadCaptured(sessionId, { email, name, phone });
  if (s.dbId) {
    try {
      await dbMarkLead(s.dbId, { email, name, phone });
      await dbCaptureLead({ sessionId: s.dbId, email, name, phone, marketingOptIn: Boolean(marketingOptIn) });
    } catch (err) {
      console.warn('DB lead persist failed:', err.message);
    }
  }
  res.json({ ok: true, profile: s.profile });
});

/* ─── 404 ──────────────────────────────────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ error: 'not_found' }));

/* ─── Boot ─────────────────────────────────────────────────────────────── */
startSessionCleanup();
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Eleganza Chatbot Backend                                    ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Listening      http://localhost:${String(PORT).padEnd(28, ' ')}║`);
  console.log(`║  Catalog        ${(`${PRODUCTS.length} (${inStockIds().length} in stock)`).padEnd(45, ' ')}║`);
  console.log(`║  CORS           ${ALLOWED_ORIGINS.join(', ').slice(0, 45).padEnd(45, ' ')}║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Public endpoints                                            ║');
  console.log('║    GET  /api/health        /api/db-health                    ║');
  console.log('║    POST /api/session       /api/chat       /api/lead         ║');
  console.log('║  Admin endpoints (bearer token)                              ║');
  console.log('║    POST /api/admin/auth/login   /forgot-password   /reset    ║');
  console.log('║    GET  /api/admin/auth/me                                   ║');
  console.log('║    GET  /api/admin/stats/{overview,daily,intents,...}        ║');
  console.log('║    GET  /api/admin/conversations  /:id                       ║');
  console.log('║    GET  /api/admin/leads          /leads/export.csv          ║');
  console.log('║    GET  /api/admin/products  /dupe-mappings  /forbidden      ║');
  console.log('║    GET  /api/admin/settings  PATCH /api/admin/settings       ║');
  console.log('║    GET  /api/admin/prompts   POST  /api/admin/prompts        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('  ✎ Edit prompts/system.md (file) or push from /admin/prompts (DB)');
  console.log('');
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
