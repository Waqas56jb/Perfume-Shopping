/* ─────────────────────────────────────────────────────────────────────────
 *  OpenAI Client Factory
 *  Returns a fresh client each call so admin-configured API keys take effect
 *  without restarting the server. Cached briefly to avoid creating a new
 *  client on every chat turn.
 * ───────────────────────────────────────────────────────────────────────── */

import OpenAI from 'openai';
import { getEffectiveOpenAIConfig } from './repositories/settingsRepo.js';

const CACHE_TTL_MS = 30_000;
let cached = { client: null, key: null, loadedAt: 0 };

export async function getOpenAI() {
  const cfg = await getEffectiveOpenAIConfig();
  if (!cfg.apiKey) {
    throw new Error('No OpenAI API key configured (neither env OPENAI_API_KEY nor admin settings).');
  }

  if (
    cached.client &&
    cached.key === cfg.apiKey &&
    Date.now() - cached.loadedAt < CACHE_TTL_MS
  ) {
    return { client: cached.client, config: cfg };
  }

  const client = new OpenAI({ apiKey: cfg.apiKey });
  cached = { client, key: cfg.apiKey, loadedAt: Date.now() };
  return { client, config: cfg };
}
