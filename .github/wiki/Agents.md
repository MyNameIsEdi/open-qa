# Agents

Autonomous entities that make LLM calls and take actions. Each agent lives in its own subfolder under `src/agents/<name>/index.ts`.

---

## 🟢 Self-Healing Locator

**Status:** Active | **File:** `src/agents/self-healing/index.ts`

When a Playwright test fails because the UI changed, this agent sends the failed locator and a stripped DOM snapshot to Claude and receives a suggested replacement using `getByRole`, `getByLabel`, or `getByTestId`.

### Run
```bash
npm run run:healing
# or directly:
npx tsx src/agents/self-healing/index.ts
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

### Key API
```typescript
import { clickWithSelfHealing, suggestLocator, buildLocator } from './src/agents/self-healing/index'

// Auto-heal a click when selector breaks
await clickWithSelfHealing(page, '#old-btn', 'Button to confirm checkout')

// Just get a suggestion
const spec = await suggestLocator(page, 'Submit button')
// { strategy: 'getByRole', target: 'button', options: { name: 'Submit' } }
```

---

## 🟢 Automated Bug Triage

**Status:** Active | **File:** `src/skills/log-analyzer/index.ts`

Reads `src/skills/fixtures/mock-error.log`, sends it to Claude, and writes a Jira-ready Markdown bug report to `output/AI_BUG_REPORT.md` with root-cause analysis, severity classification, and reproduction steps.

### Run
```bash
npm run run:bugreport
# or directly:
npx tsx src/skills/log-analyzer/index.ts
```

### System Prompt
```
You are an elite QA Automation Architect. Analyze failed Playwright test logs and produce
professional Jira-ready Markdown bug reports.
```

### Output
`output/AI_BUG_REPORT.md`

---

## 🟢 Auto-POM Builder

**Status:** Active | **File:** `src/agents/auto-pom/index.ts`

Takes a DOM HTML snapshot and a page name, then generates a complete TypeScript Playwright Page Object Model class with `getByRole`-first locators, typed properties, and async action methods.

### Run
```bash
npm run run:auto-pom
# or directly:
npx tsx src/agents/auto-pom/index.ts
```

### System Prompt
```
You are a senior Playwright architect. Given a DOM snapshot, generate a complete TypeScript
POM class with getByRole locators and async action methods. Prefer accessibility-first locators.
```

### Key API
```typescript
import { buildPageObject } from './src/agents/auto-pom/index'

const pom = await buildPageObject({
  domHtml: '<html>...</html>',
  pageName: 'LoginPage',
  outputPath: './pages'
})
// Writes output/auto-pom/LoginPage.ts
```

### Output
`output/auto-pom/<PageName>.ts`

---

## 🟢 Visual Regression Agent

**Status:** Active | **File:** `src/agents/visual-regression/index.ts`

Compares baseline screenshots against current screenshots, quantifies pixel differences, assigns severity (low/medium/high), and produces a Markdown regression report.

### Run
```bash
npm run run:visual-regression
# or directly:
npx tsx src/agents/visual-regression/index.ts
```

### Key API
```typescript
import { compareScreenshots, createVisualRegressionReport } from './src/agents/visual-regression/index'

const report = await compareScreenshots('./baseline.png', './current.png', { threshold: 0.05 })
// { pixelDiffPercentage: 3.5, severity: 'low', description: '...', recommendation: '...' }
```

### Output
`output/visual-regression/VISUAL_REGRESSION_REPORT.md`

---

## 🟢 Visual A11y Scanner

**Status:** Active | **File:** `src/agents/visual-a11y/index.ts`

Analyzes a page's DOM for WCAG 2.1 AA violations and produces a prioritized report with element-level descriptions and code-fix recommendations. Supports both MOCK mode (heuristic violations) and live Claude analysis.

### Run
```bash
npm run run:visual-a11y
TEST_URL=https://yourapp.com npm run run:visual-a11y
# or directly:
npx tsx src/agents/visual-a11y/index.ts
```

### System Prompt
```
You are a WCAG 2.1 AA accessibility expert. Analyze the DOM for violations.
Return JSON with violations (wcagCriteria, severity, element, description, fix)
and passedChecks array.
```

### Key API
```typescript
import { runA11yScan } from './src/agents/visual-a11y/index'

const report = await runA11yScan({ url: 'https://example.com', standard: 'WCAG21AA' })
// { violations: [...], passedChecks: [...], summary: '...' }
```

### Output
`output/A11Y_REPORT.md`

---

## 🟡 Network Interceptor & Mock Gen _(Planned)_

Analyzes a Playwright network trace and generates Playwright `route()` mock handlers for all captured API endpoints.

```bash
# Coming soon:
npx tsx src/agents/network-mock/index.ts --trace <trace.zip>
```

---

## 🟡 Chaos Monkey UI _(Planned)_

Randomly interacts with UI elements, captures unexpected console errors and network failures, and produces an anomaly report with reproduction paths.

```bash
# Coming soon:
npx tsx src/agents/chaos-monkey/index.ts --duration 120
```

---

## Add to Claude

Every agent has an **"Add to Claude"** button in the UI marketplace that copies a complete MCP tool payload to your clipboard. See [[MCP Integration]] for details.
