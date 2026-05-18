# open-qa Wiki

**open-qa** is an AI-powered QA platform — a Node.js agent core (self-healing tests, data generation, bug triage, accessibility scanning, visual regression, POM generation) paired with a React/Vite/Tailwind marketplace UI.

🌐 **Live site:** [mynameisedi.github.io/intelligent-testing-toolkit](https://mynameisedi.github.io/intelligent-testing-toolkit/)  
📦 **Repo:** [github.com/MyNameIsEdi/intelligent-testing-toolkit](https://github.com/MyNameIsEdi/intelligent-testing-toolkit)

---

## Wiki Pages

| Page | Description |
|------|-------------|
| [[Getting Started]] | Install, run in MOCK mode, start the full app |
| [[Agents]] | All 7 autonomous QA agents — 5 active, 2 planned |
| [[Skills]] | All 5 testing skills — active & planned |
| [[Prompts]] | 6 system prompts for Claude, Cursor, or any LLM |
| [[Architecture]] | Folder structure, tech stack, data flow |
| [[MCP Integration]] | "Add to Claude" button, Claude Desktop setup, MCP roadmap |
| [[Contributing]] | Fork/PR workflow, checklist, release process |

---

## Quick Start

```bash
git clone https://github.com/MyNameIsEdi/intelligent-testing-toolkit.git
cd intelligent-testing-toolkit
npm install
npx playwright install chromium
npm run dev       # starts UI (port 5174) + API server (port 3001)
```

Open **http://localhost:5174** to browse the marketplace.

---

## Active Agents

| Agent | Run Command | Output |
|-------|-------------|--------|
| Self-Healing Locator | `npm run run:healing` | Console + healed locator |
| Automated Bug Triage | `npm run run:bugreport` | `output/AI_BUG_REPORT.md` |
| Auto-POM Builder | `npm run run:auto-pom` | `output/auto-pom/*.ts` |
| Visual Regression Agent | `npm run run:visual-regression` | `output/visual-regression/*.md` |
| Visual A11y Scanner | `npm run run:visual-a11y` | `output/A11Y_REPORT.md` |

---

## UI Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, getting started, feature overview |
| `/#/agents` | Agents | 7-agent catalog with Run buttons |
| `/#/skills` | Skills | 5-skill catalog |
| `/#/prompts` | Prompts | 6 system prompts with copy/export |
| `/#/playground` | Playground | Live prompt runner with SSE streaming |
| `/#/generate` | Test Generator | User story → `.spec.ts` with download |
| `/#/cheatsheet` | Cheatsheet | 10 collapsible QA reference sections |
| `/#/docs` | Docs | Architecture + integration docs |

---

## MOCK Mode

All agents and skills work **without an API key** in MOCK mode — instant, deterministic, CI-safe. Set `ANTHROPIC_API_KEY` in `.env` for live Claude calls.
