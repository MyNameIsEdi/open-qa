import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { askClaude, USE_MOCK, warnMockMode } from '../../core/llm-client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOG_FILE = path.join(__dirname, '../fixtures', 'mock-error.log');
const OUTPUT_DIR = path.join(process.cwd(), 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'AI_BUG_REPORT.md');

const SYSTEM_PROMPT = `You are an elite QA Automation Architect.
Analyze failed Playwright test logs and produce professional Jira-ready Markdown bug reports.`;

function buildAnalysisPrompt(errorLog: string): string {
  return `Analyze this automated test failure log:

"""
${errorLog}
"""

Generate a Jira Markdown bug report with these sections:
## Bug: [concise title]
**Severity:** [High/Medium/Low]
**Component:** [inferred area]

### Description
[2-3 sentences]

### Root Cause Analysis
[Technical analysis from stack trace and network context]

### Steps to Reproduce
1. ...
2. ...

### Suggested Fix
[Actionable guidance for developers]

Return ONLY the Markdown. No preamble.`;
}

export function createMockBugReport(errorLog: string): string {
  const titleMatch = errorLog.match(/Error:\s*([^\n]+)/i);
  const title = titleMatch?.[1]?.trim() ?? 'Automated test failure on checkout payment';

  return `## Bug: ${title}

**Severity:** High
**Component:** Checkout / Payments

### Description
The automated checkout test failed while clicking the payment submit control. The element remained disabled and was later detached from the DOM, indicating unstable UI state during a failed payment API call.

### Root Cause Analysis
Playwright timed out waiting for \`button[data-testid="submit-payment"]\` to become enabled. Network logs show \`POST /v1/payments\` returned HTTP 500 (Payment Gateway Timeout, code 5004). The UI likely disables the submit button during payment processing but does not re-enable or recover when the API fails.

### Steps to Reproduce
1. Navigate to checkout with a valid cart total ($49.99).
2. Proceed to the payment step.
3. Trigger payment submission while the payment gateway returns 500.
4. Observe the submit button stays disabled or is removed from the DOM.
5. Run \`checkout-flow.spec.ts\` — click on submit-payment times out after 30s.

### Suggested Fix
- Handle payment API 500 responses: re-enable the submit button and show an error state.
- Add retry/backoff or user-visible failure messaging in \`CheckoutPage.submitPayment\`.
- Investigate payment gateway timeout (code 5004) with the payments service team.
`;
}

export async function analyzeLogAndCreateBugReport(
  errorLog?: string,
): Promise<string> {
  warnMockMode('Bug report generator');
  const log = errorLog ?? fs.readFileSync(LOG_FILE, 'utf-8');
  console.log('🔍 Analyzing Playwright failure log...');

  let report: string;

  try {
    if (USE_MOCK) {
      report = createMockBugReport(log);
      console.log('✅ [MOCK] Generated bug report from heuristics.');
    } else {
      report = await askClaude({
        system: SYSTEM_PROMPT,
        prompt: buildAnalysisPrompt(log),
        maxTokens: 1500,
        temperature: 0.25,
      });
      console.log('✅ Claude generated bug report.');
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, report);

    console.log(`📄 Report saved to ${OUTPUT_FILE}`);
    console.log('\n--- Preview ---\n');
    console.log(report.slice(0, 400) + (report.length > 400 ? '\n...' : ''));
    return report;
  } catch (error) {
    console.error('❌ Failed to generate bug report:', error);
    throw error;
  }
}

const isMain =
  process.argv[1]?.includes('log-analyzer') ||
  process.argv[1]?.endsWith('log-analyzer.ts');

if (isMain) {
  analyzeLogAndCreateBugReport().catch(() => process.exit(1));
}
