const sections = [
  {
    title: '🏗️ Architecture',
    content: `open-qa separates concerns cleanly across three layers:

**Core** (src/) — pure TypeScript, no framework dependencies
  • src/agents/  — autonomous entities that make LLM calls
  • src/skills/  — composable utilities (data gen, log analysis)
  • src/core/    — shared LLM client wrapper (Anthropic SDK)

**UI** (ui/) — React/Vite/Tailwind marketplace app (what you're reading)
  • Communicates with the Express API to trigger agent runs

**Server** (server/) — thin Express API on port 3001
  • /api/agents, /api/skills — catalog metadata
  • /api/run/healing, /api/run/datagen, /api/run/bugreport — CLI runner`,
  },
  {
    title: '🔑 Environment Variables',
    content: `Copy .env.example to .env and fill in:

ANTHROPIC_API_KEY=sk-ant-...

Without this key, all agents run in MOCK mode — deterministic outputs,
no API costs, instant feedback. Set the key for live Claude calls.`,
  },
  {
    title: '🧪 Running Tests',
    content: `# Run full Playwright test suite
npm test

# Run only the self-healing spec
npm run test:healing

# Run with CI reporter (artifact upload on failure)
npm run test:ci

# Type-check everything (src + ui)
npm run typecheck

# Lint
npm run lint`,
  },
  {
    title: '🤖 MCP Integration',
    content: `Every agent and skill has a "Add to Claude" button that copies
its full Claude tool-use payload to your clipboard:

{
  "name": "...",
  "system_prompt": "...",
  "tool_schema": { ... },
  "run_command": "..."
}

Paste into Claude Desktop → Settings → Tools, or into your API tools array.

Roadmap: native MCP server (npx open-qa mcp-server --port 3001)`,
  },
  {
    title: '📦 Tech Stack',
    content: `Layer           Technology
──────────────────────────────────────
Automation      Playwright Test
AI              Anthropic Claude (Sonnet)
Runtime         TypeScript 5.x, Node 18+
UI              React 18 + Vite + Tailwind CSS
API server      Express 4
CI              GitHub Actions (Chromium, artifacts)
Design system   OpenHuman token system (colors, fonts, shadows)`,
  },
  {
    title: '🤝 Contributing',
    content: `1. Fork and create a feature branch: git checkout -b feature/your-feature
2. Keep changes small and focused; open multiple PRs if needed.
3. Write clear commit messages; include tests or examples.
4. Run: npm run lint && npm run typecheck && npm test
5. Open a PR with rationale and usage steps.

PR checklist:
 □ npm run lint passes
 □ npm run typecheck passes
 □ npm test passes
 □ README.md updated if behavior changed
 □ CHANGELOG.md entry added`,
  },
]

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-up">
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>
          Documentation
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Integration guide, architecture overview, and contributor reference.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {sections.map((s) => (
          <div
            key={s.title}
            className="p-6 rounded-2xl border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
          >
            <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--text-main)' }}>
              {s.title}
            </h2>
            <pre
              className="text-xs font-mono whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {s.content}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
