# Integration Testing Guide

Learn how to combine multiple skills in realistic test workflows.

## What is Integration Testing?

Integration testing verifies that different skills work together seamlessly:

```
Skill 1: Generate Test Data
    ↓
Skill 2: Run Tests with Self-Healing
    ↓
Skill 3: Auto-Triage Failures
    ↓
Report with Insights
```

## Pattern 1: Data-Driven Testing with Recovery

**Problem:** You need to test an API endpoint with many edge cases, but requests might fail if the endpoint signature changes.

**Solution:** Combine Smart Data Gen + Self-Healing + Bug Triage.

```typescript
import { createMockEdgeCaseData } from '../02-Smart-Data-Gen/generate-test-data';
import { healLocator } from '../01-Self-Healing-Tests/self-healing';
import { createMockBugReport } from '../03-Automated-Bug-Report/log-analyzer';

// 1. Generate edge case payloads
const payloads = createMockEdgeCaseData(5);

// 2. For each payload:
for (const payload of payloads) {
  try {
    // Try normal request
    const response = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // If endpoint signature changed, use self-healing to suggest new endpoint
    const suggestion = await healLocator(apiDocs, 'checkout endpoint');
    console.log(`API changed. Try: ${suggestion}`);

    // Auto-triage the failure
    const report = createMockBugReport(`${error}`);
  }
}
```

**Output:** Report with all tested payloads + auto-fixes for broken calls.

---

## Pattern 2: Visual + Functional Testing

**Problem:** UI changes might be intentional (design update) or bugs (regression). You need both pixel comparison and functional tests.

**Solution:** Visual Regression Agent + Self-Healing Locator.

```typescript
import { compareScreenshots } from '../05-Visual-Regression/visual-regression';
import { healLocator } from '../01-Self-Healing-Tests/self-healing';

// 1. Compare visual changes
const diff = await compareScreenshots('baseline.png', 'current.png');

if (diff.pixelDiffPercentage > 5) {
  console.log('Visual change detected:', diff.description);

  // 2. If major change, test with updated selectors
  const newSelector = await healLocator(newHTML, 'button');

  // 3. Run smoke test with recovered selectors
  await page.click(newSelector);
  console.log('✅ Functionality still works!');
}
```

**Output:** Report showing which visual changes are safe vs. concerning.

---

## Pattern 3: Continuous Regression Testing

**Problem:** Every CI build needs quick validation that nothing broke.

**Solution:** Run all skills in CI with caching and parallelization.

```bash
#!/bin/bash
# ci-test.sh

# 1. Generate test data once
npm run generate-test-data

# 2. Run tests in parallel
npm run test:self-healing &
npm run test:visual-regression &
npm run test:api &
wait

# 3. Auto-triage failures
npm run triage-failures

# 4. Report summary
npm run generate-report
```

**Output:** Single dashboard showing all skill results + trends over time.

---

## Pattern 4: Smart Data Generation → Fuzzing → Bug Triage

**Problem:** Manual API testing is slow and error-prone. You need systematic fuzzing with intelligent reporting.

**Solution:** All three data-centric skills working together.

```typescript
import { createMockEdgeCaseData } from '../02-Smart-Data-Gen/generate-test-data';
import { createMockBugReport } from '../03-Automated-Bug-Report/log-analyzer';
import { compareScreenshots } from '../05-Visual-Regression/visual-regression';

async function fuzzAndReport() {
  // 1. Generate extreme payloads
  const payloads = createMockEdgeCaseData(10);

  // 2. Send each to API
  const failures = [];
  for (const payload of payloads) {
    const response = await sendPayload(payload);
    if (!response.ok) failures.push(response);
  }

  // 3. Auto-categorize by error type
  for (const failure of failures) {
    const bugReport = createMockBugReport(failure.errorLog);
    saveReport(bugReport);
  }

  // 4. Check for visual regressions in error page
  const errorPageDiff = await compareScreenshots('baseline-error.png', 'current-error.png');

  console.log(`Found ${failures.length} issues`);
  console.log(`Error page changed: ${errorPageDiff.pixelDiffPercentage}%`);
}
```

**Output:** Structured bug reports, severity classification, error page regression tracking.

---

## Pattern 5: End-to-End Workflow

**Problem:** Full e-commerce user journey needs testing with edge cases, self-healing, visual checks, and auto-reporting.

