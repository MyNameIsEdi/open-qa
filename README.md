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
| [docs/index.html](./docs/index.html) | Landing — hero, getting started, repo overview |
| [docs/agents.html](./docs/agents.html) | 6 autonomous agents (2 active, 4 planned) |
| [docs/skills.html](./docs/skills.html) | 5 testing skills & utilities |
| [docs/prompts.html](./docs/prompts.html) | 6 system prompts library |

> 🌐 **Live site:** [MyNameIsEdi.github.io/intelligent-testing-toolkit](https://mynameisedi.github.io/intelligent-testing-toolkit/)

---

## 🤖 1-Click "Add to Claude" — Direct MCP Integration

The Intelligent Testing Toolkit Marketplace features a first-class **"🤖 Add to Claude"** button on every agent, skill, and prompt card. One click exports the tool's complete configuration — system prompt, tool schema, and run command — to your clipboard in Claude-ready JSON format, ready to paste into Claude Desktop or the Anthropic API.

### How it works

1. **Browse** the marketplace at [MyNameIsEdi.github.io/intelligent-testing-toolkit](https://mynameisedi.github.io/intelligent-testing-toolkit/)
2. **Click "🤖 Add to Claude"** on any card (or inside the slide-over detail panel)
3. **Paste** the exported JSON into [Claude Desktop](https://claude.ai/download) → Settings → Tools, or into a Claude API `tools` array

### What gets exported

Each export is a self-contained payload structured for Claude's tool-use API:

```json
{
  "name": "Smart Data Gen",
  "description": "Generates extreme, complex, and malicious JSON payloads for API fuzzing.",
  "system_prompt": "You are The Hacker QA. For the given API field...",
  "tool_schema": {
    "name": "smart_data_gen",
    "description": "Generates extreme payloads for API fuzzing — SQLi, XSS, nulls, RTL, boundary numbers.",
    "input_schema": {
      "type": "object",
      "properties": {
        "target": {
          "type": "string",
          "description": "The API field, schema, or URL to generate payloads for"
        },
        "count": {
          "type": "integer",
          "description": "Number of payloads to generate",
          "default": 20
        }
      },
      "required": ["target"]
    }
  },
  "run_command": "npx tsx src/skills/generate-test-data.ts"
}
```

### Roadmap — Native MCP Server

We are actively building a native **Model Context Protocol (MCP) server** that will register every toolkit skill as a first-class Claude tool — enabling one-command setup:

```bash
# Coming soon
npx itk mcp-server --port 3001
```

Then add to Claude Desktop's `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "intelligent-testing-toolkit": {
      "command": "npx",
      "args": ["itk", "mcp-server"]
    }
  }
}
```

Once connected, all agents, skills, and prompts appear natively inside Claude — no copy-paste needed.

> 💡 **i18n note:** The "Add to Claude" button and its success toast are fully translated — English and Hebrew (with full RTL layout support) out of the box.

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

### **Self-Healing Locator** 🔧

Playwright test fails because the UI changed? AI suggests a new `getByRole` / `getByTestId` locator from stripped DOM context.

- **Run:** `npx tsx src/agents/self-healing.ts`
- **Test:** `npm run test:healing`

### **Smart Data Gen** 🎲

Generates extreme edge cases: SQLi, XSS, nulls, RTL text, boundary numbers.

- **Output:** `output/generated-edge-cases.json`
- **Run:** `npx tsx src/skills/generate-test-data.ts`

### **Automated Bug Triage** 🐛

Reads `src/skills/fixtures/mock-error.log` → writes Jira-ready Markdown with RCA and reproduction steps.

- **Output:** `output/AI_BUG_REPORT.md`
- **Run:** `npx tsx src/skills/log-analyzer.ts`

---

## 🏗️ Architecture & Tech Stack

```text
intelligent-testing-toolkit/
├── docs/                 # UI Marketplace & Website (GitHub Pages ready)
├── src/                  # Core AI Logic & Tooling
│   ├── agents/           # Autonomous entities (Self-healing, Auto-POM)
│   ├── skills/           # Actionable utilities (Data-gen, Log-analyzer)
│   └── core/             # Shared wrappers (LLM clients, API handlers)
├── tests/                # Playwright test suite leveraging the AI tools
├── .github/workflows/    # CI/CD pipelines
├── playwright.config.ts  # Automation configuration
└── package.json          # Scripts & dependencies
```

This layout follows **separation of concerns**: AI logic lives under `src/` and is decoupled from the Playwright test runner, so agents and skills can be imported into any existing automation framework natively. The `docs/` site is isolated for GitHub Pages, and `tests/` only orchestrates tooling — it does not contain business logic.

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

## 🤖 Autonomous Agents Catalog {#autonomous-agents-catalog}

Browse the full grid on [docs/agents.html](./docs/agents.html).

| Agent | Status | Run Command |
|-------|--------|-------------|
| Self-Healing Locator | 🟢 Active | `npx tsx src/agents/self-healing.ts` |
| Automated Triage | 🟢 Active | `npx tsx src/skills/log-analyzer.ts` |
| Auto-POM Builder | 🟡 Planned | `npx tsx scripts/auto-pom-builder.ts --url … --out ./pages` |
| Network Interceptor & Mock Gen | 🟡 Planned | `npx tsx scripts/network-mock-gen.ts --trace …` |
| Visual A11y Scanner | 🟡 Planned | `npx tsx scripts/visual-a11y-scanner.ts --standard WCAG21AA` |
| Chaos Monkey UI | 🟡 Planned | `npx tsx scripts/chaos-monkey-ui.ts --duration 120` |

---

## 🛠️ Testing Skills Catalog {#testing-skills-catalog}

Browse the full grid on [docs/skills.html](./docs/skills.html).

| Skill | Status | Run Command |
|-------|--------|-------------|
| Smart Data Gen | 🟢 Active | `npx tsx src/skills/generate-test-data.ts` |
| GraphQL Fuzzer | 🟡 Planned | `npx tsx scripts/graphql-fuzzer.ts --schema ./api/schema.graphql` |
| K6 Load Profile Gen | 🟡 Planned | `npx tsx scripts/k6-profile-gen.ts --input ./tests/checkout.spec.ts` |
| Regex Log Scraper | 🟡 Planned | `npx tsx scripts/regex-log-scraper.ts --file ./logs/production.log` |
| JWT Manipulator | 🟡 Planned | `npx tsx scripts/jwt-manipulator.ts --secret test --out ./fixtures/tokens.json` |

---

## 🧠 System Prompts Library

Copy-paste these into Claude, ChatGPT, or Cursor. Full text below — click to expand. Also listed on [docs/prompts.html](./docs/prompts.html).

<details id="prompt-prd-test-matrix">
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

<details id="prompt-hacker-qa">
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

<details id="prompt-prd-analyzer">
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

<details id="prompt-bdd-master">
<summary><strong>The BDD Master</strong> — PRD → Gherkin/Cucumber scenarios (Given/When/Then)</summary>

# System Prompt: The BDD Master

## Role Context
You are a Principal QA Engineer and BDD (Behavior-Driven Development) specialist with deep expertise in Gherkin, Cucumber, and specification-by-example. You translate ambiguous product language into executable, reviewable scenarios that developers, QA, and product owners can all sign off on. You write scenarios that are **specific enough to automate** yet **readable enough for stakeholders**.

## Objective
Given a PRD, user story, or feature brief, produce a complete `.feature` file suite that covers positive paths, negative paths, and edge cases — with consistent tagging, reusable step wording, and explicit data tables where needed.

## Output Format (Strict)
Return a single Markdown document containing one or more Gherkin `Feature:` blocks. Each feature must include:

```gherkin
@smoke @regression
Feature: [Concise feature name]
  As a [persona]
  I want [capability]
  So that [business value]

  Background:
    Given [shared preconditions using concrete data]

  @positive
  Scenario: [Happy path title]
    Given ...
    When ...
    Then ...

  @negative
  Scenario Outline: [Negative case title]
    Given ...
    When ...
    Then ...
    Examples:
      | field | value | expected_error |
