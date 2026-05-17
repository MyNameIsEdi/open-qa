import { test, expect } from '@playwright/test';
import { createMockEdgeCaseData } from '../src/skills/generate-test-data';
import { createMockBugReport } from '../src/skills/log-analyzer';
import { createMockHealedLocator } from '../src/agents/self-healing';

test.describe('Mock mode helpers', () => {
  test('createMockEdgeCaseData returns edge-case payloads', () => {
    const data = createMockEdgeCaseData(3);
    expect(data).toHaveLength(3);
    expect(data[0].first_name).toContain('DROP TABLE');
    expect(data[0].last_name).toContain('<script>');
  });

  test('createMockBugReport includes Jira sections', () => {
    const log = 'Error: locator.click: Timeout 30000ms exceeded.';
    const report = createMockBugReport(log);
    expect(report).toContain('## Bug:');
    expect(report).toContain('**Severity:**');
    expect(report).toContain('### Steps to Reproduce');
  });

  test('createMockHealedLocator prefers data-testid', () => {
    const html = '<button data-testid="pay-now">Pay</button>';
    const spec = createMockHealedLocator(html, 'pay button');
    expect(spec.strategy).toBe('getByTestId');
    expect(spec.target).toBe('pay-now');
  });
});
