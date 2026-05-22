import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  MessagesSquare,
  UsersRound,
  Boxes,
  ArrowLeftRight,
  ShieldOff,
  Sparkles,
  SlidersHorizontal,
  CircleUser,
  type LucideIcon,
} from 'lucide-react';
import { BrandMark } from './BrandMark';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}
interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Vue d'ensemble",
    items: [{ to: '/', label: 'Tableau de bord', icon: BarChart3, end: true }],
  },
  {
    label: 'Activité',
    items: [
      { to: '/conversations', label: 'Conversations', icon: MessagesSquare },
      { to: '/leads',         label: 'Prospects',     icon: UsersRound },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { to: '/products',  label: 'Catalogue',            icon: Boxes },
      { to: '/mappings',  label: 'Mappages cachés',      icon: ArrowLeftRight },
      { to: '/forbidden', label: 'Vocabulaire interdit', icon: ShieldOff },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/prompt',   label: 'Prompt IA',  icon: Sparkles },
      { to: '/settings', label: 'Paramètres', icon: SlidersHorizontal },
      { to: '/profile',  label: 'Mon compte', icon: CircleUser },
    ],
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

/**
 * Premium black sidebar with gold accents.
 * - Brand: gold corner dot on the "E" mark
 * - Active link: gold 3px left bar + subtle bg + gold-tinted text
 * - Hover: subtle white wash
 * - Group labels: gold uppercase, very small
 */
export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="w-[268px] flex-shrink-0 bg-black text-white h-full flex flex-col grain relative">
      {/* Subtle radial — adds depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_15%,rgba(255,255,255,0.06),transparent_60%)]"
      />
      {/* Gold hairline along the right edge — premium signature */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-12 bottom-12 right-0 w-px bg-gradient-to-b from-transparent via-gold-400/30 to-transparent"
      />

      <div className="relative z-10 px-6 pt-7 pb-6">
        <BrandMark size={36} variant="light" label="Administration" />
      </div>

      <nav className="relative z-10 flex-1 px-3 pb-3 overflow-y-auto scrollbar-elegant">
        <div className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="px-3.5 mb-1.5 text-[10px] uppercase tracking-elegant text-gold-400/70 font-medium">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon, end }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        [
                          'relative flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] transition-colors',
                          isActive
                            ? 'bg-white/10 text-white font-medium'
                            : 'text-white/55 hover:text-white hover:bg-white/5',
                        ].join(' ')
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gold-400 shadow-[0_0_8px_rgba(201,169,110,0.6)]"
                            />
                          )}
                          <Icon
                            size={16}
                            strokeWidth={1.7}
                            className={isActive ? 'text-gold-400' : 'text-white/45 group-hover:text-white'}
                          />
                          <span className="truncate">{label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="relative z-10 px-6 py-4 border-t border-white/10">
        <p className="text-[10px] uppercase tracking-elegant text-gold-400/70 font-medium">
          Eleganza · 2026
        </p>
        <p className="font-mono text-[10px] text-white/30 mt-0.5">Admin v0.4</p>
      </div>
    </aside>
  );
}
