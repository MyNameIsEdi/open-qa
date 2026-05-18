# Getting Started

Get open-qa running in under 5 minutes — no API key required for MOCK mode.

---

## Prerequisites

- **Node.js 18+** (20 LTS recommended) — [nodejs.org](https://nodejs.org)
- **npm 9+** — included with Node.js
- **Git**

---

## 1. Clone & Install

```bash
git clone https://github.com/MyNameIsEdi/intelligent-testing-toolkit.git
cd intelligent-testing-toolkit
npm install
npx playwright install chromium
```

---

## 2. Start the Full App

```bash
npm run dev
```

This starts two processes concurrently:
- **Vite dev server** → `http://localhost:5174` (React UI)
- **Express API** → `http://localhost:3001` (agent runner + playground)

Open **http://localhost:5174** in your browser. You'll see the open-qa marketplace.

> All agents and the Playground/Generate pages work immediately in **MOCK mode** — no API key needed. Responses are deterministic and instant.

---

## 3. Explore the UI

| Page | URL | Try this |
|------|-----|----------|
| Agents | `/#/agents` | Click **▶ Run** on Self-Healing Locator |
| Playground | `/#/playground` | Pick "The Hacker QA", paste an API schema, click Run |
| Generate | `/#/generate` | Paste a user story, click Generate Test |
| Cheatsheet | `/#/cheatsheet` | Click any code snippet to copy it |
| Prompts | `/#/prompts` | Browse 6 expert QA prompts |

---

## 4. Run CLI Scripts

Run agents directly from the terminal without starting the UI:

```bash
npm run run:healing              # Self-Healing Locator demo
npm run run:datagen              # Smart edge-case data generator
npm run run:bugreport            # Bug triage → output/AI_BUG_REPORT.md
npm run run:visual-regression    # Visual diff → output/visual-regression/
npm run run:auto-pom             # POM generator → output/auto-pom/
npm run run:visual-a11y          # A11y scan → output/A11Y_REPORT.md
```

---

## 5. Run the Test Suite

```bash
npm test          # Playwright end-to-end + unit specs (6 tests)
npm run typecheck # TypeScript strict check (src/ + ui/)
```

All 6 tests pass in MOCK mode without any API key.

---

## 6. Enable Live Claude (Optional)

```bash
cp .env.example .env
```

Edit `.env` and add your key:
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Restart with `npm run dev`. All agents now call the real Claude API (`claude-3-5-sonnet-20241022`).

> **Cost note:** Each agent run typically costs $0.001–$0.01 depending on DOM/log size.

---

## All npm Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Start UI + API server together |
| `npm run ui:dev` | Vite dev server only (port 5174) |
| `npm run server:dev` | Express API only (port 3001) |
| `npm run ui:build` | Production build → `dist-ui/` |
| `npm test` | Playwright test suite |
| `npm run typecheck` | TypeScript check (src + ui) |
| `npm run run:healing` | Self-Healing Locator CLI |
| `npm run run:datagen` | Smart Data Gen CLI |
| `npm run run:bugreport` | Bug Triage CLI |
| `npm run run:visual-regression` | Visual Regression CLI |
| `npm run run:auto-pom` | Auto-POM Builder CLI |
| `npm run run:visual-a11y` | Visual A11y Scanner CLI |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Enables live Claude calls. Omit for MOCK mode. |

---

## Troubleshooting

**Port 3001 already in use:**
```bash
npx kill-port 3001
```

**Playwright install issues on Windows:**
```bash
npx playwright install --with-deps chromium
```

**TypeScript errors after pulling:**
```bash
npm install
npm run typecheck
```
