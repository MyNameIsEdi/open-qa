import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import BiotechIcon from '@mui/icons-material/Biotech'
import i18n from '../i18n'

const links = [
  { to: '/', labelKey: 'nav.home', Icon: HomeOutlinedIcon },
  { to: '/agents', labelKey: 'nav.agents', Icon: SmartToyOutlinedIcon },
  { to: '/skills', labelKey: 'nav.skills', Icon: BuildOutlinedIcon },
  { to: '/prompts', labelKey: 'nav.prompts', Icon: PsychologyOutlinedIcon },
  { to: '/playground', labelKey: 'nav.playground', Icon: ScienceOutlinedIcon },
  { to: '/generate', labelKey: 'nav.generate', Icon: AutoAwesomeOutlinedIcon },
  { to: '/cheatsheet', labelKey: 'nav.cheatsheet', Icon: CodeOutlinedIcon },
  { to: '/docs', labelKey: 'nav.docs', Icon: MenuBookOutlinedIcon },
]

export default function Navbar() {
  const { t } = useTranslation()

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'he' : 'en'
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
    document.documentElement.dir = next === 'he' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 backdrop-blur-md border-b"
      style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}
    >
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
        {/* Brand */}
        <NavLink
          to="/"
          className="flex items-center gap-2 font-semibold text-base shrink-0"
          style={{ color: 'var(--text-main)' }}
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-600 text-white shadow-soft">
            <BiotechIcon sx={{ fontSize: 16 }} />
          </span>
          <span>open-qa</span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ to, labelKey, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                }`
              }
            >
              <Icon sx={{ fontSize: 15 }} />
              <span className="hidden md:inline">{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleLang}
            className="hidden lg:flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all duration-200"
            title={i18n.language === 'en' ? 'Switch to Hebrew' : 'עבור לאנגלית'}
          >
            {t('lang_toggle')}
          </button>
          <a
            href="https://github.com/MyNameIsEdi/intelligent-testing-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-all duration-200"
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}
