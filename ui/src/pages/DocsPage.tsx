import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import CodeSnippet from '../components/CodeSnippet'

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; code: string; language: string; label?: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'faq'; items: { q: string; a: string }[] }

interface DocSection {
  id: string
  titleKey: string
  icon: React.ReactNode
  blocks: ContentBlock[]
}

const sections: DocSection[] = [
  {
    id: 'architecture',
    titleKey: 'docs.sections.architecture',
    icon: <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'paragraph', text: 'open-qa separates concerns cleanly across three layers:' },
      { type: 'list', items: [
        'Core (src/) — pure TypeScript, no framework dependencies',
        'src/agents/ — autonomous entities that make LLM calls',
        'src/skills/ — composable utilities (data gen, log analysis)',
        'src/core/ — shared LLM client wrapper (Anthropic SDK)',
        'UI (ui/) — React/Vite/Tailwind marketplace app',
        'Server (server/) — thin Express API on port 3001',
      ]},
      { type: 'code', language: 'bash', label: 'Directory tree', code:
`open-qa/
├── src/
│   ├── agents/       # Self-healing, visual regression, Auto-POM, A11y
│   ├── skills/       # Data-gen, log analyzer, prompts
│   └── core/         # LLM client (Claude / MOCK mode)
├── ui/               # React/Vite/Tailwind marketplace (this app)
├── server/           # Express API — runs agents via HTTP
├── tests/            # Playwright test suite
└── output/           # Generated artifacts` },
    ],
  },
  {
    id: 'env-vars',
    titleKey: 'docs.sections.env-vars',
    icon: <KeyOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'paragraph', text: 'Copy .env.example to .env and fill in your Anthropic API key:' },
      { type: 'code', language: 'bash', code: 'cp .env.example .env' },
      { type: 'code', language: 'bash', label: '.env', code: 'ANTHROPIC_API_KEY=sk-ant-...' },
      { type: 'paragraph', text: 'Without this key, all agents run in MOCK mode — deterministic outputs, no API costs, instant feedback. Set the key for live Claude calls.' },
    ],
  },
  {
    id: 'running-tests',
    titleKey: 'docs.sections.running-tests',
    icon: <PlayCircleOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'code', language: 'bash', label: 'Run full Playwright test suite', code: 'npm test' },
      { type: 'code', language: 'bash', label: 'Run only the self-healing spec', code: 'npm run test:healing' },
      { type: 'code', language: 'bash', label: 'Run with CI reporter (artifact upload on failure)', code: 'npm run test:ci' },
      { type: 'code', language: 'bash', label: 'Type-check everything (src + ui)', code: 'npm run typecheck' },
      { type: 'code', language: 'bash', label: 'Lint', code: 'npm run lint' },
      { type: 'code', language: 'bash', label: 'Start UI + API server together', code: 'npm run dev' },
    ],
  },
  {
    id: 'mcp',
    titleKey: 'docs.sections.mcp',
    icon: <IntegrationInstructionsOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'paragraph', text: 'Every agent and skill has an "Add to Claude" button that copies its full Claude tool-use payload to your clipboard.' },
      { type: 'code', language: 'json', label: 'Paste into Claude Desktop → Settings → Tools', code:
`{
  "name": "self-healing-locator",
  "system_prompt": "You are an expert Playwright...",
  "tool_schema": { ... },
  "run_command": "npm run run:healing"
}` },
      { type: 'paragraph', text: 'Roadmap: native MCP server (npx open-qa mcp-server --port 3001)' },
    ],
  },
  {
    id: 'tech-stack',
    titleKey: 'docs.sections.tech-stack',
    icon: <LayersOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'table', headers: ['Layer', 'Technology'], rows: [
        ['Automation', 'Playwright Test'],
        ['AI', 'Anthropic Claude (Sonnet)'],
        ['Runtime', 'TypeScript 5.x, Node 18+'],
        ['UI', 'React 18 + Vite + Tailwind CSS'],
        ['API server', 'Express 4'],
        ['CI', 'GitHub Actions (Chromium, artifacts)'],
        ['Design system', 'OpenHuman token system (colors, fonts, shadows)'],
      ]},
    ],
  },
  {
    id: 'contributing',
    titleKey: 'docs.sections.contributing',
    icon: <GroupOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'list', items: [
        'Fork and create a feature branch: git checkout -b feature/your-feature',
        'Keep changes small and focused; open multiple PRs if needed.',
        'Write clear commit messages; include tests or examples.',
        'Run: npm run lint && npm run typecheck && npm test',
        'Open a PR with rationale and usage steps.',
      ]},
      { type: 'paragraph', text: 'PR checklist:' },
      { type: 'list', items: [
        '☐ npm run lint passes',
        '☐ npm run typecheck passes',
        '☐ npm test passes',
        '☐ README.md updated if behavior changed',
        '☐ CHANGELOG.md entry added',
      ]},
    ],
  },
  {
    id: 'faq',
    titleKey: 'docs.sections.faq',
    icon: <HelpOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'faq', items: [
        { q: 'Do I need an Anthropic API key?', a: 'No. All agents run in MOCK mode by default — deterministic outputs, no API costs. Set ANTHROPIC_API_KEY in .env for live Claude calls.' },
        { q: 'Can I use open-qa with Cypress instead of Playwright?', a: 'The agents operate at the LLM level and are framework-agnostic. The generated code defaults to Playwright, but you can instruct the agents to produce Cypress or WebdriverIO output.' },
        { q: 'How do I add my own agent?', a: 'Create a new file in src/agents/, following the existing self-healing pattern. Export a run() function and add the agent metadata to server/index.ts and ui/src/pages/AgentsPage.tsx.' },
        { q: 'Is there a hosted demo?', a: 'A GitHub Pages deployment of the UI is on the roadmap. For now, run locally with npm run dev — it takes under 5 minutes.' },
        { q: 'What Node.js version is required?', a: 'Node 18 or higher. Node 20 LTS is recommended for best compatibility.' },
        { q: 'How do Daily Missions work?', a: '3 missions are seeded deterministically from the current UTC date, so every user sees the same challenges each day. Completion and XP are tracked in localStorage.' },
      ]},
    ],
  },
  {
    id: 'troubleshooting',
    titleKey: 'docs.sections.troubleshooting',
    icon: <BuildOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'list', items: [
        'Error "browserType.launch: Executable doesn\'t exist" → Run: npx playwright install chromium',
        '404 on /api/run/:id → Start the server: npm run server:dev (or npm run dev to start both)',
        'MOCK mode returns identical output every time → Expected. Set ANTHROPIC_API_KEY for live responses.',
        'UI shows blank page after npm run ui:dev → Check port 5174 is free. Check the browser console for errors.',
        'TypeScript errors after modifying an agent → Run npm run typecheck. Ensure exports match the existing agent pattern.',
        'git push rejected → The branch may have diverged. Run git pull --rebase then push again.',
      ]},
    ],
  },
  {
    id: 'roadmap',
    titleKey: 'docs.sections.roadmap',
    icon: <MapOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      { type: 'table', headers: ['Feature', 'Status'], rows: [
        ['Daily Missions gamification', '🟡 In Progress'],
        ['Full i18n (EN/HE)', '🟡 In Progress'],
        ['Native MCP server (npx open-qa mcp-server)', '⬜ Planned'],
        ['Network Interceptor & Mock Gen agent', '⬜ Planned'],
        ['Chaos Monkey UI agent', '⬜ Planned'],
        ['GraphQL Fuzzer skill', '⬜ Planned'],
        ['k6 Load Profile Generator skill', '⬜ Planned'],
        ['JWT Attack Suite skill', '⬜ Planned'],
        ['GitHub Pages live demo', '⬜ Planned'],
        ['VS Code extension', '💡 Idea'],
        ['MCP registry listing', '💡 Idea'],
        ['Cypress migration guide', '💡 Idea'],
      ]},
    ],
  },
]

