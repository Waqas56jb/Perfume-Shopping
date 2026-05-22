# Eleganza · Admin Panel Frontend

Authenticated administration console for Eleganza Parfums. This iteration ships the **auth surface only** — login, forgot-password and reset-password flows — plus a protected dashboard placeholder. Operational modules (chatbot review, catalogue editing, leads, etc.) come later.

## Stack

- Vite + React 18 + TypeScript
- TailwindCSS 3 (Eleganza tokens: cream / ink / gold + operational accents)
- React Router v6
- Framer Motion (page transitions)
- lucide-react (icons)

## Getting started

```bash
cd admin
npm install
npm run dev
```

Opens on http://localhost:5174

## Routes

| Path | Component | Purpose |
|---|---|---|
| `/login` | `LoginPage` | Email + password sign-in, "remember me", "forgot?" link |
| `/forgot-password` | `ForgotPasswordPage` | Request reset-link email |
| `/reset-password?token=…` | `ResetPasswordPage` | Set a new password (strength meter + confirm) |
| `/reset-success` | `ResetSuccessPage` | Success state with 5-second auto-redirect to `/login` |
| `/` | `DashboardPage` (protected) | Placeholder dashboard — logout + stat tiles |
| `*` | redirects to `/login` |

## Mock auth (until the backend lands)

`src/lib/auth.ts` currently simulates `/api/auth/*`:

- `login(email, password)` — accepts any valid email + password ≥ 8 chars. Test the **error path** with `wrong@eleganza.com` or password `wrongpassword`.
- `requestPasswordReset(email)` — always resolves (we don't reveal whether an account exists, security best practice).
- `resetPassword(token, password)` — requires a token ≥ 6 chars. Try `/reset-password?token=abc123`.
- `logout()` clears the local session.

Sessions are persisted in `localStorage` under `eleganza-admin-session`. When the backend ships, replace these stub functions with real `fetch(...)` calls — the rest of the app stays unchanged.

## Design tokens

| Token | Use |
|---|---|
| `bg-cream-50` | Form-side background |
| `bg-ink-900` | Brand panel, primary buttons |
| `text-ink-900` / `text-ink-300` | Body text / muted |
| `success-500` / `warn-500` / `error-500` | Form feedback alerts |
| `font-display` | Cormorant Garamond — H1 titles, brand wordmark |
| `font-sans` | Inter — UI & body |
| `tracking-elegant` | 0.15em — uppercase labels |

## Account creation

This panel deliberately ships **without a sign-up form** — admin accounts are seeded directly in the database / created by the operator. Customers requesting access are pointed to `eleganza.parfums@gmail.com`.

## Production checklist (before deploying)

- [ ] Replace `src/lib/auth.ts` stubs with real `/api/auth/*` calls.
- [ ] Switch sessions to **HTTP-only cookies** instead of `localStorage` (CSRF protection).
- [ ] Add 2-factor authentication (TOTP) on first sign-in.
- [ ] Rate-limit `/api/auth/login` and `/api/auth/forgot-password` server-side.
- [ ] Add CSP, HSTS and other security headers at the edge.
- [ ] Set up Sentry / log drain for production errors.
- [ ] Tighten password policy if you need to meet specific regulations (PCI/SOC2/etc.).
