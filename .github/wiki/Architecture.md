# Architecture

open-qa separates concerns cleanly across four layers: agent core, skill library, API server, and React UI.

---

## Folder Structure

```
open-qa/
├── src/                          # Core AI logic (Node.js / TypeScript)
│   ├── agents/
│   │   ├── self-healing/
│   │   │   └── index.ts          # Self-Healing Locator agent
│   │   ├── visual-regression/
│   │   │   └── index.ts          # Visual Regression Agent
│   │   ├── auto-pom/
│   │   │   └── index.ts          # Auto-POM Builder
│   │   └── visual-a11y/
│   │       └── index.ts          # Visual A11y Scanner (WCAG 2.1 AA)
│   ├── skills/
│   │   ├── data-gen/
│   │   │   ├── index.ts          # Smart Edge-Case Data Generator
│   │   │   └── prompts.ts        # QA engineer system prompts
│   │   ├── log-analyzer/
│   │   │   └── index.ts          # Automated Bug Triage
│   │   └── fixtures/
│   │       └── mock-error.log    # Sample Playwright failure log
│   └── core/
│       └── llm-client.ts         # Anthropic SDK wrapper (MOCK + live)
│
├── ui/                           # React 18 / Vite 6 / Tailwind CSS 3
│   ├── index.html
│   ├── vite.config.ts            # base: /intelligent-testing-toolkit/ on CI
│   ├── tailwind.config.js        # OpenHuman design tokens
│   └── src/
│       ├── components/
│       │   ├── Navbar.tsx        # Sticky frosted-glass navigation
│       │   ├── AgentCard.tsx     # Card with Run button + "Add to Claude"
│       │   ├── SkillCard.tsx
│       │   ├── PromptCard.tsx
│       │   ├── RunOutput.tsx     # Scrollable agent output panel
│       │   └── CodeSnippet.tsx   # Code block with copy button
│       └── pages/
│           ├── HomePage.tsx
│           ├── AgentsPage.tsx    # 7 agents (5 active + 2 planned)
│           ├── SkillsPage.tsx
│           ├── PromptsPage.tsx
│           ├── PlaygroundPage.tsx  # SSE-streamed prompt runner
│           ├── GeneratePage.tsx    # User story → .spec.ts generator
│           ├── CheatsheetPage.tsx  # 10-section reference
│           ├── DocsPage.tsx
│           └── App.tsx           # HashRouter + routes
│
├── server/                       # Express 4 API (port 3001)
│   └── index.ts                  # /api/agents, /api/skills, /api/run/:id, /api/playground
│
├── tests/                        # Playwright test suite
│   ├── healing.spec.ts           # Self-healing locator tests
│   └── unit-helpers.spec.ts      # Mock mode helper tests
│
├── output/                       # Generated artifacts
│   ├── AI_BUG_REPORT.md
│   ├── A11Y_REPORT.md
│   ├── generated-edge-cases.json
│   ├── auto-pom/                 # Generated POM .ts files
│   └── visual-regression/       # Visual regression reports
│
├── .github/
│   ├── workflows/
│   │   ├── deploy-pages.yml      # Build + deploy UI to GitHub Pages
│   │   ├── update-wiki.yml       # Sync .github/wiki/ to GitHub Wiki
│   │   ├── playwright-ci.yml     # Run Playwright tests on every PR
│   │   └── ci.yml                # TypeScript strict check
│   └── wiki/                     # Wiki source files (synced by workflow)
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI / LLM | Anthropic Claude (`claude-3-5-sonnet-20241022`) via `@anthropic-ai/sdk` |
| Automation | Playwright Test 1.60+ |
| Runtime | TypeScript 5.x (strict), Node.js 18+, ESM modules |
| UI | React 18 + Vite 6 + Tailwind CSS 3 |
| UI components | Material UI icons (`@mui/icons-material`) |
| UI routing | React Router v6 (HashRouter — works on GitHub Pages) |
| Design system | OpenHuman token system (colors, fonts, shadows, animations) |
| API server | Express 4 + CORS + SSE streaming |
| CI | GitHub Actions |
| Hosting | GitHub Pages (`gh-pages` branch) |

---

## Data Flow

```
Browser (React UI @ port 5174)
    │
    ├── GET  /api/agents          ─►  Express server (port 3001)
    ├── GET  /api/skills               │
    ├── POST /api/run/:id              │
    │   (self-healing, triage,         ├── npx tsx src/agents/self-healing/index.ts
    │    auto-pom, visual-a11y,        ├── npx tsx src/agents/auto-pom/index.ts
    │    visual-regression)            ├── npx tsx src/agents/visual-a11y/index.ts
    │                                  ├── npx tsx src/agents/visual-regression/index.ts
    └── POST /api/playground           └── npx tsx src/skills/log-analyzer/index.ts
        (SSE stream)                            │
                                                └── Anthropic API (or MOCK)
                                                        │
                                                        └── output/*.md / *.json / *.ts
```

---

## LLM Client (`src/core/llm-client.ts`)

The LLM client is a thin wrapper around `@anthropic-ai/sdk`:

- **Key present** (`ANTHROPIC_API_KEY` in `.env`) → calls Claude API (real cost, real latency)
- **Key absent** → returns deterministic MOCK responses (instant, free, CI-safe)

Every agent/skill calls `askClaude()` and `warnMockMode()` from this module. No agent needs to branch on mock vs live — the client handles it transparently.

---

## Agent Subfolder Convention

Each agent follows this structure:
```
src/agents/<name>/
└── index.ts          # exports: run*(), createMock*(), interface types
```

Entry point detection for CLI:
```typescript
const isMain = process.argv[1]?.includes('<name>')
if (isMain) { runDemoTest().catch(...) }
```

This means `npx tsx src/agents/self-healing/index.ts` runs the demo, while `import { suggestLocator } from './src/agents/self-healing/index'` just imports the functions.

---

## GitHub Pages Deployment

The React app is built with `GITHUB_ACTIONS=true` which sets `base: '/intelligent-testing-toolkit/'` in Vite config. HashRouter ensures all client-side navigation uses hash URLs (`#/agents`, `#/generate`) that never hit the server — no 404 redirect hacks needed.

See `.github/workflows/deploy-pages.yml`.
