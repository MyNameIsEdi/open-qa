import * as fs from 'fs';
import * as path from 'path';

/**
 * Example 1: E-Commerce Checkout Test Suite
 * 
 * This example demonstrates combining three skills:
 * 1. Self-Healing Locator — Adapt when form selectors change
 * 2. Smart Data Gen — Test with edge-case payment amounts
 * 3. Bug Triage — Auto-file bugs if checkout fails
 * 
 * Real-world use: E-commerce platforms where UI gets updated frequently
 * 
 * Usage:
 *   npx tsx examples/ecommerce-checkout.ts
 */

// Step 1: Import the skills
import { healLocator } from '../01-Self-Healing-Tests/self-healing';
import { createMockEdgeCaseData } from '../02-Smart-Data-Gen/generate-test-data';
import { createMockBugReport } from '../03-Automated-Bug-Report/log-analyzer';

// Step 2: Define test data structures
interface CheckoutTestResult {
  scenario: string;
  testData: {
    firstName: string;
    lastName: string;
    email: string;
    cartTotal: number;
    itemsCount: number;
  };
  status: 'pass' | 'fail';
  error?: string;
  timestamp: string;
}

// Step 3: Mock checkout form HTML (simulates the page DOM)
const mockCheckoutHTML = `
  <form id="checkout-form" class="payment-checkout">
    <div class="form-section">
      <label for="firstName">First Name</label>
      <input id="firstName" class="input-field" type="text" data-test-id="firstname-input" />
    </div>
    <div class="form-section">
      <label for="lastName">Last Name</label>
      <input id="lastName" class="input-field" type="text" data-test-id="lastname-input" />
    </div>
    <div class="form-section">
      <label for="email">Email</label>
      <input id="email" class="input-field email-input" type="email" data-test-id="email-input" />
    </div>
    <div class="form-section">
      <label for="amount">Total Amount</label>
      <input id="amount" class="input-field currency-field" type="number" data-test-id="amount-input" />
    </div>
    <button type="submit" class="btn btn-primary checkout-btn" data-test-id="submit-btn">
      Complete Purchase
    </button>
  </form>
`;

/**
 * Simulate filling checkout form with test data
 * In real scenario, would use Playwright to interact with actual form
 */
