# Getting Started

## Prerequisites

- **Node.js** 18+ (20 recommended)
- **npm** 9+
- No Rust, no Tauri, no special build tools required

---

## 1. Clone & Install

```bash
git clone https://github.com/MyNameIsEdi/intelligent-testing-toolkit.git open-qa
cd open-qa
npm install
npx playwright install chromium
```

---

## 2. MOCK Mode (no API key needed)

All demos run with deterministic mock outputs — no `ANTHROPIC_API_KEY` required:

```bash
npm test              # Playwright test suite
npm run verify:demos  # All demo scripts + output verification
npm run typecheck     # TypeScript strict check (src + ui)
```

---

## 3. Start the Full App

```bash
npm run dev
```

This starts two processes concurrently:
- **React UI** → http://localhost:5174 (Vite dev server)
- **Express API** → http://localhost:3001 (agent runner)

Open http://localhost:5174 in your browser to use the marketplace.

---

## 4. Live Claude Mode (optional)

```bash
cp .env.example .env
# Edit .env and set:
# ANTHROPIC_API_KEY=sk-ant-...
```

Then run any agent with a real LLM call:

```bash
npm run run:healing      # Self-Healing Locator
npm run run:datagen      # Smart Data Gen
npm run run:bugreport    # Automated Bug Triage
```

---

## Individual Scripts

| Script | What it does |
|--------|-------------|
| `npm run dev` | Start UI + API server together |
| `npm run ui:dev` | Vite dev server only (port 5174) |
| `npm run server:dev` | Express API only (port 3001) |
| `npm run ui:build` | Production build → `dist-ui/` |
| `npm test` | Playwright test suite |
| `npm run typecheck` | TypeScript check (src + ui) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Enables live Claude calls. Omit for MOCK mode. |

Copy `.env.example` to `.env` to get started.
