# open-qa — AI-Powered QA Arsenal

![open-qa](https://img.shields.io/badge/open--qa-AI%20Testing-6366F1?style=flat-square)
![Claude AI](https://img.shields.io/badge/Claude_AI-D97757?style=flat-square&logo=anthropic&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

**open-qa** merges the [intelligent-testing-toolkit](https://github.com/MyNameIsEdi/intelligent-testing-toolkit) QA core with an [OpenHuman](https://github.com/tinyhumansai/openhuman)-inspired React/Tailwind UI into a single, cohesive AI-powered QA platform.

---

## What's inside

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Core** (`src/`) | TypeScript + Node.js | AI agents & skills (self-healing, data gen, bug triage) |
| **UI** (`ui/`) | React 18 + Vite + Tailwind CSS | OpenHuman-style marketplace — browse and launch every agent |
| **Server** (`server/`) | Express 4 | REST API that runs agents and streams output to the UI |
| **Tests** (`tests/`) | Playwright Test | End-to-end automation specs leveraging the AI core |

---

## Getting Started (< 5 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/MyNameIsEdi/intelligent-testing-toolkit.git open-qa
cd open-qa
npm install
npx playwright install chromium
```

### 2. Run in MOCK mode (no API key needed)

```bash
npm test              # Playwright specs
npm run verify:demos  # All demo scripts + output verification
npm run typecheck     # TypeScript strict check
```

### 3. Start the full app

```bash
npm run dev           # Starts Express API (port 3001) + Vite UI (port 5173)
```

Then open **http://localhost:5173** — the open-qa marketplace.

### 4. (Optional) Live Claude mode

```bash
cp .env.example .env
# Set ANTHROPIC_API_KEY=sk-ant-...
npm run run:healing
npm run run:datagen
npm run run:bugreport
```

---

## Core Agents & Skills

### Self-Healing Locator 🔧
Playwright test fails because the UI changed? Claude suggests a new `getByRole` / `getByTestId` locator.
- **Run:** `npm run run:healing`

### Smart Data Gen 🎲
Generates extreme edge cases: SQLi, XSS, nulls, RTL text, boundary numbers.
- **Output:** `output/generated-edge-cases.json`
- **Run:** `npm run run:datagen`

### Automated Bug Triage 🐛
Reads `src/skills/fixtures/mock-error.log` → writes Jira-ready Markdown with RCA.
- **Output:** `output/AI_BUG_REPORT.md`
- **Run:** `npm run run:bugreport`

---

## UI Scripts

```bash
npm run ui:dev      # Vite dev server only (port 5173)
npm run ui:build    # Production build → dist-ui/
npm run ui:preview  # Preview production build
```

## Server Scripts

```bash
npm run server:dev  # Express API server only (port 3001)
```

---

## Architecture

```
open-qa/
├── src/                  # Core AI Logic
│   ├── agents/           # Self-healing, visual regression
│   ├── skills/           # Data-gen, log-analyzer, prompts
│   └── core/             # LLM client (Anthropic SDK)
├── ui/                   # React/Vite/Tailwind marketplace
│   └── src/
│       ├── components/   # Navbar, AgentCard, SkillCard, PromptCard
│       └── pages/        # Home, Agents, Skills, Prompts, Docs
├── server/               # Express API (port 3001)
├── tests/                # Playwright suite
└── output/               # Generated artifacts
```

---

## 🤖 Add to Claude

Every agent and skill card has an **"Add to Claude"** button that copies a complete tool payload:

```json
{
  "name": "Self-Healing Locator",
  "system_prompt": "...",
  "tool_schema": { "name": "self_healing_locator", ... },
  "run_command": "npx tsx src/agents/self-healing.ts"
}
```

Paste into Claude Desktop → Settings → Tools, or into a Claude API `tools` array.

---

## Roadmap

- [ ] Native MCP server (`npx open-qa mcp-server`)
- [ ] Auto-POM Builder
- [ ] Visual A11y Scanner
- [ ] GraphQL Fuzzer
- [ ] Visual Regression Agent

---

> *"Automate the routine, use AI for the unpredictable."*
