# Eleganza · Chatbot Backend

OpenAI-powered fragrance advisor for the Eleganza Parfums website. Single Express app exposing the chat endpoint. Admin-panel APIs come later.

## Architecture

```
client (React) ──HTTP──▶ /api/chat ──▶ OpenAI (gpt-4o-mini, JSON-mode)
                              │
                              ├─ inspiration router  (pre-LLM hint, hidden mapping)
                              ├─ safety filter       (post-LLM redaction of banned terms)
                              ├─ product hydration   (id → full catalog object)
                              └─ session memory      (in-memory, 16-turn rolling window)
```

## Files

| File                | Purpose                                                            |
| ------------------- | ------------------------------------------------------------------ |
| `server.js`         | Express app, endpoints, OpenAI orchestration, safety net.          |
| `systemPrompt.js`   | Builds the master prompt from the knowledge base on every turn.    |
| `knowledgeBase.js`  | Catalog, hidden dupe-map, business facts, forbidden vocabulary.    |
| `sessionStore.js`   | In-memory conversation store with TTL and rolling-window cap.      |
| `package.json`      | Dependencies (express, openai, cors, dotenv).                      |
| `.env.example`      | Required environment variables.                                    |

## Setup

```bash
cd server
cp .env.example .env       # (Windows: copy .env.example .env)
# then edit .env and set OPENAI_API_KEY
npm install
npm run dev                # auto-reload on file changes (Node ≥ 18.17)
# or: npm start
```

The server prints a banner with the listening URL and the active model.

## Endpoints

### `GET /api/health`
Liveness + info — returns model, catalog size, and live session count.

### `POST /api/session`
Create a fresh session. Body (optional): `{ "language": "fr", "meta": { ... } }` → returns `{ sessionId, language }`.

### `GET /api/session/:id`
Fetch the full state of a session (messages, profile, flags).

### `POST /api/chat`  ← the main endpoint
Request:
```json
{ "sessionId": "uuid (optional)", "message": "Bonjour", "language": "fr (optional)" }
```
Response:
```json
{
  "sessionId": "…",
  "reply": "Bonjour, et bienvenue chez Eleganza. …",
  "intent": "welcome",
  "products": [ { "id": "rouge-240", "name": "ROUGE 240", "notes": { … }, … } ],
  "productIds": ["rouge-240"],
  "quickReplies": [ { "label": "…", "value": "…" } ],
  "captureLead": false,
  "escalateToHuman": false,
  "meta": { "routedFrom": null, "detectedForbidden": null, "redacted": [], "language": "fr", "usage": { … }, "model": "gpt-4o-mini" }
}
```

### `POST /api/lead`
Called by the client when the user provides their email after the agent flips `capture_lead`. Stores the profile on the session.

## The "never name the brand" rule — how it's enforced

Three layers of defense:

1. **Prompt engineering (primary)** — The system prompt contains the full forbidden vocabulary, multiple instructions and few-shot examples teaching the model to acknowledge the *universe* a customer evokes without ever naming the original brand.
2. **Pre-LLM router (hint)** — Before calling the model, the server scans the user message for any trigger from the dupe map. When found, the matching Eleganza product id is injected into the prompt so the model knows exactly which product to pitch.
3. **Post-LLM redaction (safety net)** — Every model output is scanned for any forbidden term and silently redacted with the neutral phrase *"cette inspiration olfactive"* before it ships to the client. Every redaction is logged.

## Tuning

`.env` knobs (with sensible defaults):
- `OPENAI_MODEL` — `gpt-4o-mini` (fast & cheap) or `gpt-4o` (higher quality).
- `OPENAI_TEMPERATURE` — `0.55`. Higher = more creative replies, lower = more deterministic.
- `OPENAI_MAX_TOKENS` — `600`. Caps reply length & cost.
- `MAX_HISTORY_TURNS` — `16`. Rolling memory window.
- `SESSION_TTL_MINUTES` — `180`. Stale sessions are dropped from memory.
- `CLIENT_ORIGIN` — comma-separated CORS allowlist (add the production domain when deploying).

## Smoke test (curl)

```bash
curl -sX POST http://localhost:3001/api/chat \
  -H "content-type: application/json" \
  -d '{ "message": "Je cherche un parfum comme Baccarat Rouge 540" }' | jq .
```

Expected: the reply acknowledges the universe but never names the original brand; the `products` array contains `rouge-240`; `meta.routedFrom` shows `rouge-240`.

## Production notes

- Swap the in-memory `sessionStore.js` for Redis (key = sessionId, value = JSON) when you need persistence.
- Add a rate-limit layer per IP (e.g. `express-rate-limit`) before deploying publicly.
- Stream responses via Server-Sent Events for sub-second first-token UX (add `stream: true` to the OpenAI call and pipe the deltas).
- Move the OpenAI API key to a secret manager (Vercel / 1Password / etc.).
- Add a `/api/admin/*` namespace later for the admin panel (catalog edits, conversation review, lead export).
