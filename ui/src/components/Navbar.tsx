import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import GitHubIcon from '@mui/icons-material/GitHub'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import i18n from '../i18n'
import { useState, useEffect } from 'react'

const links = [
  { to: '/',           labelKey: 'nav.home' },
  { to: '/agents',     labelKey: 'nav.agents' },
  { to: '/skills',     labelKey: 'nav.skills' },
  { to: '/prompts',    labelKey: 'nav.prompts' },
  { to: '/playground', labelKey: 'nav.playground' },
  { to: '/generate',   labelKey: 'nav.generate' },
  { to: '/missions',   labelKey: 'nav.missions' },
  { to: '/guides',     labelKey: 'nav.guides' },
  { to: '/cheatsheet', labelKey: 'nav.cheatsheet' },
  { to: '/docs',       labelKey: 'nav.docs' },
]

export default function Navbar() {
  const { t } = useTranslation()
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'he' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
    document.documentElement.dir = next === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 backdrop-blur-md border-b"
      style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center gap-6">
        {/* Brand */}
        <NavLink to="/" className="flex items-center shrink-0 select-none">
          <span
            className="font-black text-base"
            style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}
          >
            OPEN<span className="text-primary-600">-QA</span>
          </span>
        </NavLink>

        {/* Nav links — center */}
        <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 justify-center">
          {links.map(({ to, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center px-3 py-1.5 rounded-lg text-sm transition-all duration-150 whitespace-nowrap ${
                  isActive
                    ? 'font-semibold text-primary-600 bg-primary-50'
                    : 'font-medium hover:bg-sand-400'
                }`
              }
              style={({ isActive }) => ({ color: isActive ? undefined : 'var(--text-muted)' })}
            >
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setDark(d => !d)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 hover:bg-sand-400"
            style={{ color: 'var(--text-muted)' }}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark
              ? <LightModeOutlinedIcon sx={{ fontSize: 17 }} />
              : <DarkModeOutlinedIcon sx={{ fontSize: 17 }} />
            }
          </button>

          <button
            onClick={toggleLang}
            className="hidden sm:flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:bg-sand-400"
            style={{ color: 'var(--text-muted)' }}
            title={i18n.language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'}
          >
            {t('lang_toggle')}
          </button>

          <a
            href="https://github.com/MyNameIsEdi/intelligent-testing-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-sand-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
            <span className="hidden md:inline">GitHub</span>
          </a>

          <NavLink
            to="/missions"
            className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 hover:bg-sand-400"
            style={{ color: 'var(--text-muted)' }}
          >
            <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />
          </NavLink>
        </div>
      </div>
    </header>
  )
}