function BlockRenderer({ block }: { block: ContentBlock }) {
  if (block.type === 'paragraph') {
    return <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>{block.text}</p>
  }
  if (block.type === 'list') {
    return (
      <ul className="flex flex-col gap-1.5 mb-3">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--primary-500, #6366f1)' }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === 'code') {
    return (
      <div className="mb-3">
        {block.label && (
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{block.label}</p>
        )}
        <CodeSnippet code={block.code} language={block.language} />
      </div>
    )
  }
  if (block.type === 'table') {
    return (
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {block.headers.map(h => (
                <th key={h} className="text-left py-2 pr-4 text-xs font-semibold" style={{ color: 'var(--text-main)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                {row.map((cell, j) => (
                  <td key={j} className="py-2 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  if (block.type === 'faq') {
    return (
      <div className="flex flex-col gap-2 mb-3">
        {block.items.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-xl border px-4 py-3 cursor-pointer"
            style={{ borderColor: 'var(--border)' }}
          >
            <summary className="text-sm font-medium list-none flex items-center justify-between gap-2" style={{ color: 'var(--text-main)' }}>
              {q}
              <span className="text-neutral-400 text-base group-open:rotate-90 transition-transform duration-150 inline-block">›</span>
            </summary>
            <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>{a}</p>
          </details>
        ))}
      </div>
    )
  }
  return null
}

function DocSectionCard({ section, isActive }: { section: DocSection; isActive: boolean }) {
  const { t } = useTranslation()
  return (
    <section
      id={section.id}
      className="p-6 rounded-2xl border scroll-mt-24"
      style={{
        borderColor: isActive ? 'var(--primary-300, #a5b4fc)' : 'var(--border)',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      <h2 className="font-semibold text-base mb-5 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
        <span style={{ color: 'var(--primary-500, #6366f1)' }}>{section.icon}</span>
        {t(section.titleKey)}
      </h2>
      {section.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </section>
  )
}

export default function DocsPage() {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(sections[0].id)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-20% 0% -60% 0%', threshold: 0 }
    )
    sections.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observerRef.current?.observe(el)
    })
    return () => observerRef.current?.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-up">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <MenuBookOutlinedIcon sx={{ fontSize: 24 }} className="text-primary-500" />
          {t('docs.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('docs.subtitle')}</p>
      </div>

      <div className="lg:flex gap-8">
        {/* Sticky sidebar — desktop only */}
        <aside className="hidden lg:block w-48 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
            {t('docs.sidebar.jump')}
          </p>
          <nav className="sticky top-20 flex flex-col gap-0.5">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-150 w-full ${
                  activeId === s.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
                }`}
              >
                {s.icon}
                {t(s.titleKey)}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile: horizontal scrolling tab strip */}
        <div className="lg:hidden flex overflow-x-auto gap-1 mb-6 pb-1">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                activeId === s.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              {s.icon}
              {t(s.titleKey)}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {sections.map(s => (
            <DocSectionCard key={s.id} section={s} isActive={activeId === s.id} />
          ))}
        </main>
      </div>
    </div>
  )
}
