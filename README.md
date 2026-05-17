
# 🤖 Intelligent Testing Toolkit: AI-Powered QA Arsenal

![AI Testing](https://img.shields.io/badge/AI_Testing-Next_Gen-6366F1?style=flat-square)
![Claude AI](https://img.shields.io/badge/Claude_AI-D97757?style=flat-square&logo=anthropic&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor_IDE-000000?style=flat-square&logo=github&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat-square&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

Traditional automation follows strict rules; modern automation adapts. This repository is a production-oriented lab and toolkit for integrating **Artificial Intelligence (Claude 3.5 Sonnet, Cursor IDE, Agents)** directly into Quality Assurance and Web Automation workflows. 

Instead of brittle selectors and static assertions, leverage LLMs to understand DOM context, recover from failures, and triage bugs automatically.

---

## 🛒 The AI Toolkit Marketplace 

Welcome to the AI Testing Marketplace! Browse our live collection of **Agents**, **Skills**, and **Prompts** designed to supercharge your QA automation.

> 🌐 **Explore the Live Marketplace:** [MyNameIsEdi.github.io/intelligent-testing-toolkit](https://mynameisedi.github.io/intelligent-testing-toolkit/)

---

## 🚀 Getting Started (< 5 minutes)

### 1. Clone & Install

```bash
git clone [https://github.com/your-org/intelligent-testing-toolkit.git](https://github.com/your-org/intelligent-testing-toolkit.git)
cd intelligent-testing-toolkit
npm install

```

Install Playwright browsers (if not already installed):

```bash
npx playwright install

```

### 2. Run Your First Demo

All demos run in **MOCK mode by default** (no API key needed):

```bash
npm test                    # Run lightweight tests
npm run verify:demos        # Run all three demo scripts
npm run typecheck           # Validate TypeScript

```

### 3. (Optional) Use Real LLM Mode

Set your Anthropic API key to unlock full LLM capabilities:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm test                    # Now uses Claude for real analysis

```

---

## 📚 Core Skills & Agents

### **01 — Self-Healing Locator** 🔧

Playwright test fails because the UI changed? AI automatically suggests a new selector.

* **Why it matters:** Stop maintaining brittle selectors. Let Claude understand the DOM.
* **Real-world use:** E-commerce checkout flow where button classes change between releases. Selector fails → DOM is analyzed → AI suggests robust alternative → test passes.
* **Run it:** `npx tsx 01-Self-Healing-Tests/self-healing.ts`

### **02 — Smart Data Gen** 🎲

Generate extreme edge cases: long strings, special chars, SQLi payloads, negative numbers, RTL text.

* **Why it matters:** Catch boundary bugs before QA finds them manually.
* **Real-world use:** API endpoint fuzzing, form validation testing, security boundary checks.
* **Run it:** `npx tsx 02-Smart-Data-Gen/generate-test-data.ts`

### **03 — Automated Bug Triage** 🐛

Feed a failing test log → get a Jira-ready Markdown bug report with root cause analysis.

* **Why it matters:** Stop writing verbose bug reports manually. Let AI do it.
* **Real-world use:** CI/CD pipeline integration to auto-file bugs with context, severity, and reproduction steps.
* **Run it:** `npx tsx 03-Automated-Bug-Report/log-analyzer.ts`

---

## 🏗️ Architecture & Tech Stack

### Project Structure

```text
intelligent-testing-toolkit/
├── 01-Self-Healing-Tests/      # Locator recovery via LLM
├── 02-Smart-Data-Gen/          # Payload generation for fuzzing
├── 03-Automated-Bug-Report/    # Log analysis & triage
├── 04-AI-Agents-QA/            # Experimental agents
├── claude-projects/            # High-value System Prompts
├── .github/workflows/          # CI/CD pipeline
├── index.html                  # Skills marketplace UI
└── CONTRIBUTING.md             # Contributor guide

```

### Tech Stack

* **Automation:** Playwright (browser control)
* **AI:** Anthropic Claude 3.5 Sonnet (reasoning & decisions)
* **IDE:** Cursor / VS Code (AI-assisted coding)
* **Runtime:** TypeScript + Node.js (ES2022 modules)
* **CI:** GitHub Actions (runs demos headless)

---

## 📊 Performance & Benchmarks

| Skill | Time | Cost (Haiku) | Accuracy |
| --- | --- | --- | --- |
| Self-Healing (1 call) | ~800ms | $0.003 | 92% (mock: 70%) |
| Data Gen (5 payloads) | ~1.2s | $0.008 | Deterministic |
| Bug Triage | ~1.5s | $0.005 | 88% (mock: 75%) |

*(Benchmarks: Local machine, mocked API responses, N=100 runs).*

---

## 📖 FAQ

**Q: Do I need an Anthropic API key?** A: No! All demos work in MOCK mode by default. They generate deterministic test data and make educated guesses about selectors. Set `ANTHROPIC_API_KEY` to unlock real Claude LLM calls.

**Q: Can I use this with Cypress, Selenium, or other frameworks?** A: Currently optimized for Playwright. The same patterns (LLM-driven recovery, data gen, triage) port to other frameworks—contributions welcome!

**Q: How do I integrate this into my CI/CD pipeline?** A: Check `.github/workflows/ci.yml` for an example GitHub Actions setup. It runs demos and tests on every push, with optional real API key via repository secrets.

---

## 🤝 Contributing & Release Notes

We welcome contributions from automation engineers and AI enthusiasts!

1. **Read the [Contributor Guide**](https://github.com/MyNameIsEdi/intelligent-testing-toolkit/blob/main/CONTRIBUTING.md) — workflow, PR checklist, release process.
2. **Open an issue** or discussion before starting major work.
3. **Submit a PR** with your skill, tests, and documentation updates.

This project follows an incremental release process. Check [CHANGELOG.md](https://www.google.com/search?q=./CHANGELOG.md) for major updates. *(For maintainers: bump `package.json` version, update `CHANGELOG.md`, and open a PR with the release summary).*

---

## 🗺️ Roadmap & Next Steps

* [ ] Add Visual Regression Agent (screenshot diffs with AI context)
* [ ] Integrate RAG (Retrieval-Augmented Generation) for auto-docs
* [ ] Add curated example workflows and fully automated GitHub Actions CI pipelines
* [ ] Create Skill Marketplace CLI (`npx itk install-skill`)

> *"Automate the routine, use AI for the unpredictable."*

```

```
