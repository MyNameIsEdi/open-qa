import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // טעינת המפתח מהתיקייה הראשית

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * פונקציה שמנתחת לוג שגיאה ומחזירה כרטיס באג מפורט
 */
async function analyzeLogAndCreateBugReport(errorLog: string) {
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
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.3, // טמפרטורה נמוכה כדי לקבל תשובה טכנית ומדויקת
    });

    const reportContent = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    
    // שמירת התוצאה לקובץ Markdown
    const outputPath = path.join(__dirname, '..', 'AI_GENERATED_BUG_REPORT.md');
    fs.writeFileSync(outputPath, reportContent);

    console.log(`\n✅ Bug Report successfully generated! Saved to: ${outputPath}`);
    console.log("\n--- Preview of the Report ---\n");
    console.log(reportContent.substring(0, 300) + "...\n");

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
analyzeLogAndCreateBugReport(mockFailedTestLog);
