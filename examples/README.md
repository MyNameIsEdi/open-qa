# Real-World Examples

This folder contains practical, runnable examples showing how to combine skills in real test scenarios.

## Available Examples

### 1. E-Commerce Checkout Test Suite
**File:** `ecommerce-checkout.ts`

**Scenario:** Test an e-commerce checkout flow with AI-powered:
- Self-healing selectors for form fields
- Edge-case test data generation (extreme prices, special chars)
- Automated bug triage if a step fails

**Skills used:**
- Self-Healing Locator (recover from UI changes)
- Smart Data Gen (test edge cases)
- Bug Triage (auto-report failures)

**Run it:**
```bash
npx tsx examples/ecommerce-checkout.ts
```

**What it does:**
1. Navigate to mock checkout page
2. Test form filling with extreme values
3. Detect selector changes automatically
4. Generate bug report if test fails

---

### 2. Design System Visual Testing
**File:** `design-system-visual.ts`

**Scenario:** Validate a design system stays consistent across releases.

**Skills used:**
- Visual Regression (detect pixel changes)
- Smart Data Gen (test with various data)

**Run it:**
```bash
npx tsx examples/design-system-visual.ts
```

**What it does:**
1. Capture component baselines
2. Render with different data sizes
3. Detect layout/color/spacing changes
4. Report which components regressed

---

### 3. API Integration Test Pipeline
**File:** `api-integration-test.ts`

**Scenario:** Test a REST API with fuzzing + smart assertions.

**Skills used:**
- Smart Data Gen (generate fuzzing payloads)
- Bug Triage (classify API errors)

**Run it:**
```bash
npx tsx examples/api-integration-test.ts
```

**What it does:**
1. Generate edge-case payloads
2. Send requests with fuzzing data
3. Capture failures
4. Auto-categorize API errors

---

## How to Use These Examples

### Option 1: Run as-is (MOCK mode)
```bash
npx tsx examples/ecommerce-checkout.ts
```
All examples work without an API key using mock data.

### Option 2: Run with real Claude
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npx tsx examples/ecommerce-checkout.ts
```

### Option 3: Modify for your use case
Each file is heavily commented. Copy the pattern and adapt:
```typescript
// 1. Import the skills you need
import { healLocator } from '../01-Self-Healing-Tests/self-healing';
import { createMockEdgeCaseData } from '../02-Smart-Data-Gen/generate-test-data';

// 2. Combine them in your test flow
const testData = createMockEdgeCaseData(5);
const recoveredSelector = await healLocator(html, 'submit button');

// 3. Run your assertions/actions
// ...
```

## Pattern: Test Flow

All examples follow this pattern:

```typescript
// Step 1: Setup
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Step 2: Prepare data (using Smart Data Gen)
const testData = createMockEdgeCaseData(3);

// Step 3: Execute test steps
for (const data of testData) {
  try {
    // Try action with original selector
    await page.click('.submit-btn');
  } catch {
    // If selector broke, use Self-Healing
    const recoveredSelector = await healLocator(html, 'submit button');
    await page.click(recoveredSelector);
  }
}

// Step 4: Report results (using Bug Triage)
if (testFailed) {
  const report = await analyzeLogAndCreateBugReport(errorLog);
  // ...
}

// Cleanup
await browser.close();
```

## Testing Best Practices (from examples)

1. **Always have fallbacks** — Self-healing for UI changes
2. **Test edge cases** — Use Smart Data Gen for boundary conditions
3. **Capture failures** — Auto-triage and report for CI
4. **Log progress** — Clear console output
5. **Clean up** — Close browsers, delete temp files

## Common Pitfalls to Avoid

❌ **Don't** hardcode selectors without recovery logic
✅ **Do** use self-healing + explicit locator strategies

❌ **Don't** test only happy paths
✅ **Do** generate edge cases and unusual data

❌ **Don't** ignore failures silently
✅ **Do** auto-triage and create tickets

❌ **Don't** leave test artifacts
✅ **Do** save reports and clean up temp files

## Extending Examples

To create your own example:

1. Copy an existing example as a template
2. Import the skills you need
3. Implement your test flow
4. Add detailed comments
5. Test locally (`npx tsx examples/your-example.ts`)
6. Submit a PR with your example

Examples are great for:
- Teaching how to use the toolkit
- Demonstrating skill combinations
- Providing copy-paste starting points
- Showcasing real-world scenarios

---

**Need help?** See [README.md](../README.md) or [CONTRIBUTING.md](../CONTRIBUTING.md).
