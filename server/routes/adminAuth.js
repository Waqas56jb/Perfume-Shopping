/* ─────────────────────────────────────────────────────────────────────────
 *  /api/admin/auth/* — login, logout, me, forgot/reset password
 * ───────────────────────────────────────────────────────────────────────── */

import express from 'express';
import {
  findAdminByEmail,
  findAdminById,
  verifyPassword,
  updateLastLogin,
  recordFailedLogin,
  createSessionToken,
  revokeSession,
  issuePasswordReset,
  consumePasswordReset,
  updatePassword,
  revokeAllSessionsForUser,
} from '../repositories/adminRepo.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const adminAuthRouter = express.Router();

function clientIp(req) {
  return (req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || '').trim() || null;
}
function userAgent(req) {
  return req.headers['user-agent'] || null;
}

/* ─── POST /api/admin/auth/login ──────────────────────────────────────── */
adminAuthRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'bad_request', message: 'Email et mot de passe requis.' });
    }

    const user = await findAdminByEmail(email);
    if (!user || !user.is_active) {
      // Constant-time-ish — pretend to hash
      await verifyPassword(password, '$2b$12$' + 'x'.repeat(53));
      return res.status(401).json({ error: 'invalid_credentials', message: 'Identifiants invalides.' });
    }
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        error: 'account_locked',
        message: 'Compte temporairement verrouillé après trop de tentatives. Réessayez plus tard.',
      });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      const { nextAttempts, locked_until } = await recordFailedLogin(user.id, user.failed_attempts);
      return res.status(401).json({
        error: 'invalid_credentials',
        message: locked_until
          ? 'Trop de tentatives — compte verrouillé 15 minutes.'
          : `Identifiants invalides. ${5 - nextAttempts} tentatives restantes.`,
      });
    }

    const { token, expires_at } = await createSessionToken({
      userId: user.id,
      ip: clientIp(req),
      userAgent: userAgent(req),
    });
    await updateLastLogin(user.id);

    res.json({
      token,
      expiresAt: expires_at,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

/* ─── GET /api/admin/auth/me ──────────────────────────────────────────── */
adminAuthRouter.get('/me', requireAdmin, async (req, res) => {
  res.json({ user: req.admin });
});

/* ─── POST /api/admin/auth/logout ─────────────────────────────────────── */
adminAuthRouter.post('/logout', requireAdmin, async (req, res) => {
  await revokeSession(req.sessionToken);
  res.json({ ok: true });
});

/* ─── POST /api/admin/auth/forgot-password ────────────────────────────── */
adminAuthRouter.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'bad_request' });

    // Always return success — don't reveal account existence.
    const user = await findAdminByEmail(email);
    if (user && user.is_active) {
      const { token } = await issuePasswordReset({
        userId: user.id,
        ip: clientIp(req),
        userAgent: userAgent(req),
      });

      // In production: send the reset email here using your transactional
      // email provider. For dev, we surface the token in server logs ONLY.
      console.log(`📧  [DEV] Password reset link for ${email}:`);
      console.log(`    http://localhost:5174/reset-password?token=${token}`);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

/* ─── POST /api/admin/auth/reset-password ─────────────────────────────── */
adminAuthRouter.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ error: 'bad_request', message: 'Token et nouveau mot de passe requis.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'weak_password', message: 'Le mot de passe doit contenir au moins 8 caractères.' });
    }

    const consumed = await consumePasswordReset(token);
    if (!consumed) {
      return res.status(400).json({ error: 'invalid_token', message: 'Lien de réinitialisation invalide ou expiré.' });
    }

    await updatePassword(consumed.userId, password);
    // Sign the user out of all other sessions
    await revokeAllSessionsForUser(consumed.userId);

    res.json({ ok: true });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

/* ─── POST /api/admin/auth/change-password (logged in) ────────────────── */
adminAuthRouter.post('/change-password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'bad_request' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'weak_password' });
    }

    const user = await findAdminById(req.admin.id);
    const full = await findAdminByEmail(user.email);
    const ok = await verifyPassword(currentPassword, full.password_hash);
    if (!ok) return res.status(401).json({ error: 'wrong_password', message: 'Mot de passe actuel incorrect.' });

    await updatePassword(user.id, newPassword);
    await revokeAllSessionsForUser(user.id, req.sessionToken);
    res.json({ ok: true });
  } catch (err) {
    console.error('change-password error:', err);
    res.status(500).json({ error: 'internal_error' });
  }
});