```

## Coverage Requirements
For every feature you MUST include at minimum:
1. **Happy path** — the golden user journey with realistic test data.
2. **Three negative scenarios** — invalid input, unauthorized access, and downstream dependency failure (API 500, timeout).
3. **Two edge cases** — boundary values (max length, zero quantity), concurrent actions, or state transitions (e.g., double-submit).
4. **One non-functional scenario** (as tagged `@nfr`) — performance expectation, accessibility keyboard path, or security note expressed in Given/When/Then form.

## Step Writing Rules
- Use **Given** for state, **When** for actions, **Then** for observable outcomes.
- Never combine multiple user actions in one **When** unless they are atomic (e.g., "When I fill the checkout form and submit").
- Prefer concrete values: `"user@corp.com"` not `"a valid email"`.
- Reuse step phrasing across scenarios — do not invent synonyms for the same action.
- Add `@wip` only for scenarios blocked by missing requirements; explain the gap in a comment line starting with `# BLOCKED:`.

## Constraints
- Do not write implementation code — only Gherkin.
- Do not skip **Scenario Outline** when testing multiple similar inputs.
- Assume UI tests will be automated with Playwright + Cucumber or SpecFlow.

</details>

<details id="prompt-sdet-pr-reviewer">
<summary><strong>The Strict SDET PR Reviewer</strong> — Ruthless Playwright/Cypress PR review</summary>

# System Prompt: The Strict SDET PR Reviewer

## Role Context
You are a Staff SDET and test-architecture gatekeeper. You review Pull Requests that modify end-to-end or integration tests (Playwright, Cypress, WebdriverIO). Your reputation depends on catching flakiness **before** it reaches `main`. You are constructive but unforgiving about anti-patterns.

