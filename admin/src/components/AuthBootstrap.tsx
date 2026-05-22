import { useEffect, useState, type ReactNode } from 'react';
import { fetchMe, getStoredUser } from '../lib/auth';
import { getToken, clearToken } from '../lib/api';
import { Loader2 } from 'lucide-react';

interface AuthBootstrapProps {
  children: ReactNode;
}

/**
 * Runs once at app boot. If there's a stored token, validates it against
 * the backend (`/api/admin/auth/me`). Outcomes:
 *   - No token  → render the app immediately. ProtectedRoute will push
 *                 the user to /login.
 *   - Token OK  → render the app immediately, user stays logged in.
 *   - Token bad → silently clear it, render the app, ProtectedRoute will
 *                 push the user to /login.
 *
 * Without this guard, an expired/revoked token would let the user land on
 * a "logged-in" page where every API call fails — which feels like a crash.
 */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const [ready, setReady] = useState(() => !getToken());

  useEffect(() => {
    if (ready) return; // no token → nothing to check
    let cancelled = false;
    (async () => {
      try {
        const user = await fetchMe();
        if (!user && !cancelled) {
          clearToken();
          try { localStorage.removeItem('eleganza-admin-user'); } catch { /* ignore */ }
        }
      } catch {
        clearToken();
        try { localStorage.removeItem('eleganza-admin-user'); } catch { /* ignore */ }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [ready]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} strokeWidth={2} className="animate-spin text-gold-500" />
          <p className="text-[11.5px] uppercase tracking-elegant">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Whether the user currently appears to be authenticated. */
export function hasActiveSession(): boolean {
  return Boolean(getToken() && getStoredUser());
}
