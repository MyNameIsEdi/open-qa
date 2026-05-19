import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, Target, Bot, Zap, FileCode2, MessageSquare, Wrench,
  BookOpen, LayoutList, Activity, FileText, PlusCircle,
  X, ChevronLeft, ChevronRight,
} from 'lucide-react'

// ─── Nav structure ────────────────────────────────────────────────────────────

const GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/',         label: 'Home',         Icon: Home },
      { to: '/missions', label: 'Missions',      Icon: Target },
    ],
  },
  {
    label: 'Toolkit',
    items: [
      { to: '/agents',     label: 'Agents',      Icon: Bot },
      { to: '/playground', label: 'Playground',  Icon: Zap },
      { to: '/generate',   label: 'Generate',    Icon: FileCode2 },
      { to: '/prompts',    label: 'Prompts',     Icon: MessageSquare },
      { to: '/skills',     label: 'Skills',      Icon: Wrench },
    ],
  },
  {
    label: 'Learning',
    items: [
      { to: '/guides',     label: 'Guides',      Icon: BookOpen },
      { to: '/cheatsheet', label: 'Cheatsheet',  Icon: LayoutList },
    ],
  },
  {
    label: 'Testing',
    items: [
      { to: '/playwright', label: 'PW Dashboard', Icon: Activity },
      { to: '/docs',        label: 'Docs',         Icon: FileText },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/submit', label: 'Submit Agent', Icon: PlusCircle },
    ],
  },
] as const

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const location = useLocation()

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
          fixed left-0 top-14 bottom-0 z-40
          bg-zinc-900 border-r border-zinc-800
          flex flex-col select-none
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-14' : 'w-56'}
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Close menu"
        >
          <X size={15} />
        </button>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
          {GROUPS.map(({ label, items }) => (
            <div key={label}>
              {/* Group heading — fades out when collapsed */}
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
                    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

                  return (
                    <NavLink
                      key={to}
                      to={to}
                      end={to === '/'}
                      onClick={onClose}
                      title={collapsed ? itemLabel : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                        transition-all duration-150
                        ${collapsed ? 'justify-center' : ''}
                        ${
                          isActive
                            ? 'bg-zinc-700 text-white font-semibold'
                            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                        }
                      `}
                    >
                      <Icon size={16} className="shrink-0" />
                      {/* Label slides out smoothly on collapse */}
                      <span
                        className={`truncate transition-all duration-200 ${
                          collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                        }`}
                      >
                        {itemLabel}
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Desktop collapse toggle */}
        <div className="hidden md:flex items-center justify-end p-2 border-t border-zinc-800">
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </aside>
    </>
  )
}
