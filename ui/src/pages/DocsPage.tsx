import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CodeSnippet from '../components/CodeSnippet';

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; code: string; language: string; label?: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'faq'; items: { q: string; a: string }[] };

interface DocSection {
  id: string;
  titleKey: string;
  icon: React.ReactNode;
  blocks: ContentBlock[];
}

const sections: DocSection[] = [
  {
    id: 'architecture',
    titleKey: 'docs.sections.architecture',
    icon: <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'paragraph',
        text: 'open-qa is a multi-agent AI workspace built on three layers: a React/Vite UI, an Express API server, and standalone CLI agents.',
      },
      {
        type: 'list',
        items: [
          'server/ — Express API on port 3001: /api/qa-agent (SSE, Gemini/Ollama), /api/run-dynamic-test (Playwright + AI summary)',
          'ui/src/ — React 18 + Vite 6 app (port 5173): pixel-art office, Playwright Dashboard, agent chat, QA course',
          'src/agents/ — standalone CLI agents: Self-Healing, Auto-POM, Bug Triage, Visual Regression, A11y, Data Gen',
          'src/skills/ — composable utilities: data generator, log analyzer',
          'src/core/ — shared LLM client wrapper (Gemini SDK + Anthropic SDK for CLI agents)',
        ],
      },
      {
        type: 'code',
        language: 'bash',
        label: 'Directory tree',
        code: `open-qa/
├── server/
│   └── index.ts      # Express API — /api/qa-agent, /api/run-dynamic-test, SSE
├── ui/
│   └── src/
│       ├── pages/    # OfficePage, PlaywrightDashboard, AgentsPage, DocsPage …
│       ├── components/
│       ├── context/  # SettingsContext — agent config + chat state
│       └── office/   # Pixel-art engine (game loop, renderer, sprites)
├── src/
│   ├── agents/       # Self-healing, Auto-POM, Visual Regression, A11y, Explore
│   ├── skills/       # Data-gen, log-analyzer
│   └── core/         # llm-client.ts (CLI agents)
├── tests/            # Playwright E2E specs
└── output/           # Generated artifacts (.gitkeep)`,
      },
    ],
  },
  {
    id: 'env-vars',
    titleKey: 'docs.sections.env-vars',
    icon: <KeyOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'paragraph',
        text: 'Copy .env.example to .env and configure your LLM provider. Choose Gemini (cloud) or Ollama (fully local — no key needed):',
      },
      { type: 'code', language: 'bash', code: 'cp .env.example .env' },
      {
        type: 'code',
        language: 'bash',
        label: '.env — Option A: Gemini (cloud)',
        code: `PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
# Get a free key at https://aistudio.google.com/app/apikey`,
      },
      {
        type: 'code',
        language: 'bash',
        label: 'Option B: Ollama (local — no .env changes needed)',
        code: `# Install Ollama from https://ollama.ai, then:
ollama pull qwen2.5-coder
# Switch to Ollama in the app Settings panel (saved to localStorage)`,
      },
      {
        type: 'paragraph',
        text: 'The CLI agents in src/agents/ optionally use ANTHROPIC_API_KEY and fall back to deterministic MOCK mode when no key is present — great for CI.',
      },
    ],
  },
  {
    id: 'running-tests',
    titleKey: 'docs.sections.running-tests',
    icon: <PlayCircleOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'code',
        language: 'bash',
        label: 'Start the full app (UI + API server)',
        code: 'npm run dev',
      },
      { type: 'code', language: 'bash', label: 'Run full Playwright test suite', code: 'npm test' },
      {
        type: 'code',
        language: 'bash',
        label: 'Type-check everything (server + root)',
        code: 'npm run typecheck',
      },
      {
        type: 'code',
        language: 'bash',
        label: 'Type-check UI separately',
        code: 'cd ui && npx tsc --noEmit',
      },
      { type: 'code', language: 'bash', label: 'Lint', code: 'npm run lint' },
      {
        type: 'paragraph',
        text: 'CLI agents (run independently from the UI):',
      },
      {
        type: 'code',
        language: 'bash',
        label: 'CLI agent commands',
        code: `npm run heal                  # Self-Healing locator repair
npm run run:auto-pom          # Auto-POM generator
npm run run:bugreport         # Bug Triage → Jira-ready report
npm run run:visual-regression # Pixel-diff visual regression
npm run run:visual-a11y       # WCAG 2.1 AA accessibility audit
npm run run:datagen           # Edge-case test data generator`,
      },
    ],
  },
  {
    id: 'mcp',
    titleKey: 'docs.sections.mcp',
    icon: <IntegrationInstructionsOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'paragraph',
        text: 'Every agent and skill has an "Add to Claude" button that copies its full Claude tool-use payload to your clipboard.',
      },
      {
        type: 'code',
        language: 'json',
        label: 'Paste into Claude Desktop → Settings → Tools',
        code: `{
  "name": "self-healing-locator",
  "system_prompt": "You are an expert Playwright...",
  "tool_schema": { ... },
  "run_command": "npm run heal"
}`,
      },
      {
        type: 'paragraph',
        text: 'Roadmap: native MCP server (npx open-qa mcp-server --port 3001)',
      },
    ],
  },
  {
    id: 'tech-stack',
    titleKey: 'docs.sections.tech-stack',
    icon: <LayersOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'table',
        headers: ['Layer', 'Technology'],
        rows: [
          ['Automation', 'Playwright Test'],
          ['AI (UI)', 'Gemini API (cloud) + Ollama (local)'],
          ['AI (CLI agents)', 'Anthropic Claude SDK (MOCK fallback)'],
          ['Runtime', 'TypeScript 5.x, Node 20+'],
          ['UI', 'React 18 + Vite 6 + Tailwind CSS'],
          ['API server', 'Express 4 + SSE streaming'],
          ['CI', 'GitHub Actions (Chromium, artifacts)'],
          ['Design system', 'OpenHuman token system (colors, fonts, shadows)'],
        ],
      },
    ],
  },
  {
    id: 'contributing',
    titleKey: 'docs.sections.contributing',
    icon: <GroupOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'list',
        items: [
          'Fork and create a feature branch: git checkout -b feat/your-feature',
          'Keep changes small and focused; open multiple PRs if needed.',
          'Write clear commit messages (conventional commits preferred).',
          'Run: npm run lint && npm run typecheck && npm test',
          'Open a PR — CI checks lint, typecheck, and the docs-validation script.',
        ],
      },
      { type: 'paragraph', text: 'PR checklist:' },
      {
        type: 'list',
        items: [
          '☐ npm run lint passes',
          '☐ npm run typecheck passes (server + ui)',
          '☐ npm test passes',
          '☐ README.md updated if server/ or ui/src/ changed',
          '☐ CHANGELOG.md entry added under [Unreleased]',
        ],
      },
    ],
  },
  {
    id: 'faq',
    titleKey: 'docs.sections.faq',
    icon: <HelpOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'faq',
        items: [
          {
            q: 'Do I need a Gemini API key?',
            a: 'No — you can run fully locally with Ollama (install from ollama.ai, pull any model, then select Ollama in the app Settings panel). A free Gemini key is available at aistudio.google.com/app/apikey if you prefer the cloud option.',
          },
          {
            q: 'How do I switch between Gemini and Ollama?',
            a: 'Open the QA Office page, click ⚙ Settings in the top bar (or use the ✨ / 🦙 inline toggle in the chat header). Set the provider, Ollama base URL, and model name. Your choice is saved to localStorage and survives page refreshes — no server restart needed.',
          },
          {
            q: 'Can I use open-qa with Cypress instead of Playwright?',
            a: 'The agents operate at the LLM level and are framework-agnostic. The generated code defaults to Playwright, but you can instruct the agents to produce Cypress or WebdriverIO output.',
          },
          {
            q: 'How does multi-agent collaboration work?',
            a: 'Tag two or more specialists (or @Edi M) in a message. Edi M runs a primary draft → critic review → primary refine → manager synthesis loop. Each turn streams into its own chat bubble with a role pill (blue = draft, amber = critic, emerald = synthesis). Chat history and image attachments are forwarded to the primary turn.',
          },
          {
            q: 'How do I add my own agent?',
            a: 'Create a new directory in src/agents/<name>/index.ts following the existing pattern. Export a run() function, then add the agent metadata to server/index.ts and ui/src/pages/AgentsPage.tsx.',
          },
          {
            q: 'What Node.js version is required?',
            a: 'Node 20 or higher. Node 20 LTS is recommended for best compatibility.',
          },
          {
            q: 'Where are test run results stored?',
            a: 'Each run is archived under test-results/runs/ as run-<id>.json with up to 5000 lines of stdout. Click any past run in the history table on the Playwright Dashboard to replay its results and original log output.',
          },
        ],
      },
    ],
  },
  {
    id: 'troubleshooting',
    titleKey: 'docs.sections.troubleshooting',
    icon: <BuildOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'list',
        items: [
          'Error "browserType.launch: Executable doesn\'t exist" → Run: npx playwright install --with-deps chromium',
          '404 on /api/run/:id → Start the server: npm run dev (starts both UI on port 5173 and API on port 3001)',
          'Chat returns no response → Check that GEMINI_API_KEY is set in .env, or that Ollama is running at the configured base URL.',
          'UI shows blank page after npm run dev → Check that port 5173 is free. Check the browser console for errors.',
          'TypeScript errors after modifying an agent → Run npm run typecheck and cd ui && npx tsc --noEmit. Ensure exports match the existing agent pattern.',
          'git push rejected → The branch may have diverged. Run git pull --rebase then push again.',
          'Ollama model not responding → Run ollama list to confirm the model is pulled. Check that OLLAMA_BASE_URL matches (default: http://localhost:11434).',
        ],
      },
    ],
  },
  {
    id: 'roadmap',
    titleKey: 'docs.sections.roadmap',
    icon: <MapOutlinedIcon sx={{ fontSize: 16 }} />,
    blocks: [
      {
        type: 'table',
        headers: ['Feature', 'Status'],
        rows: [
          ['Multi-agent collaboration (primary → critic → synthesis)', '✅ Done'],
          ['Playwright Dashboard with live SSE log streaming', '✅ Done'],
          ['Edi M AI post-run summaries (root-cause + fix snippets)', '✅ Done'],
          ['Persistent run history + log replay', '✅ Done'],
          ['Gemini / Ollama provider switching (no restart)', '✅ Done'],
          ['Daily Missions gamification', '✅ Done'],
          ['Full i18n (EN/HE)', '✅ Done'],
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
        ],
      },
    ],
  },
];

