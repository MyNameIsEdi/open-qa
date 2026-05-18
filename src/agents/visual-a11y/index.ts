import * as fs from 'fs';
import * as path from 'path';
import { askClaude, USE_MOCK, warnMockMode } from '../../core/llm-client';

export interface A11yScanInput {
  url: string;
  standard?: 'WCAG21AA' | 'WCAG21A';
}

export interface A11yViolation {
  wcagCriteria: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  description: string;
  fix: string;
}

export interface A11yReport {
  url: string;
  standard: string;
  timestamp: string;
  violations: A11yViolation[];
  passedChecks: string[];
  summary: string;
}

const SYSTEM_PROMPT = `You are a WCAG 2.1 AA accessibility expert and senior QA engineer.
Analyze the provided DOM snapshot for accessibility violations.
Return a JSON object with this exact shape (no markdown fences):
{
  "violations": [
    {
      "wcagCriteria": "1.1.1",
      "severity": "critical|serious|moderate|minor",
      "element": "CSS selector or element description",
      "description": "What is wrong",
      "fix": "Actionable code fix"
    }
  ],
  "passedChecks": ["list of WCAG criteria that passed"],
  "summary": "2-3 sentence executive summary"
}`;

export function createMockA11yReport(url: string, standard = 'WCAG21AA'): A11yReport {
  return {
    url,
    standard,
    timestamp: new Date().toISOString(),
    violations: [
      {
        wcagCriteria: '1.1.1',
        severity: 'critical',
        element: 'img.hero-image',
        description: 'Image is missing an alt attribute, making it inaccessible to screen readers.',
        fix: 'Add descriptive alt text: <img src="..." alt="Description of image content" />',
      },
      {
        wcagCriteria: '4.1.2',
        severity: 'serious',
        element: 'button.icon-btn',
        description: 'Icon button has no accessible name. Screen readers cannot describe its purpose.',
        fix: 'Add aria-label: <button aria-label="Close dialog" class="icon-btn">...</button>',
      },
      {
        wcagCriteria: '1.4.3',
        severity: 'moderate',
        element: '.text-gray-400',
        description: 'Text color #9CA3AF on white background has contrast ratio 2.85:1, below the 4.5:1 minimum.',
        fix: 'Use a darker gray: #6B7280 (contrast 4.63:1) or higher.',
      },
      {
        wcagCriteria: '2.4.7',
        severity: 'minor',
        element: 'a.nav-link',
        description: 'Focus indicator is not visible when navigating with keyboard.',
        fix: 'Add :focus-visible styles: outline: 2px solid #4F46E5; outline-offset: 2px;',
      },
    ],
    passedChecks: [
      '1.3.1 — Semantic HTML structure with proper heading hierarchy',
      '1.3.2 — Meaningful sequence preserved in DOM order',
      '2.1.1 — All interactive elements are keyboard accessible',
      '3.1.1 — Language of page declared in <html lang="en">',
      '4.1.1 — Valid HTML with no duplicate IDs',
    ],
    summary:
      'Found 4 accessibility violations: 1 critical (missing alt text), 1 serious (unlabeled button), 1 moderate (contrast failure), and 1 minor (focus visibility). The page structure and keyboard navigation are generally sound. Prioritize the critical and serious violations before release.',
  };
}

function formatReportAsMarkdown(report: A11yReport): string {
  const severityIcon: Record<string, string> = {
    critical: '🔴',
    serious: '🟠',
    moderate: '🟡',
    minor: '🔵',
  };

  let md = `# Accessibility Report (${report.standard})\n\n`;
  md += `**URL:** ${report.url}\n`;
  md += `**Generated:** ${report.timestamp}\n\n`;
  md += `## Summary\n\n${report.summary}\n\n`;

  if (report.violations.length === 0) {
    md += `✅ No violations found!\n\n`;
  } else {
    md += `## Violations (${report.violations.length})\n\n`;
    for (const v of report.violations) {
      md += `### ${severityIcon[v.severity]} WCAG ${v.wcagCriteria} — ${v.severity.toUpperCase()}\n\n`;
      md += `**Element:** \`${v.element}\`\n\n`;
      md += `**Issue:** ${v.description}\n\n`;
      md += `**Fix:** ${v.fix}\n\n`;
      md += `---\n\n`;
    }
  }

  md += `## Passed Checks\n\n`;
  for (const check of report.passedChecks) {
    md += `- ✅ ${check}\n`;
  }

  return md;
}

export async function runA11yScan(input: A11yScanInput): Promise<A11yReport> {
  warnMockMode('Visual A11y Scanner');
  const { url, standard = 'WCAG21AA' } = input;

  console.log(`♿  Running ${standard} scan on: ${url}`);

  if (USE_MOCK) {
    const report = createMockA11yReport(url, standard);
    console.log(`✨ [MOCK] Generated accessibility report`);

    const outputDir = path.join(process.cwd(), 'output');
    fs.mkdirSync(outputDir, { recursive: true });
    const reportPath = path.join(outputDir, 'A11Y_REPORT.md');
    fs.writeFileSync(reportPath, formatReportAsMarkdown(report));
    console.log(`📄 Report saved to: ${reportPath}`);

    return report;
  }

  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    const dom = await page.content();
    const strippedDom = dom
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12_000);

    const raw = await askClaude({
      system: SYSTEM_PROMPT,
      prompt: `Analyze this page for ${standard} violations.\nURL: ${url}\n\nDOM:\n${strippedDom}`,
      maxTokens: 2000,
      temperature: 0.1,
    });

    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned) as { violations: A11yViolation[]; passedChecks: string[]; summary: string };

    const report: A11yReport = {
      url,
      standard,
      timestamp: new Date().toISOString(),
      violations: parsed.violations,
      passedChecks: parsed.passedChecks,
      summary: parsed.summary,
    };

    const outputDir = path.join(process.cwd(), 'output');
    fs.mkdirSync(outputDir, { recursive: true });
    const reportPath = path.join(outputDir, 'A11Y_REPORT.md');
    fs.writeFileSync(reportPath, formatReportAsMarkdown(report));
    console.log(`✅ Scan complete. Report saved to: ${reportPath}`);

    return report;
  } finally {
    await browser.close();
  }
}

const isMain = process.argv[1]?.includes('visual-a11y');

if (isMain) {
  const url = process.env.TEST_URL ?? 'https://example.com';
  runA11yScan({ url }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
