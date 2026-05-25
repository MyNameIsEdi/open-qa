# Open-QA Wiki

Welcome to the Open-QA wiki — your quick-reference for the multi-agent Playwright automation framework.

For the full documentation see the [README](https://github.com/MyNameIsEdi/open-qa#readme).

---

## Quick links

| Topic | Description |
|---|---|
| [Quick Start](https://github.com/MyNameIsEdi/open-qa#-quick-start) | Clone, install, configure LLM, run |
| [Playwright Dashboard](https://github.com/MyNameIsEdi/open-qa#-features) | Run tests, stream live output, view KPIs |
| [CLI Agents](https://github.com/MyNameIsEdi/open-qa#-cli-agents) | Self-healing, Auto-POM, Bug Triage, A11y, Visual Regression, Data Gen |
| [Switching LLMs](https://github.com/MyNameIsEdi/open-qa#-switching-llm-providers) | Gemini ↔ Ollama toggle |
| [Contributing](https://github.com/MyNameIsEdi/open-qa/blob/main/CONTRIBUTING.md) | PR guidelines, code style, branch naming |
| [Changelog](https://github.com/MyNameIsEdi/open-qa/blob/main/CHANGELOG.md) | Release notes |

---

## Architecture overview

```
Browser (React 18 + Vite)  →  Express API (port 3001)  →  Gemini / Ollama
                                      ↓
                              Playwright child process
                                      ↓
                              SSE stream back to UI
                                      ↓
                              SQLite  (test-results/runs.db)
```

---

*This page is auto-synced from `.github/wiki/Home.md` on every push to `main`.*