function BlockRenderer({ block }: { block: ContentBlock }) {
  if (block.type === 'paragraph') {
    return (
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
        {block.text}
      </p>
    );
  }
  if (block.type === 'list') {
    return (
      <ul className="flex flex-col gap-1.5 mb-3">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: 'var(--primary-500, #6366f1)' }}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'code') {
    return (
      <div className="mb-3">
        {block.label && (
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            {block.label}
          </p>
        )}
        <CodeSnippet code={block.code} language={block.language} />
      </div>
    );
  }
  if (block.type === 'table') {
    return (
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {block.headers.map((h) => (
                <th
                  key={h}
                  className="text-left py-2 pr-4 text-xs font-semibold"
                  style={{ color: 'var(--text-main)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                {row.map((cell, j) => (
                  <td key={j} className="py-2 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
            <summary
              className="text-sm font-medium list-none flex items-center justify-between gap-2"
              style={{ color: 'var(--text-main)' }}
            >
              {q}
              <span className="text-neutral-400 text-base group-open:rotate-90 transition-transform duration-150 inline-block">
                ›
              </span>
            </summary>
            <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
              {a}
            </p>
          </details>
        ))}
      </div>
    );
  }
  return null;
}

function DocSectionCard({ section, isActive }: { section: DocSection; isActive: boolean }) {
  const { t } = useTranslation();
  return (
    <section
      id={section.id}
      className="p-6 rounded-2xl border scroll-mt-24"
      style={{
        borderColor: isActive ? 'var(--primary-300, #a5b4fc)' : 'var(--border)',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      <h2
        className="font-semibold text-base mb-5 flex items-center gap-2"
        style={{ color: 'var(--text-main)' }}
      >
        <span style={{ color: 'var(--primary-500, #6366f1)' }}>{section.icon}</span>
        {t(section.titleKey)}
      </h2>
      {section.blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} />
      ))}
    </section>
  );
}

export default function DocsPage() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState(sections[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0% -60% 0%', threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-up">
      {/* Page header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2 flex items-center gap-2"
          style={{ color: 'var(--text-main)' }}
        >
          <MenuBookOutlinedIcon sx={{ fontSize: 24 }} className="text-primary-500" />
          {t('docs.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {t('docs.subtitle')}
        </p>
      </div>

      <div className="lg:flex gap-8">
        {/* Sticky sidebar — desktop only */}
        <aside className="hidden lg:block w-48 shrink-0">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('docs.sidebar.jump')}
          </p>
          <nav className="sticky top-20 flex flex-col gap-0.5">
            {sections.map((s) => (
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
          {sections.map((s) => (
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
          {sections.map((s) => (
            <DocSectionCard key={s.id} section={s} isActive={activeId === s.id} />
          ))}
        </main>
      </div>
    </div>
  );
}
