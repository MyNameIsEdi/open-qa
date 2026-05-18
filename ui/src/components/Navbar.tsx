import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/agents', label: 'Agents', icon: '🤖' },
  { to: '/skills', label: 'Skills', icon: '🔧' },
  { to: '/prompts', label: 'Prompts', icon: '🧠' },
  { to: '/docs', label: 'Docs', icon: '📖' },
]

export default function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)',
      }}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-6">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-base shrink-0" style={{ color: 'var(--text-main)' }}>
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-600 text-white text-sm font-bold shadow-soft">
            QA
          </span>
          <span>open-qa</span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                }`
              }
            >
              <span className="text-xs">{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* GitHub link */}
        <a
          href="https://github.com/MyNameIsEdi/intelligent-testing-toolkit"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all duration-200 shrink-0"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>GitHub</span>
        </a>
      </div>
    </header>
  )
}
