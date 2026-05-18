import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import GitHubIcon from '@mui/icons-material/GitHub'
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import ForumOutlinedIcon from '@mui/icons-material/Forum'
import CallMergeOutlinedIcon from '@mui/icons-material/CallMerge'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'

const featureKeys = [
  { Icon: BuildOutlinedIcon,      titleKey: 'home.feature_healing_title',  descKey: 'home.feature_healing_desc',  color: 'text-primary-500' },
  { Icon: CasinoOutlinedIcon,     titleKey: 'home.feature_datagen_title',  descKey: 'home.feature_datagen_desc',  color: 'text-sage-600' },
  { Icon: BugReportOutlinedIcon,  titleKey: 'home.feature_triage_title',   descKey: 'home.feature_triage_desc',   color: 'text-coral-500' },
  { Icon: SmartToyOutlinedIcon,   titleKey: 'home.feature_claude_title',   descKey: 'home.feature_claude_desc',   color: 'text-amber-500' },
  { Icon: AssignmentOutlinedIcon, titleKey: 'home.feature_missions_title', descKey: 'home.feature_missions_desc', color: 'text-violet-500' },
]

const COMMUNITY_ITEMS = [
  'GraphQL Fuzzer skill (in progress)',
  'Cypress migration guide',
  'k6 load profile generator',
  'Multi-language test scaffolding',
]

const INSTALL_CMD = 'npm run dev'

