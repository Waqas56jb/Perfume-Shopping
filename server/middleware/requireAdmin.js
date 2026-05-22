/* ─────────────────────────────────────────────────────────────────────────
 *  requireAdmin — Express middleware
 *  Validates the Bearer token against admin_sessions, attaches `req.admin`.
 *  Use to protect any /api/admin/* route.
 * ───────────────────────────────────────────────────────────────────────── */

import { verifySessionToken } from '../repositories/adminRepo.js';

export async function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const m = auth.match(/^Bearer\s+(.+)$/i);
    const token = m ? m[1].trim() : null;

    if (!token) {
      return res.status(401).json({ error: 'unauthorized', message: 'Missing bearer token.' });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired session.' });
    }

    req.admin = session.user;
    req.sessionId = session.sessionId;
    req.sessionToken = token;
    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'forbidden', message: `Requires role: ${allowedRoles.join(', ')}` });
    }
    next();
  };
}
