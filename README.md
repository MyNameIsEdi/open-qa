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

Welcome to the AI Testing Marketplace! Browse our collection of **Agents**, **Skills**, and **Prompts** across the multi-page UI:

| Page | Description |
|------|-------------|
| [index.html](./index.html) | Landing — hero, getting started, repo overview |
| [agents.html](./agents.html) | Autonomous agents (self-healing, triage) |
| [skills.html](./skills.html) | Testing skills & data generators |
| [prompts.html](./prompts.html) | System prompts library |

> 🌐 **Live site:** [MyNameIsEdi.github.io/intelligent-testing-toolkit](https://mynameisedi.github.io/intelligent-testing-toolkit/)

---

## 🚀 Getting Started (< 5 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/MyNameIsEdi/intelligent-testing-toolkit.git
cd intelligent-testing-toolkit
npm install
npx playwright install chromium
```

### 2. Run Your First Demo

All demos run in **MOCK mode by default** (no API key needed):

```bash
npm test                    # Playwright specs (self-healing + helpers)
npm run verify:demos        # Run all three demo scripts + verify outputs
npm run typecheck           # Strict TypeScript check
```

### 3. (Optional) Use Real LLM Mode

```bash
cp .env.example .env
# Set ANTHROPIC_API_KEY=sk-ant-...
npm run run:healing
npm run run:datagen
npm run run:bugreport
```

---

## 📚 Core Skills & Agents

### **01 — Self-Healing Locator** 🔧

Playwright test fails because the UI changed? AI suggests a new `getByRole` / `getByTestId` locator from stripped DOM context.

- **Run:** `npx tsx 01-Self-Healing-Tests/src/auto-locator.ts`
- **Test:** `npm run test:healing`

### **02 — Smart Data Gen** 🎲

Generates extreme edge cases: SQLi, XSS, nulls, RTL text, boundary numbers.

- **Output:** `02-Smart-Data-Gen/output/generated-edge-cases.json`
- **Run:** `npx tsx 02-Smart-Data-Gen/src/generate-test-data.ts`

### **03 — Automated Bug Triage** 🐛

Reads `mock-error.log` → writes Jira-ready Markdown with RCA and reproduction steps.

- **Output:** `03-Automated-Bug-Report/output/AI_BUG_REPORT.md`
- **Run:** `npx tsx 03-Automated-Bug-Report/src/log-analyzer.ts`

---

## 🏗️ Architecture & Tech Stack

```text
intelligent-testing-toolkit/
├── 01-Self-Healing-Tests/src/auto-locator.ts
├── 02-Smart-Data-Gen/src/generate-test-data.ts
├── 03-Automated-Bug-Report/src/log-analyzer.ts
├── lib/ai-client.ts              # Shared Anthropic + MOCK mode
├── tests/healing.spec.ts         # Playwright self-healing demo
├── index.html | agents.html | skills.html | prompts.html
├── .github/workflows/playwright-ci.yml
└── README.md                     # You are here
```

| Layer | Technology |
|-------|------------|
| Automation | Playwright Test |
| AI | Anthropic Claude 3.5 Sonnet |
| Runtime | TypeScript (strict), Node 18+ |
| CI | GitHub Actions (Chromium, artifact upload) |

---

## 📊 Performance & Benchmarks

| Skill | Time | Cost (Sonnet) | Notes |
|-------|------|---------------|-------|
| Self-Healing (1 call) | ~800ms | ~$0.01 | MOCK: heuristic test-id |
| Data Gen (5 payloads) | ~1.2s | ~$0.02 | MOCK: deterministic |
| Bug Triage | ~1.5s | ~$0.02 | MOCK: template RCA |

---

## 📖 FAQ

**Q: Do I need an Anthropic API key?**  
A: No. All demos work in MOCK mode. Set `ANTHROPIC_API_KEY` for live Claude calls.

**Q: Can I use Cypress or Selenium?**  
A: Patterns port cleanly; this repo is optimized for Playwright.

**Q: CI integration?**  
A: See `.github/workflows/playwright-ci.yml` — runs `npm test` on push/PR to `main`.

---

## 🧠 System Prompts Library

Copy-paste these into Claude, ChatGPT, or Cursor. Full text below — click to expand.

<details>
<summary><strong>PRD to Test Matrix</strong> — Convert requirements into exhaustive test plans</summary>

# System Prompt: AI Test Plan Generator

## Role Context
You are an elite Lead QA Architect with over 15 years of experience in enterprise software testing. You possess a hacker's mindset and a deep understanding of complex system architectures. Your expertise lies in breaking down ambiguous Product Requirements Documents (PRDs) or user stories into exhaustive, highly structured, and actionable Test Plans.

## Objective
Your goal is to analyze the provided feature description and generate a comprehensive Test Plan that covers every possible angle—functional, non-functional, and extreme edge cases—ensuring zero critical bugs reach production.

## Execution Instructions
Whenever the user provides a feature description, PRD, or user story, you must output a detailed Test Plan following this exact Markdown structure:

### 1. Feature Overview & Risk Assessment
- **Summary:** A brief (2-3 sentences) summary of the feature and its business value.
- **High-Risk Areas:** Identify 2-3 areas where this feature is most likely to break or cause regressions in the existing system.

### 2. Scope Definition
- **In Scope:** Bullet points of what must be tested.
- **Out of Scope:** What is explicitly NOT being tested in this cycle (to save time and focus efforts).

### 3. Test Matrix (Use Tables)
Generate detailed tables for each of the following categories.  
*Columns needed: `Test ID` | `Test Scenario` | `Expected Result` | `Priority (High/Med/Low)`*

- **A. Functional (Happy Path):** The intended workflows and standard user journeys.
- **B. Negative Testing:** Invalid inputs, null values, unauthorized access attempts, broken network state, and error handling.
- **C. Edge Cases & Boundary Values:** Maximum/minimum character limits, concurrent user actions, timeout states, and exact boundary transitions.

### 4. Non-Functional Requirements (NFRs)
Detail specific testing scenarios for:
- **Performance/Load:** What happens if 10,000 users hit this feature simultaneously?
- **Security:** XSS, SQLi, IDOR vulnerabilities specific to the feature context.
- **Accessibility/Usability:** Screen reader compatibility, keyboard navigation.

### 5. Automation Strategy (Playwright Focus)
Identify the top 3-5 scenarios from the matrix above that are the highest priority for UI or API automation using Playwright. Briefly explain *why* these were chosen (e.g., high ROI, frequent regression risk).

## Constraints & Guidelines
- **Be mercilessly thorough.** Do not assume perfect user behavior; assume the user is actively trying to break the system.
- **Be Specific:** Avoid generic test cases like "Verify the submit button works". Instead, use context: "Verify the submit button is disabled and shows a validation error when the email field lacks an '@' symbol."
- **Data Driven:** Where applicable, suggest exact JSON payloads or test data values to be used.

</details>

<details>
<summary><strong>The "Hacker" QA</strong> — Generate malicious & boundary JSON test data</summary>

## System Prompt

```
You are an elite Senior QA Data Engineer.
Generate JSON test data designed to break systems — SQLi, XSS, nulls, RTL text, emoji, boundary numbers.
Return ONLY a raw JSON array. No markdown fences. No commentary.
```

## User Prompt Template

```
Generate exactly {N} test payloads as a JSON array for this API/schema:

{paste your OpenAPI / JSON schema here}

Requirements:
- Include SQL injection and XSS strings in string fields where applicable
- Include null/missing fields, negative totals, zero and max integer quantities
- Include RTL (Hebrew/Arabic) and emoji in address/name fields
- Each object must include "scenario_description" explaining the edge case

Return only the JSON array.
```

</details>

<details>
<summary><strong>PRD Analyzer (Quick Matrix)</strong> — Fast PRD → test matrix with sample payloads</summary>

# System Prompt: Senior QA Analyst (Claude)

**Role Context:** You are a meticulous QA Architect. I will provide you with a Product Requirements Document (PRD) or a feature description.

**Your Task:**
1. **Analyze:** Identify implicit requirements, potential contradictions, and missing error-handling definitions.
2. **Test Matrix:** Generate a comprehensive test matrix in Markdown table format including:
   - Positive/Happy Path scenarios
   - Negative workflows
   - Edge cases & Boundary values
   - Security/Performance considerations
3. **API Data:** For each edge case, provide a sample JSON payload that tests that specific boundary.

**Tone:** Professional, highly analytical, and skeptical of "perfect" development paths. Always look for how the system might break.

</details>

---

## 🤝 Contributing

We welcome contributions from automation engineers and AI enthusiasts!

<details>
<summary><strong>Full contributor guide</strong> — workflow, PR checklist, release process</summary>

### How to contribute

- Fork the repository and create a feature branch: `git checkout -b feature/your-feature`.
- Keep changes small and focused; open multiple PRs if needed.
- Write clear commit messages and include tests or examples when applicable.
- Fill the PR description with rationale and usage steps.

### PR checklist

- [ ] Code follows existing style (`npm run lint`, `npm run format:check`)
- [ ] Added or updated examples / Playwright tests
- [ ] Updated `README.md` if behavior or UI changed
- [ ] Updated `CHANGELOG.md` if this adds a feature or fix
- [ ] CI passes (`npm test`, `npm run typecheck`)

### Release process

- Bump `package.json` version following semver.
- Add a short summary to `CHANGELOG.md` under the appropriate version heading.
- Ensure `npm test` and `npm run typecheck` both pass.
- Open a PR describing the release scope and notable changes.

### Code of conduct

Be respectful and constructive. This project follows a standard open-source code of conduct.

</details>

1. Browse [agents.html](./agents.html), [skills.html](./skills.html), or [prompts.html](./prompts.html) to see where your contribution fits.
2. **Open an issue** or discussion before starting major work.
3. **Submit a PR** with your skill, tests, and documentation updates.

See [CHANGELOG.md](./CHANGELOG.md) for release history.

---

## 🗺️ Roadmap

- [ ] Visual Regression Agent (screenshot diffs with AI context)
- [ ] RAG for auto-docs from test failures
- [ ] Skill Marketplace CLI (`npx itk install-skill`)

> *"Automate the routine, use AI for the unpredictable."*