export default function HomePage() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INSTALL_CMD)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-14 animate-fade-up">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="text-center mb-20">
        <h1
          className="font-black uppercase mb-5 select-none"
          style={{
            color: 'var(--text-main)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            fontSize: 'clamp(3.5rem, 12vw, 7rem)',
          }}
        >
          OPEN<span className="text-primary-600">-QA</span>
        </h1>

        <p className="text-lg sm:text-xl font-semibold mb-2" style={{ color: 'var(--text-main)' }}>
          The QA Toolkit AI Is Missing
        </p>
        <p className="text-base mb-6 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
          Ready to install, verified, and open source
        </p>

        <p className="text-sm mb-8 tracking-wide" style={{ color: 'var(--text-muted)' }}>
          7 Agents&nbsp;&middot;&nbsp;5 Skills&nbsp;&middot;&nbsp;Free &amp; Open Source
        </p>

        {/* Dark install command */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-sm mb-10 shadow-medium">
          <span className="text-neutral-500 select-none">$</span>
          <span>{INSTALL_CMD}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 ml-2 text-neutral-400 hover:text-neutral-100 transition-colors active:scale-95"
            title="Copy"
          >
            {copied
              ? <><CheckIcon sx={{ fontSize: 14 }} /><span className="text-xs">Copied</span></>
              : <><ContentCopyIcon sx={{ fontSize: 14 }} /><span className="text-xs">Copy</span></>
            }
          </button>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-soft transition-all duration-150 active:scale-95"
          >
            Get Started
          </Link>
          <Link
            to="/agents"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-semibold hover:bg-sand-400 transition-all duration-150 active:scale-95"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            <SmartToyOutlinedIcon sx={{ fontSize: 16 }} />
            {t('home.browse_agents')}
          </Link>
          <a
            href="https://github.com/MyNameIsEdi/intelligent-testing-toolkit/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border text-sm font-semibold hover:bg-sand-400 transition-all duration-150 active:scale-95"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
            Submit an Agent
          </a>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────── */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {featureKeys.map(({ Icon, titleKey, descKey, color }) => (
          <div
            key={titleKey}
            className="p-4 rounded-2xl border transition-all duration-200 hover:shadow-medium hover:-translate-y-0.5"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <Icon className={`${color} mb-2`} sx={{ fontSize: 26 }} />
            <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-main)' }}>{t(titleKey)}</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{t(descKey)}</p>
          </div>
        ))}
      </section>

      {/* ── Getting started ──────────────────────────────────── */}
      <section
        className="p-6 rounded-2xl border mb-8"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <RocketLaunchOutlinedIcon sx={{ fontSize: 18 }} className="text-primary-600" />
          {t('home.getting_started')}
          <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{t('home.getting_started_sub')}</span>
        </h2>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          All demos run in <strong>MOCK mode</strong> by default — no <code className="font-mono">ANTHROPIC_API_KEY</code> needed.
        </p>
        <pre
          className="text-xs font-mono p-4 rounded-xl overflow-auto leading-relaxed"
          style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-main)' }}
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

      {/* ── Repo structure ───────────────────────────────────── */}
      <section
        className="p-6 rounded-2xl border mb-12"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <h2 className="font-semibold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <FolderOpenOutlinedIcon sx={{ fontSize: 18 }} className="text-primary-600" />
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

      {/* ── Mission ──────────────────────────────────────────── */}
      <section
        className="p-6 rounded-2xl border mb-8"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <h2 className="font-semibold text-base mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <EmojiObjectsOutlinedIcon sx={{ fontSize: 18 }} style={{ color: '#d97706' }} />
          {t('home.mission_title')}
        </h2>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t('home.mission_desc')}
        </p>
        <ul className="flex flex-col gap-2">
          {(['mission_p1', 'mission_p2', 'mission_p3', 'mission_p4'] as const).map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-600 shrink-0" />
              {t(`home.${key}`)}
            </li>
          ))}
        </ul>
      </section>

      {/* ── How to Contribute ────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="font-semibold text-base mb-1 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <GroupAddOutlinedIcon sx={{ fontSize: 18 }} className="text-primary-600" />
          {t('home.contribute_title')}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{t('home.contribute_subtitle')}</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <BugReportOutlinedIcon sx={{ fontSize: 20 }} style={{ color: '#ef4444' }} />,
              title: t('home.contribute_issues_title'),
              desc:  t('home.contribute_issues_desc'),
              cta:   t('home.contribute_issues_cta'),
              href:  'https://github.com/MyNameIsEdi/intelligent-testing-toolkit/issues',
            },
            {
              icon: <ForumOutlinedIcon sx={{ fontSize: 20 }} style={{ color: '#8b5cf6' }} />,
              title: t('home.contribute_discussions_title'),
              desc:  t('home.contribute_discussions_desc'),
              cta:   t('home.contribute_discussions_cta'),
              href:  'https://github.com/MyNameIsEdi/intelligent-testing-toolkit/discussions',
            },
            {
              icon: <CallMergeOutlinedIcon sx={{ fontSize: 20 }} style={{ color: '#10b981' }} />,
              title: t('home.contribute_prs_title'),
              desc:  t('home.contribute_prs_desc'),
              cta:   t('home.contribute_prs_cta'),
              href:  'https://github.com/MyNameIsEdi/intelligent-testing-toolkit/pulls',
            },
          ].map(({ icon, title, desc, cta, href }) => (
            <div
              key={title}
              className="p-4 rounded-2xl border flex flex-col gap-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              <div className="flex items-center gap-2">
                {icon}
                <span className="font-semibold text-sm" style={{ color: 'var(--text-main)' }}>{title}</span>
              </div>
              <p className="text-xs leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {cta}
                <OpenInNewIcon sx={{ fontSize: 12 }} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Community ────────────────────────────────────────── */}
      <section
        className="p-6 rounded-2xl border"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <h2 className="font-semibold text-base mb-1 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <RocketLaunchOutlinedIcon sx={{ fontSize: 18 }} className="text-primary-600" />
          {t('home.community_title')}
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{t('home.community_subtitle')}</p>
        <ul className="flex flex-col gap-2">
          {COMMUNITY_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <Link
          to="/agents"
          className="inline-flex items-center gap-1 text-xs font-semibold mt-4 text-primary-600 hover:text-primary-700 transition-colors"
        >
          View all agents &amp; skills →
        </Link>
      </section>
    </div>
  )
}
