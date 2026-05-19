import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, BookOpen, FileText, Cpu, Layers, MessageSquare,
  Play, Wand2, Target, LayoutDashboard, Code2, Send,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import i18n from '../i18n'

// ─── nav tree ─────────────────────────────────────────────────────────────────
interface NavItem { to: string; label: string; labelHe: string; icon: React.ReactNode }
interface NavGroup { heading: string; headingHe: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    heading: 'Main',
    headingHe: 'ראשי',
    items: [
      { to: '/',       label: 'Home',        labelHe: 'בית',             icon: <Home size={16} /> },
      { to: '/guides', label: 'Guides',      labelHe: 'מדריכים',         icon: <BookOpen size={16} /> },
      { to: '/docs',   label: 'Docs',        labelHe: 'תיעוד',           icon: <FileText size={16} /> },
    ],
  },
  {
    heading: 'Agents & Skills',
    headingHe: 'סוכנים וכישורים',
    items: [
      { to: '/agents',  label: 'Agents',     labelHe: 'סוכנים',          icon: <Cpu size={16} /> },
      { to: '/skills',  label: 'Skills',     labelHe: 'כישורים',         icon: <Layers size={16} /> },
      { to: '/prompts', label: 'Prompts',    labelHe: 'פרומפטים',        icon: <MessageSquare size={16} /> },
    ],
  },
  {
    heading: 'Tools',
    headingHe: 'כלים',
    items: [
      { to: '/playground',  label: 'Playground',    labelHe: 'מגרש משחקים',  icon: <Play size={16} /> },
      { to: '/generate',    label: 'Test Generator', labelHe: 'מחולל טסטים', icon: <Wand2 size={16} /> },
      { to: '/playwright',  label: 'PW Dashboard',   labelHe: 'לוח Playwright',icon: <LayoutDashboard size={16} /> },
      { to: '/cheatsheet',  label: 'Cheatsheet',     labelHe: 'דף עזר',      icon: <Code2 size={16} /> },
    ],
  },
  {
    heading: 'Grow',
    headingHe: 'צמיחה',
    items: [
      { to: '/missions', label: 'Missions',      labelHe: 'משימות',        icon: <Target size={16} /> },
      { to: '/submit',   label: 'Submit Agent',  labelHe: 'שלח סוכן',      icon: <Send size={16} /> },
    ],
  },
]

// ─── props ────────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean          // desktop icon-only mode
  mobileOpen: boolean         // mobile drawer state
  onCollapse: () => void      // desktop toggle
  onMobileClose: () => void   // mobile close
}

// ─── component ────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }: SidebarProps) {
  const isHe = i18n.language === 'he'
  const { pathname } = useLocation()

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* ── Logo row ── */}
      <div className={`flex items-center h-14 px-4 border-b border-zinc-800 shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="font-black text-sm tracking-tight text-white select-none">
            OPEN<span className="text-primary-400">-QA</span>
          </span>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={onCollapse}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <ChevronLeft size={14} />}
        </button>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Nav groups ── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {NAV.map((group) => (
          <div key={group.heading} className="mb-4">
            {/* Group heading — hidden when collapsed */}
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 select-none">
                {isHe ? group.headingHe : group.heading}
              </p>
            )}
            {/* Items */}
            <div className="space-y-0.5">
              {group.items.map(({ to, label, labelHe, icon }) => {
                const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => { if (window.innerWidth < 768) onMobileClose() }}
                    className={`
                      flex items-center gap-3 rounded-lg px-2 py-2 text-sm
                      transition-all duration-150 group
                      ${isActive
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100'}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? (isHe ? labelHe : label) : undefined}
                  >
                    {/* Active indicator bar */}
                    <span className={`shrink-0 transition-colors ${isActive ? 'text-primary-400' : 'group-hover:text-zinc-200'}`}>
                      {icon}
                    </span>
                    {!collapsed && (
                      <span className="truncate">{isHe ? labelHe : label}</span>
                    )}
                    {/* Active dot when collapsed */}
                    {collapsed && isActive && (
                      <span className="absolute right-1.5 w-1.5 h-1.5 rounded-full bg-primary-400" />
                    )}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Bottom brand strip ── */}
      {!collapsed && (
        <div className="shrink-0 px-4 py-3 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-600 select-none">
            {isHe ? 'v1.0 · קוד פתוח' : 'v1.0 · Open Source'}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={`
          hidden md:flex flex-col shrink-0
          bg-zinc-900 border-e border-zinc-800
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-14' : 'w-56'}
          relative overflow-hidden
        `}
        style={{ height: '100vh', position: 'sticky', top: 0 }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer ── */}
      {/* Overlay */}
      <div
        onClick={onMobileClose}
        className={`
          md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />
      {/* Drawer panel */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 z-50 h-full w-64
          bg-zinc-900 border-e border-zinc-800
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