async function fillCheckoutForm(
  testData: any
): Promise<CheckoutTestResult> {
  const scenario = `Checkout: ${testData.email} - $${testData.cart_total}`;
  
  try {
    // Step 1: Try finding selectors with self-healing
    const firstNameSelector = await healLocator(mockCheckoutHTML, 'First Name input');
    const amountSelector = await healLocator(mockCheckoutHTML, 'Amount input');
    const submitSelector = await healLocator(mockCheckoutHTML, 'submit button');
    
    // Step 2: Simulate form filling (would be actual Playwright actions)
    console.log(`  ✓ Located form fields`);
    console.log(`    - First Name: ${firstNameSelector}`);
    console.log(`    - Amount: ${amountSelector}`);
    console.log(`    - Submit: ${submitSelector}`);
    
    // Step 3: Simulate validation
    if (testData.cart_total < 0) {
      throw new Error('Invalid cart total: negative amount detected');
    }
    
    if (!testData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    // Step 4: Success
    return {
      scenario,
      testData,
      status: 'pass',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      scenario,
      testData,
      status: 'fail',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run the complete checkout test suite
 */
async function runCheckoutTestSuite(): Promise<void> {
  console.log('🛒 E-Commerce Checkout Test Suite\n');
  console.log('Skills used:');
  console.log('  • Self-Healing Locator (recover form selectors)');
  console.log('  • Smart Data Gen (edge-case test data)');
  console.log('  • Bug Triage (auto-report failures)\n');
  
  // Create output directory
  const outputDir = path.join(process.cwd(), 'checkout-test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Step 1: Generate edge-case test data
  console.log('📊 Generating test data with edge cases...\n');
  const testPayloads = createMockEdgeCaseData(5);
  
  // Step 2: Run tests with each payload
  console.log('🧪 Running checkout tests:\n');
  const results: CheckoutTestResult[] = [];
  
  for (let i = 0; i < testPayloads.length; i++) {
    const payload = testPayloads[i];
    console.log(`Test ${i + 1}: ${payload.scenario_description}`);
    
    const result = await fillCheckoutForm(payload);
    results.push(result);
    
    if (result.status === 'pass') {
      console.log(`  ✅ PASS\n`);
    } else {
      console.log(`  ❌ FAIL: ${result.error}\n`);
    }
  }
  
  // Step 3: Generate report
  console.log('📋 Generating test report...\n');
  const testReport = generateCheckoutReport(results);
  
  const reportPath = path.join(outputDir, 'CHECKOUT_TEST_REPORT.md');
  fs.writeFileSync(reportPath, testReport);
  console.log(`Report saved: ${reportPath}`);
  
  // Step 4: Auto-triage failures
  const failures = results.filter(r => r.status === 'fail');
  if (failures.length > 0) {
    console.log(`\n🐛 Auto-triaging ${failures.length} failure(s)...\n`);
    
    for (let i = 0; i < failures.length; i++) {
      const failure = failures[i];
      const errorLog = `
Test: ${failure.scenario}
Data: ${JSON.stringify(failure.testData, null, 2)}
Error: ${failure.error}
Timestamp: ${failure.timestamp}
      `.trim();
      
      const bugReport = createMockBugReport(errorLog);
      const bugPath = path.join(outputDir, `BUG_${i + 1}_${Date.now()}.md`);
      fs.writeFileSync(bugPath, bugReport);
      
      console.log(`  📄 Bug report: ${path.basename(bugPath)}`);
    }
  }
  
  // Step 5: Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  console.log(`\n📈 Summary:`);
  console.log(`  • Total tests: ${results.length}`);
  console.log(`  • Passed: ${passed}`);
  console.log(`  • Failed: ${failed}`);
  console.log(`  • Success rate: ${((passed / results.length) * 100).toFixed(1)}%`);
}

/**
 * Generate markdown test report
 */
function generateCheckoutReport(results: CheckoutTestResult[]): string {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  let markdown = `# E-Commerce Checkout Test Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests:** ${results.length}\n`;
  markdown += `- **Passed:** ${passed} ✅\n`;
  markdown += `- **Failed:** ${failed} ❌\n`;
  markdown += `- **Success Rate:** ${((passed / results.length) * 100).toFixed(1)}%\n\n`;
  
  markdown += `## Test Details\n\n`;
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const icon = result.status === 'pass' ? '✅' : '❌';
    
    markdown += `### ${icon} Test ${i + 1}: ${result.scenario}\n\n`;
    markdown += `**Status:** ${result.status.toUpperCase()}\n\n`;
    markdown += `**Test Data:**\n`;
    markdown += `\`\`\`json\n`;
    markdown += `${JSON.stringify(result.testData, null, 2)}\n`;
    markdown += `\`\`\`\n\n`;
    
    if (result.error) {
      markdown += `**Error:** ${result.error}\n\n`;
    }
    
    markdown += `**Timestamp:** ${result.timestamp}\n\n`;
  }
  
  markdown += `## Recommendations\n\n`;
  markdown += `- Review failed test cases for edge case handling\n`;
  markdown += `- Verify form validation logic with generated payloads\n`;
  markdown += `- Consider adding more error recovery patterns\n`;
  
  return markdown;
}

// Only run if executed directly
if (process.argv.some(arg => arg.endsWith('ecommerce-checkout.ts'))) {
  runCheckoutTestSuite().catch(console.error);
}

// Export for reuse in other examples
export { fillCheckoutForm, runCheckoutTestSuite, generateCheckoutReport };
