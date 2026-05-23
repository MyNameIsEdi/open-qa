/**
 * Sidebar — app-wide navigation.
 *
 * "Office" is the primary hub at the top.  It has an expandable sub-menu
 * showing the tool pages.  Clicking a desk in OfficeCanvas also navigates
 * to these same routes, so they're available both ways.
 */
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Target,
  Bot,
  BookOpen,
  LayoutList,
  Activity,
  FileText,
  PlusCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useRtl } from '../hooks/useRtl';

// ─── Route definitions ────────────────────────────────────────────────────────

const GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/', label: 'Home', Icon: Home },
      { to: '/missions', label: 'Missions', Icon: Target },
      { to: '/office', label: 'QA Office', Icon: Bot },
    ],
  },
  {
    label: 'Learning',
    items: [
      { to: '/guides', label: 'Guides', Icon: BookOpen },
      { to: '/cheatsheet', label: 'Cheatsheet', Icon: LayoutList },
    ],
  },
  {
    label: 'Testing',
    items: [
      { to: '/playwright', label: 'PW Dashboard', Icon: Activity },
      { to: '/docs', label: 'Docs', Icon: FileText },
    ],
  },
  {
    label: 'Community',
    items: [{ to: '/submit', label: 'Submit Agent', Icon: PlusCircle }],
  },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const isRtl = useRtl();

  const navLinkCls = (active: boolean) => `
    flex items-center gap-3 px-3 py-2 rounded-lg text-sm
    transition-all duration-150
    ${collapsed ? 'justify-center' : ''}
    ${
      active
        ? 'bg-zinc-700 text-white font-semibold'
        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
    }
  `;

  return (
    <>
      {/* Mobile dark overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 md:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-14 bottom-0 z-40
          bg-zinc-900 flex flex-col select-none
          transition-all duration-300 ease-in-out
          ${isRtl ? 'right-0 border-l border-zinc-800' : 'left-0 border-r border-zinc-800'}
          ${collapsed ? 'w-14' : 'w-56'}
          ${open ? 'translate-x-0' : isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className={`md:hidden absolute top-3 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ${isRtl ? 'left-3' : 'right-3'}`}
          aria-label="Close menu"
        >
          <X size={15} />
        </button>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
          {/* ── STANDARD GROUPS ────────────────────────────────────────────── */}
          {GROUPS.map(({ label, items }) => (
            <div key={label}>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  collapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-8 opacity-100 mb-1'
                }`}
              >
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  {label}
                </p>
              </div>

              <div className="space-y-0.5">
                {items.map(({ to, label: itemLabel, Icon }) => {
                  const isActive =
                    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      onClick={onClose}
                      title={collapsed ? itemLabel : undefined}
                      className={navLinkCls(isActive)}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span
                        className={`truncate transition-all duration-200 ${
                          collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                        }`}
                      >
                        {itemLabel}
                      </span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── SETTINGS (bottom of scrollable area) ───────────────────────── */}
          <div>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                collapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-8 opacity-100 mb-1'
              }`}
            >
              <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Config
              </p>
            </div>
            <NavLink
              to="/settings"
              onClick={onClose}
              title={collapsed ? 'Settings' : undefined}
              className={navLinkCls(location.pathname === '/settings')}
            >
              <Settings size={16} className="shrink-0" />
              <span
                className={`truncate transition-all duration-200 ${
                  collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                }`}
              >
                Settings
              </span>
            </NavLink>
          </div>
        </nav>

        {/* Desktop collapse toggle */}
        <div className="hidden md:flex items-center justify-end p-2 border-t border-zinc-800">
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              isRtl ? (
                <ChevronLeft size={15} />
              ) : (
                <ChevronRight size={15} />
              )
            ) : isRtl ? (
              <ChevronRight size={15} />
            ) : (
              <ChevronLeft size={15} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
