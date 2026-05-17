# 05 — Visual Regression Agent 📸

Detect UI visual changes automatically. Capture baseline screenshots, compare against new versions, and get AI-powered insights on what changed and whether it's intentional.

## Why This Matters

UI regression testing is tedious when done manually. Testers compare pixels, look for misalignment, color changes, and text shifts. This agent:

1. **Captures baseline screenshots** of key pages
2. **Compares new screenshots** against baselines with pixel-level accuracy
3. **Reports visual changes** with Playwright's built-in diff engine
4. **Analyzes differences** using Claude to determine if changes are intentional or bugs

## Quick Start

```bash
# Run the demo (captures + compares screenshots)
npx tsx visual-regression.ts

# Run with real LLM analysis (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY="sk-ant-..."
npx tsx visual-regression.ts
```

## How It Works

### Step 1: Capture Baseline
```typescript
const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: 'baselines/homepage.png', fullPage: true });
```

### Step 2: Compare Screenshots
```typescript
const diff = await page.screenshot({ path: 'current/homepage.png' });
// Playwright calculates pixel diffs automatically
```

### Step 3: Analyze with Claude (Optional)
```typescript
const analysis = await analyzeVisualRegression(baselineImage, newImage);
// Returns: { changed: boolean, severity: 'low'|'medium'|'high', description: string }
```

## Features

✅ **Pixel-perfect comparison** — Detects sub-pixel changes  
✅ **Multiple viewport sizes** — Test responsive design  
✅ **Baseline versioning** — Track expected changes over time  
✅ **AI-powered context** — Claude explains what changed and why it matters  
✅ **Mock mode** — Works without API key (uses heuristics)  
✅ **CI-friendly** — Runs headless, outputs JSON reports  

## Configuration

### Threshold Sensitivity

```javascript
const PIXEL_DIFF_THRESHOLD = 0.05; // 5% pixel difference before flagging
const COLOR_VARIANCE = 10;          // RGB variance tolerance
```

### Viewport Sizes (Responsive Testing)

```javascript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 }
];
```

## Output

When you run the demo, it generates:

```
baselines/
├── homepage-mobile.png
├── homepage-tablet.png
└── homepage-desktop.png

VISUAL_REGRESSION_REPORT.md
```

Example report:
```markdown
# Visual Regression Report

## Summary
- Baseline: 3 screenshots captured
- Changes Detected: 2
- High Severity: 1

## Detailed Results

### ❌ Homepage (Desktop)
- **Severity:** High
- **Change:** Button color changed from blue (#0066CC) to red (#FF0000)
- **Impact:** Call-to-action visibility potentially reduced
- **Recommendation:** Verify with design team

### ✅ Homepage (Mobile)
- **Severity:** Low
- **Change:** Minor spacing adjustment (2px)
- **Impact:** No functional change detected
```

## Real-World Use Cases

### 1. **Regression Testing in CI/CD**
```bash
# Baseline captured once per release
npm run capture:baselines

# Every PR: compare against baseline
npm run visual:test
```

### 2. **Design System Changes**
Detect when component updates affect multiple pages.

### 3. **Cross-browser Testing**
Screenshot on Chrome, Firefox, Safari to spot rendering differences.

### 4. **Performance Metrics**
Track layout shift scores and pixel changes over time.

## Advanced Usage

### Custom Threshold
```typescript
const result = await compareScreenshots(baseline, current, {
  threshold: 0.10,  // 10% difference allowed
  ignoreElements: ['.dynamic-banner', '.timestamp']
});
```

### Exclude Dynamic Content
```typescript
await page.locator('.timestamp').hide();
await page.locator('.ads').hide();
// Now screenshot won't include ads or timestamps
```

### Multi-Page Regression
```typescript
const pages = ['/', '/checkout', '/account', '/settings'];
for (const page of pages) {
  await captureBaseline(page);
}
```

## Limitations & Notes

- **Dynamic content:** Ads, timestamps, animations can cause false positives
- **Color rendering:** Different monitors may show color variance
- **Font rendering:** System fonts may differ across CI environments
- **Network issues:** Slow-loading images can cause timeout

## Tips

1. **Exclude dynamic elements** before capturing baselines
2. **Use multiple viewports** to catch responsive issues
3. **Run in CI after each release** to track changes
4. **Review high-severity changes** manually before auto-approving
5. **Version baselines** alongside code releases

## Contributing

Found a visual bug? See [CONTRIBUTING.md](../CONTRIBUTING.md) to add your own regression test case!

---

**Next:** Check out [CONTRIBUTING.md](../CONTRIBUTING.md) to extend this skill or add your own.
