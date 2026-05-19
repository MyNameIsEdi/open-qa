import { useState, useEffect } from 'react'
import { Menu, Moon, Sun, Globe } from 'lucide-react'
import GitHubIcon from '@mui/icons-material/GitHub'
import i18n from '../i18n'

interface TopBarProps {
  onMenuClick: () => void   // opens mobile drawer OR triggers desktop collapse
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const isHe = i18n.language === 'he'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'he' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
    document.documentElement.dir  = next === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center px-4 gap-3 border-b backdrop-blur-md shrink-0"
      style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}
    >
      {/* Hamburger — always visible */}
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-sand-400"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Toggle navigation"
      >
        <Menu size={18} />
      </button>

      {/* Logo — shown on mobile (sidebar is hidden) */}
      <span className="md:hidden font-black text-sm tracking-tight select-none" style={{ color: 'var(--text-main)' }}>
        OPEN<span className="text-primary-600">-QA</span>
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Dark mode */}
        <button
          onClick={() => setDark(d => !d)}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-sand-400"
          style={{ color: 'var(--text-muted)' }}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Language toggle */}
        <button
          onClick={toggleLang}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-sand-400"
          style={{ color: 'var(--text-muted)' }}
          title={isHe ? 'Switch to English' : 'Switch to Hebrew'}
        >
          <Globe size={13} />
          <span>{isHe ? 'EN' : 'עב'}</span>
        </button>

        {/* GitHub */}
        <a
          href="https://github.com/MyNameIsEdi/intelligent-testing-toolkit"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-sand-400"
          style={{ color: 'var(--text-muted)' }}
        >
          <GitHubIcon sx={{ fontSize: 15 }} />
          <span className="hidden md:inline">GitHub</span>
        </a>
      </div>
    </header>
  )
}
