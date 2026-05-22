import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Bell, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar, NAV_GROUPS } from './Sidebar';
import { getStoredUser, logout } from '../lib/auth';

/**
 * Two-column layout:
 *   ┌──────────┬─────────────────────────────┐
 *   │          │  topbar (sticky inside main)│
 *   │ sidebar  ├─────────────────────────────┤
 *   │  fixed   │  scrollable content         │
 *   │  height  │                             │
 *   └──────────┴─────────────────────────────┘
 *
 * The whole viewport is `h-screen overflow-hidden`. Only the right-hand
 * <main> scrolls. That stops the sidebar from drifting upward when the
 * user scrolls the page.
 */
export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Resolve the current page title from the nav config so the topbar
  // displays the right label without each page having to handle it.
  const allNav = NAV_GROUPS.flatMap((g) => g.items);
  const currentNav = allNav.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      {/* ─── Sidebar — desktop ─── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* ─── Sidebar — mobile drawer ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-40 lg:hidden"
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Right column ─── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Topbar — anchored inside the scroll container so it doesn't
            scroll away. flex-shrink-0 keeps its height stable. */}
        <header className="flex-shrink-0 h-16 border-b border-neutral-200 bg-white">
          <div className="h-full px-5 lg:px-8 flex items-center gap-3">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden -ml-2 w-9 h-9 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors flex items-center justify-center"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Crumb — page title */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] uppercase tracking-elegant text-neutral-400">
                Eleganza
              </span>
              <span className="text-neutral-300">/</span>
              <h2 className="text-[14px] font-medium text-black truncate">
                {currentNav?.label || 'Administration'}
              </h2>
            </div>

            {/* Search (decorative for now) */}
            <div className="hidden md:flex items-center gap-2 ml-6 flex-1 max-w-md">
              <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 h-9 flex-1 focus-within:border-black/30 focus-within:bg-white transition-colors">
                <Search size={14} className="text-neutral-400" strokeWidth={1.8} />
                <input
                  type="search"
                  placeholder="Rechercher…"
                  className="flex-1 bg-transparent text-[13px] text-black placeholder:text-neutral-400 focus:outline-none"
                />
                <kbd className="hidden xl:inline-flex items-center px-1.5 h-5 text-[10px] font-mono text-neutral-400 bg-white border border-neutral-200 rounded">
                  ⌘ K
                </kbd>
              </div>
            </div>

            <div className="flex-1 md:hidden" />

            {/* Right cluster */}
            <div className="flex items-center gap-1.5 ml-auto md:ml-0">
              <button
                type="button"
                aria-label="Notifications"
                className="w-9 h-9 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors flex items-center justify-center relative"
              >
                <Bell size={16} strokeWidth={1.8} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full ring-2 ring-white" />
              </button>

              <div className="ml-1.5 pl-3 border-l border-neutral-200 flex items-center gap-3">
                <div className="text-right hidden sm:block leading-tight">
                  <p className="text-[12.5px] text-black font-medium">{user?.name || 'Administrateur'}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    {user?.role || 'admin'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Déconnexion"
                  className="w-9 h-9 rounded-lg text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors flex items-center justify-center"
                >
                  <LogOut size={15} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable main — the only thing that scrolls */}
        <main className="flex-1 overflow-y-auto scrollbar-elegant">
          <div className="px-5 lg:px-10 py-8 lg:py-10 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
