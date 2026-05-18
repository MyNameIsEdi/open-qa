import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import SmartToyIcon from '@mui/icons-material/SmartToy'

const featureKeys = [
  { Icon: BuildOutlinedIcon, titleKey: 'home.feature_healing_title', descKey: 'home.feature_healing_desc', color: 'text-primary-500' },
  { Icon: CasinoOutlinedIcon, titleKey: 'home.feature_datagen_title', descKey: 'home.feature_datagen_desc', color: 'text-sage-600' },
  { Icon: BugReportOutlinedIcon, titleKey: 'home.feature_triage_title', descKey: 'home.feature_triage_desc', color: 'text-coral-500' },
  { Icon: SmartToyOutlinedIcon, titleKey: 'home.feature_claude_title', descKey: 'home.feature_claude_desc', color: 'text-amber-500' },
]

export default function HomePage() {
  const { t } = useTranslation()
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-up">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 mb-5 border border-primary-100">
          <SmartToyIcon sx={{ fontSize: 14 }} />
          {t('home.badge')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-main)' }}>
          {t('home.hero_title_1')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
            {t('home.hero_title_2')}
          </span>
        </h1>
        <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
          {t('home.hero_desc')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/MyNameIsEdi/intelligent-testing-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-soft transition-all duration-150 active:scale-95"
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
            {t('home.view_github')}
          </a>
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-neutral-100 transition-all duration-150"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
            {t('home.browse_agents')}
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {featureKeys.map(({ Icon, titleKey, descKey, color }) => (
          <div
            key={titleKey}
            className="p-4 rounded-2xl border transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <Icon className={`${color} mb-2`} sx={{ fontSize: 28 }} />
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-main)' }}>{t(titleKey)}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t(descKey)}</p>
          </div>
        ))}
      </section>

      {/* Getting started */}
      <section
        className="p-6 rounded-2xl border mb-12"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <RocketLaunchOutlinedIcon sx={{ fontSize: 18 }} className="text-primary-500" />
          {t('home.getting_started')}
          <span className="text-xs font-normal text-neutral-400">{t('home.getting_started_sub')}</span>
        </h2>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          All demos run in <strong>MOCK mode</strong> by default — no <code className="font-mono">ANTHROPIC_API_KEY</code> needed.
        </p>
        <pre
          className="text-xs font-mono p-4 rounded-xl overflow-auto leading-relaxed"
          style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)' }}
        >
{`git clone https://github.com/MyNameIsEdi/intelligent-testing-toolkit.git
cd intelligent-testing-toolkit
npm install
npx playwright install chromium
npm test
npm run dev       # starts UI + API server`}
        </pre>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Optional: set <code className="font-mono">ANTHROPIC_API_KEY</code> in <code className="font-mono">.env</code> to use live Claude calls.
        </p>
      </section>

      {/* Repo structure */}
      <section
        className="p-6 rounded-2xl border"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <FolderOpenOutlinedIcon sx={{ fontSize: 18 }} className="text-primary-500" />
          {t('home.repo_structure')}
        </h2>
        <pre
          className="text-xs font-mono leading-relaxed overflow-auto"
          style={{ color: 'var(--text-muted)' }}
        >
{`open-qa/
├── src/
│   ├── agents/       # Self-healing, visual regression
│   ├── skills/       # Data-gen, log analyzer, prompts
│   └── core/         # LLM client (Claude)
├── ui/               # React/Vite/Tailwind marketplace (this app)
├── server/           # Express API — runs agents via HTTP
├── tests/            # Playwright test suite
└── output/           # Generated artifacts`}
        </pre>
      </section>
    </div>
  )
}
