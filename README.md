
# 🤖 Intelligent Testing Toolkit: AI-Powered QA Arsenal

![AI Testing](https://img.shields.io/badge/AI_Testing-Next_Gen-6366F1?style=flat-square)
![Claude AI](https://img.shields.io/badge/Claude_AI-D97757?style=flat-square&logo=anthropic&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor_IDE-000000?style=flat-square&logo=github&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

Traditional automation follows strict rules; modern automation adapts. This repository is a production-oriented lab and toolkit for integrating **Artificial Intelligence (Claude 3.5 Sonnet, Cursor IDE, Agents)** directly into Quality Assurance and Web Automation workflows. 

Designed for modern testing teams, this toolkit provides curated agents, clear documentation, runnable examples, and an approachable onboarding flow.

---

## 🛒 The AI Toolkit Marketplace 

Welcome to the AI Testing Marketplace! Browse our live collection of **Agents**, **Skills**, and **Prompts** designed to supercharge your QA automation.

> 🌐 **Explore the Live Marketplace:** [MyNameIsEdi.github.io/intelligent-testing-toolkit](https://mynameisedi.github.io/intelligent-testing-toolkit/)

---

## 🎯 Repository Overview

As applications grow more dynamic, static assertions and brittle locators are no longer enough. This repository demonstrates how to combine modern automation (Playwright) with LLM-driven logic to build smarter, self-maintaining, and highly analytical testing frameworks.

### ✨ Key Features
*   **Self-Healing Locators:** Dynamic strategies using DOM context + LLMs to auto-repair broken tests.
*   **Automated Bug Triage:** Scripts that analyze CI failures and generate Jira-ready reports.
*   **Smart Data Generation:** LLM-driven pipelines for creating complex, edge-case heavy API payloads.
*   **Vision & Agentic QA:** Autonomous navigation and visual anomaly detection.

---

## 📂 Architecture & Repo Structure

*   [`/01-Self-Healing-Tests`](./01-Self-Healing-Tests) — Playwright self-healing concepts and auto-locator scripts.
*   [`/02-Smart-Data-Gen`](./02-Smart-Data-Gen) — Data generation pipelines and prompt engineering for API fuzzing.
*   [`/03-Automated-Bug-Report`](./03-Automated-Bug-Report) — CI log analysis and automated report generation tools.
*   [`/04-AI-Agents-QA`](./04-AI-Agents-QA) — Experimental autonomous agents and vision-based testing tools.
*   [`/claude-projects`](./claude-projects) — High-value System Prompts (PRD Analysis, Test Plan Generation) for AI interactions.

---

## 🚀 Quickstart Guide

**Prerequisites:** Node.js 18+ and npm/yarn.

**1. Install dependencies:**
```bash
npm install

```

**2. Install Playwright browsers (if not already installed):**

```bash
npx playwright install

```

**3. Run an example (Self-Healing Tests):**

```bash
npm run test -- 01-Self-Healing-Tests/src/auto-locator.ts

```

> **Usage Tip:** Check out `02-Smart-Data-Gen/prompts/claude-data-gen.md` for data-gen usage, and `03-Automated-Bug-Report/src/log-analyzer.ts` for CI log analysis examples.

---

## 🤝 Contributing

We welcome contributions from automation engineers and AI enthusiasts! Please read the [Contributor Guide](https://www.google.com/search?q=./CONTRIBUTING.md) before submitting pull requests.

### 📦 Release Notes

This project follows an incremental release process. Check the `CHANGELOG.md` for major updates, feature improvements, and fixes.
*(For maintainers: bump `package.json` version, update `CHANGELOG.md`, and open a PR with the release summary).*

---

## 🗺️ Roadmap & Next Steps

* [ ] Add curated example workflows and fully automated GitHub Actions CI pipelines.
* [ ] Improve `index.html` marketplace UX and expand the live demo.
* [ ] Integrate RAG (Retrieval-Augmented Generation) for automatic test documentation updates.

> *"Automate the routine, use AI for the unpredictable."*

```

```
