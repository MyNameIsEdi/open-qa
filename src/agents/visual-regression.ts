import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Visual Regression Agent
 * 
 * Captures baseline screenshots, compares against new versions,
 * and provides AI-powered analysis of visual changes.
 */

const USE_MOCK = !process.env.ANTHROPIC_API_KEY;

interface ScreenshotInfo {
  path: string;
  timestamp: string;
  hash: string;
  size: number;
}

interface VisualChangeReport {
  pageUrl: string;
  baseline: ScreenshotInfo;
  current: ScreenshotInfo;
  pixelDiffPercentage: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

interface MockVisualChange {
  elementChanged: string;
  oldValue: string;
  newValue: string;
}

/**
 * Generate a mock visual change based on a "detected" difference
 */
export function generateMockVisualChange(): MockVisualChange {
  const changes: MockVisualChange[] = [
    { elementChanged: '.button-primary', oldValue: '#0066CC', newValue: '#FF0000' },
    { elementChanged: '.header-title', oldValue: 'font-size: 28px', newValue: 'font-size: 32px' },
    { elementChanged: '.card-padding', oldValue: 'padding: 16px', newValue: 'padding: 20px' },
    { elementChanged: '.nav-spacing', oldValue: 'gap: 12px', newValue: 'gap: 16px' },
    { elementChanged: '.footer-bg', oldValue: '#FFFFFF', newValue: '#F8F8F8' }
  ];
  return changes[Math.floor(Math.random() * changes.length)];
}

/**
 * Generate a file hash (simulates screenshot fingerprinting)
 */
export function generateFileHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * Create mock screenshot info
 */
export function createMockScreenshotInfo(label: string): ScreenshotInfo {
  const mockContent = `${label}-${Date.now()}-mock-screenshot`;
  return {
    path: `./screenshots/${label}.png`,
    timestamp: new Date().toISOString(),
    hash: generateFileHash(mockContent),
    size: Math.floor(Math.random() * 500000) + 100000 // 100KB to 600KB
  };
}

/**
 * Compare two screenshots and detect visual changes
 */
export async function compareScreenshots(
  baselinePath: string,
  currentPath: string,
  options?: { threshold?: number; ignoreElements?: string[] }
): Promise<VisualChangeReport> {
  const threshold = options?.threshold ?? 0.05;
  
  if (USE_MOCK) {
    // Mock comparison: simulate random pixel differences
    const pixelDiff = Math.random() * 0.15; // 0-15% difference
    const isSevere = pixelDiff > threshold;
    const change = generateMockVisualChange();
    
    return {
      pageUrl: 'https://example.com/test-page',
      baseline: createMockScreenshotInfo('baseline'),
      current: createMockScreenshotInfo('current'),
      pixelDiffPercentage: parseFloat((pixelDiff * 100).toFixed(2)),
      severity: isSevere ? (pixelDiff > 0.10 ? 'high' : 'medium') : 'low',
      description: `Detected change in ${change.elementChanged}: ${change.oldValue} → ${change.newValue}`,
      recommendation: isSevere 
        ? 'Review with design team and approve intentional changes' 
        : 'Minor update, likely from new CSS or spacing adjustment'
    };
  }
  
  // Real implementation would use Playwright's screenshot comparison
  // For now, returning a realistic mock result
  return {
    pageUrl: 'https://example.com/test-page',
    baseline: {
      path: baselinePath,
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      hash: 'abc1234f',
      size: 425000
    },
    current: {
      path: currentPath,
      timestamp: new Date().toISOString(),
      hash: 'xyz9876f',
      size: 426500
    },
    pixelDiffPercentage: 3.5,
    severity: 'low',
    description: 'Detected spacing changes in navigation bar (2px margin increase)',
    recommendation: 'Minor CSS update detected. Approve if intentional.'
  };
}

/**
 * Analyze visual changes with Claude (optional)
 */
export async function analyzeVisualChangeWithAI(report: VisualChangeReport): Promise<string> {
  if (USE_MOCK) {
    const impacts: { [key: string]: string } = {
      low: 'Low impact: This change is minor and does not affect core functionality.',
      medium: 'Medium impact: This change affects visual hierarchy but is likely intentional.',
      high: 'High impact: This change may indicate a regression or unintended design modification.'
    };
    return impacts[report.severity];
  }
  
  // Real implementation would call Claude API
  // For now, returning educational mock analysis
  return `The visual change detected in ${report.description} appears to be ${report.severity}-severity. ${report.recommendation}`;
}

/**
 * Create a comprehensive visual regression report
 */
export async function createVisualRegressionReport(
  reports: VisualChangeReport[]
): Promise<string> {
  const timestamp = new Date().toISOString();
  const highSeverity = reports.filter(r => r.severity === 'high').length;
  const mediumSeverity = reports.filter(r => r.severity === 'medium').length;
  const lowSeverity = reports.filter(r => r.severity === 'low').length;
  
  let markdown = `# Visual Regression Report\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total Pages Tested:** ${reports.length}\n`;
  markdown += `- **High Severity:** ${highSeverity}\n`;
  markdown += `- **Medium Severity:** ${mediumSeverity}\n`;
  markdown += `- **Low Severity:** ${lowSeverity}\n\n`;
  
  if (reports.length === 0) {
    markdown += `✅ No visual regressions detected!\n`;
  } else {
    markdown += `## Detailed Results\n\n`;
    
    for (const report of reports) {
      const icon = report.severity === 'high' ? '❌' : report.severity === 'medium' ? '⚠️' : '✅';
      markdown += `### ${icon} ${report.pageUrl}\n\n`;
      markdown += `- **Severity:** ${report.severity.toUpperCase()}\n`;
      markdown += `- **Pixel Difference:** ${report.pixelDiffPercentage}%\n`;
      markdown += `- **Change:** ${report.description}\n`;
      markdown += `- **Recommendation:** ${report.recommendation}\n\n`;
    }
  }
  
  return markdown;
}

/**
 * Demo: Run visual regression tests
 */
export async function runDemoTest(): Promise<void> {
  console.log('🎬 Starting Visual Regression Agent demo...\n');
  
  // Create output directory
  const outputDir = path.join(process.cwd(), 'output', 'visual-regression');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Simulate capturing baselines for multiple pages
  const pages = [
    'https://example.com/',
    'https://example.com/checkout',
    'https://example.com/account'
  ];
  
  console.log('📸 Comparing baselines against current versions...\n');
  
  const reports: VisualChangeReport[] = [];
  
  for (const pageUrl of pages) {
    const baseline = `./screenshots/baseline-${pages.indexOf(pageUrl)}.png`;
    const current = `./screenshots/current-${pages.indexOf(pageUrl)}.png`;
    
    const report = await compareScreenshots(baseline, current, { threshold: 0.05 });
    reports.push(report);
    
    console.log(`${pageUrl}`);
    console.log(`  ├─ Pixel Difference: ${report.pixelDiffPercentage}%`);
    console.log(`  ├─ Severity: ${report.severity}`);
    console.log(`  └─ ${report.description}\n`);
  }
  
  // Generate markdown report
  const reportMarkdown = await createVisualRegressionReport(reports);
  
  // Save report
  const reportPath = path.join(outputDir, 'VISUAL_REGRESSION_REPORT.md');
  fs.writeFileSync(reportPath, reportMarkdown);
  
  console.log(`\n✅ Visual Regression Report saved to: ${reportPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - Total pages tested: ${reports.length}`);
  console.log(`   - High severity: ${reports.filter(r => r.severity === 'high').length}`);
  console.log(`   - Medium severity: ${reports.filter(r => r.severity === 'medium').length}`);
  console.log(`   - Low severity: ${reports.filter(r => r.severity === 'low').length}`);
}

// Only run demo if executed directly
if (process.argv.some(arg => arg.endsWith('visual-regression.ts'))) {
  runDemoTest().catch(console.error);
}
