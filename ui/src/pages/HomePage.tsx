import { Link } from 'react-router-dom'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import SmartToyIcon from '@mui/icons-material/SmartToy'

const features = [
  {
    Icon: BuildOutlinedIcon,
    title: 'Self-Healing Tests',
    desc: 'AI suggests new locators when your UI changes — no more brittle selectors.',
    color: 'text-primary-500',
  },
  {
    Icon: CasinoOutlinedIcon,
    title: 'Smart Data Gen',
    desc: 'Generates SQLi, XSS, nulls, RTL text and boundary payloads automatically.',
    color: 'text-sage-600',
  },
  {
    Icon: BugReportOutlinedIcon,
    title: 'Auto Bug Triage',
    desc: 'Reads error logs and writes Jira-ready bug reports with root-cause analysis.',
    color: 'text-coral-500',
  },
  {
    Icon: SmartToyOutlinedIcon,
    title: 'Claude-Powered',
    desc: 'Every agent and skill is powered by Anthropic Claude. MOCK mode requires no API key.',
    color: 'text-amber-500',
  },
]

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-up">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 mb-5 border border-primary-100">
          <SmartToyIcon sx={{ fontSize: 14 }} />
          open-qa — AI-Powered QA Arsenal
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: 'var(--text-main)' }}>
          Test smarter with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">
            AI-driven QA
          </span>
        </h1>
        <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
          Production-ready Playwright + Claude toolkit: self-healing tests, edge-case data generation,
          and automated bug triage. OpenHuman-style UI, zero lock-in.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://github.com/MyNameIsEdi/intelligent-testing-toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-soft transition-all duration-150 active:scale-95"
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
            View on GitHub
          </a>
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-neutral-100 transition-all duration-150"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
            Browse Agents
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {features.map(({ Icon, title, desc, color }) => (
          <div
            key={title}
            className="p-4 rounded-2xl border transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <Icon className={`${color} mb-2`} sx={{ fontSize: 28 }} />
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-main)' }}>{title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
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
          Getting Started
          <span className="text-xs font-normal text-neutral-400">(&lt; 5 minutes)</span>
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
          Repository Structure
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