**Solution:** All five skills in one workflow.

```typescript
// See examples/ecommerce-checkout.ts for full implementation

async function testCheckoutWorkflow() {
  // 1. Self-healing: Adapt to UI changes
  const firstNameInput = await healLocator(html, 'First Name input');

  // 2. Data gen: Fill with edge cases
  const testData = createMockEdgeCaseData(3);
  for (const data of testData) {
    await fillForm(firstNameInput, data.first_name);
  }

  // 3. Visual regression: Check UI consistency
  const diff = await compareScreenshots('baseline.png', 'current.png');
  if (diff.severity === 'high') console.warn('UI regression!');

  // 4. Execute and capture failures
  const results = await runTests(testData);

  // 5. Bug triage: Auto-report failures
  for (const failure of results.filter((r) => r.failed)) {
    const report = createMockBugReport(failure.errorLog);
    saveReport(report);
  }
}
```

---

## Skill Combination Matrix

| Combination                      | Use Case                   | Output                               |
| -------------------------------- | -------------------------- | ------------------------------------ |
| Data Gen + Bug Triage            | API fuzzing                | Failure classification report        |
| Data Gen + Self-Healing          | UI testing with edge cases | Test results with adapted selectors  |
| Visual Regression + Self-Healing | Design system updates      | Pixel diffs + functional smoke tests |
| All 5 Skills                     | Full E2E workflow          | Comprehensive test report            |

---

## Best Practices

### 1. Parallelize Independent Skills

```typescript
// ✅ Do this (parallel)
const [dataResults, visualResults] = await Promise.all([
  generateTestData(),
  compareScreenshots(baseline, current),
]);

// ❌ Don't do this (sequential)
const dataResults = await generateTestData();
const visualResults = await compareScreenshots(baseline, current);
```

### 2. Cache Generated Data

```typescript
// Generate once, use many times
const testData = createMockEdgeCaseData(100);

for (const payload of testData) {
  // Run multiple tests with same data
  await testAPI(payload);
  await testUI(payload);
  await testValidation(payload);
}
```

### 3. Aggregate Reports

```typescript
// Combine reports from all skills
const allReports = await Promise.all([
  generateSelfHealingReport(),
  generateDataGenReport(),
  generateRegressionReport(),
  generateBugTriageReport(),
]);

saveAggregatedReport(allReports);
```

### 4. Use Consistent Logging

```typescript
// All skills follow same logging pattern
console.log('🚀 Starting skill...');
console.log('  ├─ Step 1: ...');
console.log('  ├─ Step 2: ...');
console.log(`✅ Complete: ${results.length} items processed`);
```

---

## Real-World Example Scripts

### Daily Regression Suite

```bash
npx tsx examples/ecommerce-checkout.ts        # Full workflow
npx tsx examples/api-integration-test.ts      # API fuzzing
npm run verify:demos                          # All skills
```

### Pre-Deployment Checks

```bash
npm run typecheck                             # Type safety
npm test                                      # Unit tests
npm run verify:demos                          # Integration tests
```

### CI Pipeline

```bash
npm test && npm run verify:demos && npm run generate-report
```

---

## Troubleshooting

### "Skill output doesn't match expected format"

Check the skill's README for output structure. Each skill has a standard format.

### "Random failures in mock mode"

Mock mode uses deterministic but varied outputs. Failures may legitimately happen (e.g., negative amounts in payment tests). This is expected.

### "Skills run too slowly"

- Use `npm run verify:demos` with `HEADLESS=true` environment variable
- Parallelize independent skills with `Promise.all()`
- Reduce test payload count for faster runs

### "Can't combine skills?"

Make sure you're importing from the correct paths:

```typescript
import { healLocator } from '../01-Self-Healing-Tests/self-healing';
import { createMockEdgeCaseData } from '../02-Smart-Data-Gen/generate-test-data';
// etc.
```

---

## Next Steps

1. **Run an example:** `npx tsx examples/ecommerce-checkout.ts`
2. **Copy the pattern:** Adapt the example to your use case
3. **Add custom skills:** Use SKILL_TEMPLATE to extend
4. **Share learnings:** Submit PR with your integration patterns

---

**Questions?** See [CONTRIBUTING.md](../CONTRIBUTING.md) or check example implementations.
