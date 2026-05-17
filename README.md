# 🤖 AI-Powered QA & Testing Arsenal

![AI in QA](https://img.shields.io/badge/AI_Testing-Next_Gen-6366F1?style=flat-square)
![Claude AI](https://img.shields.io/badge/Claude_AI-D97757?style=flat-square&logo=anthropic&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor_IDE-000000?style=flat-square&logo=github&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat-square&logo=Playwright&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

Traditional automation follows strict rules; modern automation adapts. This repository is my personal lab and toolkit for integrating **Artificial Intelligence (Claude 3.5 Sonnet, Cursor IDE, Agents)** directly into Quality Assurance and Web Automation workflows.

---

## 🎯 Purpose of this Repository

As applications grow more dynamic, static assertions and brittle locators are no longer enough. This repo demonstrates how to leverage **Claude's reasoning capabilities** and **Cursor's AI-first coding environment** to build smarter, self-maintaining, and highly analytical testing frameworks.

---

## 🛒 The AI Toolkit Marketplace 

Welcome to the AI Testing Marketplace! Browse our collection of **Agents**, **Skills**, and **Prompts** designed to supercharge your QA automation.

> Open the live HTML marketplace: [index.html](https://mynameisedi.github.io/intelligent-testing-toolkit/)

# 🤖 Intelligent Testing Toolkit — Professional Edition

![AI Testing](https://img.shields.io/badge/AI_Testing-Next_Gen-6366F1?style=flat-square)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

Cleaner, production-oriented version of the AI-powered QA toolkit: curated agents, clear docs, examples, and an approachable onboarding flow for contributors and teams.

---

**Quick links**
- Live demo: [index.html](./index.html)
- Examples: [01-Self-Healing-Tests](./01-Self-Healing-Tests)
- Data gen: [02-Smart-Data-Gen](./02-Smart-Data-Gen)

## Overview
This repository demonstrates how to combine modern automation (Playwright) with LLM-driven logic to build resilient, self-healing, and analytical test systems.

Key features
- Self-healing locator strategies using DOM context + LLMs
- Automated bug triage and CI-friendly report generation
- Edge-case test-data generators for API fuzzing

## Quickstart
Requirements: Node.js 18+ and npm/yarn

Install dependencies:

```bash
git clone https://github.com/your-org/intelligent-testing-toolkit.git
cd intelligent-testing-toolkit
npm install
```

Run an example (self-healing tests):

```bash
npm run test -- 01-Self-Healing-Tests/self-healing.ts
```

If you don't have Playwright browsers installed, run:

```bash
npx playwright install
```

## Repo Structure
- `01-Self-Healing-Tests/` — Playwright self-healing examples
- `02-Smart-Data-Gen/` — data generation scripts & prompts
- `03-Automated-Bug-Report/` — log analysis & report generation
- `04-AI-Agents-QA/` — experimental agents and vision tools

## Usage Examples
- See `02-Smart-Data-Gen/generate-test-data.ts` for data-gen usage
- See `03-Automated-Bug-Report/log-analyzer.ts` for CI log analysis examples

## Contributing
Please read the contributor guide: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Release Notes
The project follows an incremental release process with a `CHANGELOG.md` tracking major updates, feature improvements, and fixes.
For maintainers: bump `package.json` version, update `CHANGELOG.md`, and open a PR with the release summary.

## Next Steps (what I will do next)
- Add curated example workflows and automated CI
- Improve `index.html` marketplace UX and live demo

---

If you'd like, I can now: update `index.html` UI, add runnable examples, or scaffold CI workflows. Pick one to continue.
