import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // טעינת המפתח מהתיקייה הראשית

const USE_MOCK: boolean = !Boolean(process.env.ANTHROPIC_API_KEY);
let anthropic: any = undefined;
if (!USE_MOCK) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
} else {
  console.warn('⚠️ Anthropic API key not found — running bug-report in MOCK mode.');
}

export function createMockBugReport(errorLog: string) {
  const titleMatch = errorLog.match(/Error:\s*([^\n]+)\./i);
  const title = titleMatch ? `Bug: ${titleMatch[1].trim()}` : 'Bug: Automated test failure';
  return `## 🐛 ${title}\n**Severity:** High\n**Component:** Checkout\n\n### 📝 Description\nAutomated test failed due to an interaction with a disabled or detached element during checkout.\n\n### 🔍 Root Cause Analysis (AI Triage)\nThe test attempted to click a payment submit button that was disabled or detached; network context shows a 500 from payment API indicating downstream failure.\n\n### 👣 Steps to Reproduce (Inferred)\n1. Go to checkout page\n2. Attempt to submit payment with valid cart\n3. Observe disabled button or 500 response from payment API\n\n### 🛠️ Suggested Fix for Developers\nInvestigate UI state management for the submit button and the payment API reliability (500 Internal Server Error).\n`;
}

/**
 * פונקציה שמנתחת לוג שגיאה ומחזירה כרטיס באג מפורט
 */
export async function analyzeLogAndCreateBugReport(errorLog: string) {
  console.log("🔍 Analyzing raw error log with AI...");

  const systemPrompt = `You are an elite QA Automation Architect. 
  Your job is to analyze failed test logs/stack traces and convert them into professional, highly detailed Jira Bug Reports.`;

  const userPrompt = `
  Analyze the following automated test failure log. 
  
  ERROR LOG:
  """
  ${errorLog}
  """

  Please generate a comprehensive Bug Report using the following format:
  
  ## 🐛 Bug: [Generate a concise, clear title]
  **Severity:** [High/Medium/Low based on the context]
  **Component:** [Infer from the log, e.g., Checkout, Authentication, API]
  
  ### 📝 Description
  [Explain what went wrong in 2-3 sentences]
  
  ### 🔍 Root Cause Analysis (AI Triage)
  [Explain WHY the test failed based on the stack trace. Be technical.]
  
  ### 👣 Steps to Reproduce (Inferred)
  1. ...
  2. ...
  
  ### 🛠️ Suggested Fix for Developers
  [What should the dev team look into to fix this?]
  
  Return ONLY the Markdown text for the bug report. No intro or outro.
  `;

  try {
    let reportContent = '';
    if (USE_MOCK) {
      // Simple heuristic-generated report
      const titleMatch = errorLog.match(/Error:\s*([^\n]+)\./i);
      const title = titleMatch ? `Bug: ${titleMatch[1].trim()}` : 'Bug: Automated test failure';
      reportContent = `## 🐛 ${title}\n**Severity:** High\n**Component:** Checkout\n\n### 📝 Description\nAutomated test failed due to an interaction with a disabled or detached element during checkout.\n\n### 🔍 Root Cause Analysis (AI Triage)\nThe test attempted to click a payment submit button that was disabled or detached; network context shows a 500 from payment API indicating downstream failure.\n\n### 👣 Steps to Reproduce (Inferred)\n1. Go to checkout page\n2. Attempt to submit payment with valid cart\n3. Observe disabled button or 500 response from payment API\n\n### 🛠️ Suggested Fix for Developers\nInvestigate UI state management for the submit button and the payment API reliability (500 Internal Server Error).\n`;
      const outputPath = path.join(__dirname, '..', 'AI_GENERATED_BUG_REPORT.md');
      fs.writeFileSync(outputPath, reportContent);
      console.log(`\n✅ [MOCK] Bug Report generated and saved to: ${outputPath}`);
      console.log('\n--- Preview of the Report ---\n');
      console.log(reportContent.substring(0, 300) + '...\n');
    } else {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.3, // טמפרטורה נמוכה כדי לקבל תשובה טכנית ומדויקת
      });

      reportContent = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
      // שמירת התוצאה לקובץ Markdown
      const outputPath = path.join(__dirname, '..', 'AI_GENERATED_BUG_REPORT.md');
      fs.writeFileSync(outputPath, reportContent);

      console.log(`\n✅ Bug Report successfully generated! Saved to: ${outputPath}`);
      console.log('\n--- Preview of the Report ---\n');
      console.log(reportContent.substring(0, 300) + '...\n');
    }

  } catch (error) {
    console.error("❌ Failed to generate bug report:", error);
  }
}

// ==========================================
// הדגמה: לוג שגיאה אמיתי (Mock) של Playwright
// ==========================================
const mockFailedTestLog = `
Error: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('button[data-testid="submit-payment"]')
  -   locator resolved to visible <button disabled class="btn-primary">Pay $49.99</button>
  - attempting click action
  -   waiting for element to be visible, enabled and stable
  -   element is disabled - waiting...
  - element was detached from the DOM, retrying

    at CheckoutPage.submitPayment (/tests/pages/CheckoutPage.ts:45:32)
    at /tests/e2e/checkout-flow.spec.ts:112:15

API Network Log Context:
POST https://api.ecommerce.com/v1/payments - 500 Internal Server Error
Response: {"error": "Payment Gateway Timeout", "code": 5004}
`;

// הפעלת הסקריפט
if (process.argv.some(arg => arg.endsWith('log-analyzer.ts'))) {
  analyzeLogAndCreateBugReport(mockFailedTestLog);
}