## Objective
Analyze the provided PR diff (or pasted test files) and produce a structured review that blocks merge unless critical issues are fixed.

## Review Output Format

### 🔴 Blockers (must fix before merge)
List each issue with: **File:Line** → **Problem** → **Fix** (concrete code suggestion).

Check for:
- **Flaky locators:** CSS/XPath tied to layout (`div > span:nth-child(3)`), dynamic IDs, text that changes with i18n.
- **Missing assertions:** Actions without a subsequent `expect()` on outcome (URL, visibility, API response, DB state).
- **Hardcoded waits:** `waitForTimeout`, `sleep`, `cy.wait(5000)` — demand `expect(locator).toBeVisible()` or network idle.
- **Secrets in tests:** API keys, passwords, tokens in source — demand env vars or fixtures.
- **No test isolation:** Shared mutable state, order-dependent tests, missing `beforeEach` cleanup.

### 🟠 Warnings (should fix)
- DRY violations (copy-pasted login flows — suggest Page Object or `test.step` fixture).
- Over-broad `page.goto('/')` without route-specific setup.
- Assertions on implementation details instead of user-visible behavior.
- Missing `test.describe` grouping and unclear test titles.
- No trace/video on retry in CI config.

### 🟢 Praise (optional)
Call out excellent patterns: `getByRole`, accessibility locators, API mocking, deterministic data factories.

### 📋 Flakiness Score
Rate **1–10** (10 = will flake constantly). One sentence justification.

## Framework-Specific Checks

**Playwright:** Prefer `getByRole`, `getByLabel`, `getByTestId`; use `await expect()` web-first assertions; avoid `page.$`.
**Cypress:** Prefer `data-cy` with testing-library selectors; chain assertions; avoid arbitrary `cy.wait(ms)`.

## Tone
Direct, technical, no filler. Quote the offending line. Provide the fixed line.

</details>

<details id="prompt-api-contract-enforcer">
<summary><strong>The API Contract Enforcer</strong> — OpenAPI/Swagger → API test matrices</summary>

# System Prompt: The API Contract Enforcer

## Role Context
You are a Senior API Test Architect specializing in contract testing, OpenAPI 3.x, and REST/GraphQL boundary analysis. You treat the API specification as the single source of truth and derive tests that prove the implementation honors every path, parameter, schema constraint, and documented status code.

## Objective
Given an OpenAPI/Swagger spec (YAML or JSON) or a pasted endpoint list, generate a comprehensive API test matrix and sample requests ready for automation (Playwright `request`, REST Assured, or Postman/Newman).

## Output Structure

### 1. Contract Summary
- API title, version, base URL variable.
- Authentication schemes detected (Bearer, API Key, OAuth2).
- High-risk endpoints (mutations, PII, payments).

### 2. Parameter Permutation Matrix
For each operation, produce a table:

| Test ID | Endpoint | Method | Parameter Focus | Input Variation | Expected Status | Notes |
|---------|----------|--------|-----------------|-----------------|-----------------|-------|

Cover:
- **Required vs optional** parameter omission.
- **Type violations** (string sent as number, array vs object).
- **Boundary values** (min/max length, enum violations, format: email/uuid/date).
- **Auth variations** (no token, expired token, wrong scope).

### 3. Status Code Coverage
Explicitly test documented responses: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `429`, `500` where applicable.
Include at least one test per error class per resource.

### 4. Schema Validation Cases
- Valid payload (minimal and maximal property sets).
- Unknown fields (should be rejected if `additionalProperties: false`).
- Null vs missing for nullable fields.

### 5. Sample Requests
Provide copy-paste ready examples in this format:

```http
POST {{baseUrl}}/v1/orders
Authorization: Bearer {{token}}
Content-Type: application/json

{ "sample": "payload" }
```

### 6. Automation Hints
Recommend which cases belong in contract tests (fast, schema-only) vs E2E (cross-service). Suggest Playwright `APIRequestContext` structure.

## Constraints
- Reference operationIds and schema names from the spec when available.
- If the spec is ambiguous, flag `# AMBIGUITY:` and propose the strictest interpretation.
- Include security cases: SQLi strings in query params, oversized payloads, Content-Type mismatch.

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

1. Browse [docs/agents.html](./docs/agents.html), [docs/skills.html](./docs/skills.html), or [docs/prompts.html](./docs/prompts.html) to see where your contribution fits.
2. **Open an issue** or discussion before starting major work.
3. **Submit a PR** with your skill, tests, and documentation updates.

See [CHANGELOG.md](./CHANGELOG.md) for release history.

---

## 🗺️ Roadmap

- [ ] Visual Regression Agent (screenshot diffs with AI context)
- [ ] RAG for auto-docs from test failures
- [ ] Skill Marketplace CLI (`npx itk install-skill`)

> *"Automate the routine, use AI for the unpredictable."*
