import assert from 'node:assert';
import { createMockEdgeCaseData } from '../02-Smart-Data-Gen/generate-test-data.ts';
import { createMockBugReport } from '../03-Automated-Bug-Report/log-analyzer.ts';
import { healLocator } from '../01-Self-Healing-Tests/self-healing.ts';

process.env.ANTHROPIC_API_KEY = '';

function testGenerateMockData() {
  const testData = createMockEdgeCaseData(3);
  assert.strictEqual(testData.length, 3, 'Should generate the requested number of items');
  assert.strictEqual(typeof testData[0].scenario_description, 'string');
  assert.strictEqual(typeof testData[0].first_name, 'string');
  assert.ok(testData[0].first_name.length >= 200, 'First name should be a long edge-case value');
  assert.ok(testData[0].email.includes('edgecase+0@'), 'Email should follow mock format');
}

async function testHealLocatorMock() {
  const html = `<button data-test-id="checkout-confirm-button" class="btn primary-action">Complete Order</button>`;
  const selector = await healLocator(html, 'checkout confirm button');
  assert.strictEqual(selector, 'button[data-test-id="checkout-confirm-button"]');
}

function testCreateMockBugReport() {
  const log = `Error: locator.click: Timeout 30000ms exceeded.\nCall log...`;
  const report = createMockBugReport(log);
  assert.ok(report.startsWith('## 🐛 Bug:'), 'Report should start with a bug header');
  assert.ok(report.includes('Severity:'), 'Report should include severity');
  assert.ok(report.includes('Steps to Reproduce'), 'Report should include steps to reproduce');
}

(async () => {
  console.log('Running lightweight helper tests...');
  testGenerateMockData();
  await testHealLocatorMock();
  testCreateMockBugReport();
  console.log('✅ All helper tests passed.');
})();
