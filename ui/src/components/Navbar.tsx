import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, Moon, Sun, Github } from 'lucide-react'
import i18n from '../i18n'

interface NavbarProps {
  onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
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
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-colors hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
        aria-label="Toggle menu"
      >
        <Menu size={18} />
      </button>

      {/* Brand */}
      <NavLink to="/" className="flex items-center shrink-0 select-none">
        <span
          className="font-black text-base tracking-tight"
          style={{ color: 'var(--text-main)' }}
        >
          OPEN<span className="text-primary-600">-QA</span>
        </span>
      </NavLink>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right controls */}
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

        {/* Lang toggle */}
        <button
          onClick={toggleLang}
          className="hidden sm:flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-sand-400"
          style={{ color: 'var(--text-muted)' }}
        >
          {i18n.language === 'en' ? '🇮🇱 עברית' : '🇺🇸 English'}
        </button>

        {/* GitHub */}
        <a
          href="https://github.com/MyNameIsEdi/open-qa"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-sand-400"
          style={{ color: 'var(--text-muted)' }}
        >
          <Github size={15} />
          <span className="hidden md:inline">GitHub</span>
        </a>
      </div>
    </header>
  )
}
