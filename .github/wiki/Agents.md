# Agents

Autonomous entities that make LLM calls and take actions. Each agent is a single TypeScript file under `src/agents/`.

---

## 🟢 Self-Healing Locator

**Status:** Active | **File:** `src/agents/self-healing.ts`

When a Playwright test fails because the UI changed, this agent sends the failed locator and a stripped DOM snapshot to Claude and receives a suggested replacement using `getByRole`, `getByLabel`, or `getByTestId`.

### Run
```bash
npm run run:healing
# or directly:
npx tsx src/agents/self-healing.ts
```

### System Prompt
```
You are a senior Playwright automation engineer. Given a failed locator and a DOM snapshot,
suggest the single best alternative locator using getByRole, getByLabel, or getByTestId.
Return only the locator string, no explanation.
```

### Input Schema
```json
{
  "failed_locator": "string — the locator that failed",
  "dom_snapshot": "string — stripped DOM context around the target element"
}
```

---

## 🟢 Automated Bug Triage

**Status:** Active | **File:** `src/skills/log-analyzer.ts`

Reads `src/skills/fixtures/mock-error.log`, sends it to Claude, and writes a Jira-ready Markdown bug report to `output/AI_BUG_REPORT.md` with root-cause analysis, severity classification, and reproduction steps.

### Run
```bash
npm run run:bugreport
# or directly:
npx tsx src/skills/log-analyzer.ts
```

### System Prompt
```
You are an elite QA engineer. Read the error log and produce a structured bug report:
Title, Severity (P0–P3), Summary, Root Cause, Steps to Reproduce,
Expected vs Actual, Environment. Output clean Markdown.
```

### Output
`output/AI_BUG_REPORT.md`

---

## 🟡 Auto-POM Builder _(Planned)_

Crawls a URL, analyzes the page structure, and auto-generates a Playwright Page Object Model (POM) class with typed selectors and async action methods.

```bash
# Coming soon:
npx tsx scripts/auto-pom-builder.ts --url <url> --out ./pages
```

---

## 🟡 Network Interceptor & Mock Gen _(Planned)_

Analyzes a Playwright network trace and generates Playwright `route()` mock handlers for all captured API endpoints — no more manually writing intercepts.

```bash
# Coming soon:
npx tsx scripts/network-mock-gen.ts --trace <trace.zip>
```

---

## 🟡 Visual A11y Scanner _(Planned)_

Screenshots a page, analyzes it with Claude Vision, and produces a WCAG 2.1 AA accessibility report with specific code-level remediation steps.

```bash
# Coming soon:
npx tsx scripts/visual-a11y-scanner.ts --standard WCAG21AA
```

---

## 🟡 Chaos Monkey UI _(Planned)_

Randomly interacts with UI elements, captures unexpected console errors and network failures, and produces an anomaly report with reproduction paths and screenshots.

```bash
# Coming soon:
npx tsx scripts/chaos-monkey-ui.ts --duration 120
```

---

## Add to Claude

Every agent has an **"Add to Claude"** button in the UI marketplace that copies a complete tool payload to your clipboard. See [[MCP Integration]] for details.
