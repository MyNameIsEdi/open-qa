# Architecture

open-qa separates concerns cleanly across four layers.

---

## Folder Structure

```
open-qa/
├── src/                    # Core AI logic (Node.js / TypeScript)
│   ├── agents/
│   │   ├── self-healing.ts        # Self-Healing Locator agent
│   │   └── visual-regression.ts   # Visual regression (planned)
│   ├── skills/
│   │   ├── generate-test-data.ts  # Smart Data Gen
│   │   ├── log-analyzer.ts        # Automated Bug Triage
│   │   ├── prompts/               # Edge-case prompt strings
│   │   └── fixtures/              # Mock log files for testing
│   └── core/
│       └── llm-client.ts          # Anthropic SDK wrapper (MOCK + live)
│
├── ui/                     # React/Vite/Tailwind marketplace app
│   ├── index.html
│   ├── vite.config.ts             # base: /intelligent-testing-toolkit/ on CI
│   ├── tailwind.config.js         # OpenHuman design tokens
│   └── src/
│       ├── components/            # Navbar, AgentCard, SkillCard, PromptCard
│       └── pages/                 # Home, Agents, Skills, Prompts, Docs
│
├── server/                 # Express API (port 3001)
│   └── index.ts                   # /api/agents, /api/skills, /api/run/:id
│
├── tests/                  # Playwright test suite
├── output/                 # Generated artifacts (bug reports, test data)
├── .github/
│   ├── workflows/
│   │   ├── deploy-pages.yml       # Build + deploy UI to GitHub Pages
│   │   ├── update-wiki.yml        # Sync .github/wiki/ to GitHub Wiki
│   │   ├── playwright-ci.yml      # Run Playwright tests on every PR
│   │   └── ci.yml                 # TypeScript + demo verification
│   └── wiki/                      # Wiki source files (synced by workflow)
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI / LLM | Anthropic Claude (Sonnet) via `@anthropic-ai/sdk` |
| Automation | Playwright Test |
| Runtime | TypeScript 5.x, Node.js 18+ |
| UI | React 18 + Vite 6 + Tailwind CSS 3 |
| UI routing | React Router v6 (HashRouter — works on GitHub Pages) |
| UI design system | OpenHuman token system (colors, fonts, shadows, animations) |
| API server | Express 4 |
| CI | GitHub Actions |
| Hosting | GitHub Pages (`gh-pages` branch) |

---

## Data Flow

```
Browser (React UI)
    │
    ├── GET /api/agents       ──► Express server (port 3001)
    ├── GET /api/skills            │
    └── POST /api/run/:id          │
                                   ├── npx tsx src/agents/self-healing.ts
                                   ├── npx tsx src/skills/generate-test-data.ts
                                   └── npx tsx src/skills/log-analyzer.ts
                                                │
                                                └── Anthropic API (or MOCK)
                                                        │
                                                        └── output/*.md / *.json
```

---

## LLM Client (`src/core/llm-client.ts`)

The LLM client is a thin wrapper around `@anthropic-ai/sdk`. It checks for `ANTHROPIC_API_KEY`:

- **Key present** → calls Claude API (real cost, real latency)
- **Key absent** → returns deterministic MOCK responses (instant, free, CI-safe)

This design means all agents and skills work in both modes without branching code.

---

## GitHub Pages Deployment

The React app is built with `GITHUB_ACTIONS=true` which sets `base: '/intelligent-testing-toolkit/'` in Vite config. This ensures all asset URLs are correct for the GitHub Pages subpath. HashRouter means no server-side routing is needed — all navigation is hash-based.

See `.github/workflows/deploy-pages.yml`.
