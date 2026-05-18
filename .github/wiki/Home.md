# open-qa Wiki

**open-qa** is an AI-powered QA platform that merges the [intelligent-testing-toolkit](https://github.com/MyNameIsEdi/intelligent-testing-toolkit) core with an [OpenHuman](https://github.com/tinyhumansai/openhuman)-inspired React/Tailwind UI.

🌐 **Live site:** [mynameisedi.github.io/intelligent-testing-toolkit](https://mynameisedi.github.io/intelligent-testing-toolkit/)

---

## Wiki Pages

| Page | Description |
|------|-------------|
| [[Getting Started]] | Install, run in MOCK mode, start the full app |
| [[Agents]] | All 6 autonomous QA agents — active & planned |
| [[Skills]] | All 5 testing skills — active & planned |
| [[Prompts]] | 6 system prompts for Claude, Cursor, or any LLM |
| [[Architecture]] | Folder structure, tech stack, data flow |
| [[MCP Integration]] | "Add to Claude" button, Claude Desktop setup, MCP roadmap |
| [[Contributing]] | Fork/PR workflow, checklist, release process |

---

## Quick Start

```bash
git clone https://github.com/MyNameIsEdi/intelligent-testing-toolkit.git open-qa
cd open-qa
npm install
npm run dev       # starts UI (port 5174) + API server (port 3001)
```

Open **http://localhost:5174** to browse the marketplace.

## Key Features

- 🔧 **Self-Healing Locator** — AI fixes broken Playwright selectors automatically
- 🎲 **Smart Data Gen** — generates SQLi, XSS, nulls, RTL, boundary payloads
- 🐛 **Automated Bug Triage** — error logs → Jira-ready Markdown reports
- 🤖 **Add to Claude** — one-click export of any agent/skill to Claude's tool format
- 🖥️ **OpenHuman-style UI** — React + Vite + Tailwind with premium design tokens
- 🔌 **Express API** — HTTP endpoints to trigger agents from the UI or CI

## MOCK Mode

All agents and skills work **without an API key** in MOCK mode. Set `ANTHROPIC_API_KEY` in `.env` for live Claude calls.
