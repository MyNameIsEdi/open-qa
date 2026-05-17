import * as fs from 'fs';
import * as path from 'path';

/**
 * Example 2: API Integration & Fuzzing Test
 * 
 * This example demonstrates:
 * 1. Smart Data Gen — Generate fuzzing payloads with edge cases
 * 2. Bug Triage — Classify API responses and errors
 * 
 * Real-world use: REST API testing, fuzz testing, boundary validation
 * 
 * Usage:
 *   npx tsx examples/api-integration-test.ts
 */

import { createMockEdgeCaseData } from '../02-Smart-Data-Gen/generate-test-data';
import { createMockBugReport } from '../03-Automated-Bug-Report/log-analyzer';

// Step 1: Define API response structures
interface APITestCase {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  payload?: any;
  expectedStatus?: number;
  description: string;
}

interface APITestResult {
  testCase: APITestCase;
  actualStatus: number;
  responseTime: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

/**
 * Mock API client (simulates calling a real REST endpoint)
 */
class MockAPIClient {
  private baseURL: string = 'https://api.example.com';
  
  /**
   * Simulate API call with fuzzing data
   */
  async call(testCase: APITestCase): Promise<APITestResult> {
    const startTime = Date.now();
    
    try {
      // Simulate API response based on payload
      const response = this.simulateAPIResponse(testCase);
      const responseTime = Date.now() - startTime;
      
      // Determine success based on status code
      const success = response.status >= 200 && response.status < 300;
      
      return {
        testCase,
        actualStatus: response.status,
        responseTime,
        success,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        testCase,
        actualStatus: 500,
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Simulate different API responses
   */
  private simulateAPIResponse(testCase: APITestCase): { status: number; body: any } {
    // Simulate validation failures for extreme values
    if (testCase.payload?.cart_total < 0) {
      return { status: 400, body: { error: 'Invalid amount: must be positive' } };
    }
    
    if (testCase.payload?.email && !testCase.payload.email.includes('@')) {
      return { status: 400, body: { error: 'Invalid email format' } };
    }
    
    // Long names might hit server limit
    if (testCase.payload?.first_name?.length > 500) {
      return { status: 413, body: { error: 'Payload too large' } };
    }
    
    // Special chars might cause injection
    if (testCase.payload?.first_name?.includes('<script>')) {
      return { status: 400, body: { error: 'Invalid characters detected' } };
    }
    
    // Success for valid payloads
    return { status: 201, body: { success: true, id: Math.random().toString() } };
  }
}

/**
 * Run API integration test suite
 */
async function runAPITestSuite(): Promise<void> {
  console.log('🔌 API Integration & Fuzzing Test Suite\n');
  console.log('Skills used:');
  console.log('  • Smart Data Gen (generate fuzzing payloads)');
  console.log('  • Bug Triage (classify API errors)\n');
  
  // Create output directory
  const outputDir = path.join(process.cwd(), 'api-test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const apiClient = new MockAPIClient();
  
  // Step 1: Generate fuzzing payloads
  console.log('🎲 Generating fuzzing payloads with edge cases...\n');
  const fuzzyPayloads = createMockEdgeCaseData(6);
  
  // Step 2: Build test cases from fuzzing data
  const testCases: APITestCase[] = fuzzyPayloads.map((payload, i) => ({
    method: 'POST',
    endpoint: '/api/checkout',
    payload,
    expectedStatus: 201,
    description: `Fuzz test ${i + 1}: ${payload.scenario_description}`
  }));
  
  // Step 3: Run tests
  console.log('🧪 Running API tests:\n');
  const results: APITestResult[] = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: ${testCase.description}`);
    
    const result = await apiClient.call(testCase);
    results.push(result);
    
    const statusIcon = result.success ? '✅' : '❌';
    console.log(`  ${statusIcon} Status: ${result.actualStatus} | Time: ${result.responseTime}ms`);
    
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    console.log();
  }
  
  // Step 4: Generate detailed report
  console.log('📋 Generating API test report...\n');
  const testReport = generateAPIReport(results);
  
  const reportPath = path.join(outputDir, 'API_TEST_REPORT.md');
  fs.writeFileSync(reportPath, testReport);
  console.log(`Report saved: ${reportPath}`);
  
  // Step 5: Auto-triage failures
  const failures = results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log(`\n🐛 Auto-triaging ${failures.length} API error(s)...\n`);
    
    for (let i = 0; i < failures.length; i++) {
      const failure = failures[i];
      const errorLog = `
API Test Failure
Endpoint: ${failure.testCase.endpoint}
Method: ${failure.testCase.method}
Status: ${failure.actualStatus}
Payload: ${JSON.stringify(failure.testCase.payload, null, 2)}
Error: ${failure.error || 'Request failed'}
ResponseTime: ${failure.responseTime}ms
      `.trim();
      
      const bugReport = createMockBugReport(errorLog);
      const bugPath = path.join(outputDir, `API_BUG_${i + 1}.md`);
      fs.writeFileSync(bugPath, bugReport);
      
      console.log(`  📄 Bug report: ${path.basename(bugPath)}`);
    }
  }
  
  // Step 6: Summary
  const passed = results.filter(r => r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log(`\n📈 Summary:`);
  console.log(`  • Total tests: ${results.length}`);
  console.log(`  • Passed: ${passed}`);
  console.log(`  • Failed: ${failures.length}`);
  console.log(`  • Avg response time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`  • Success rate: ${((passed / results.length) * 100).toFixed(1)}%`);
}

/**
 * Generate markdown API test report
 */
function generateAPIReport(results: APITestResult[]): string {
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  let markdown = `# API Integration Test Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total Tests:** ${results.length}\n`;
  markdown += `- **Passed:** ${passed} ✅\n`;
  markdown += `- **Failed:** ${failed} ❌\n`;
  markdown += `- **Success Rate:** ${((passed / results.length) * 100).toFixed(1)}%\n`;
  markdown += `- **Avg Response Time:** ${avgTime.toFixed(0)}ms\n\n`;
  
  markdown += `## Test Results by Status Code\n\n`;
  
  // Group by status code
  const statusGroups = new Map<number, APITestResult[]>();
  for (const result of results) {
    const code = result.actualStatus;
    if (!statusGroups.has(code)) {
      statusGroups.set(code, []);
    }
    statusGroups.get(code)!.push(result);
  }
  
  for (const [status, items] of statusGroups) {
    const isBad = status >= 400;
    const icon = isBad ? '❌' : '✅';
    markdown += `### ${icon} Status ${status}\n`;
    markdown += `- **Count:** ${items.length}\n`;
    markdown += `- **Avg Time:** ${(items.reduce((sum, r) => sum + r.responseTime, 0) / items.length).toFixed(0)}ms\n\n`;
  }
  
  markdown += `## Detailed Results\n\n`;
  
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const icon = result.success ? '✅' : '❌';
    
    markdown += `### ${icon} Test ${i + 1}\n\n`;
    markdown += `**Endpoint:** ${result.testCase.method} ${result.testCase.endpoint}\n`;
    markdown += `**Status:** ${result.actualStatus}\n`;
    markdown += `**Response Time:** ${result.responseTime}ms\n`;
    
    if (result.testCase.payload) {
      markdown += `**Payload:**\n\`\`\`json\n`;
      markdown += `${JSON.stringify(result.testCase.payload, null, 2)}\n`;
      markdown += `\`\`\`\n`;
    }
    
    if (result.error) {
      markdown += `**Error:** ${result.error}\n`;
    }
    
    markdown += `\n`;
  }
  
  markdown += `## Recommendations\n\n`;
  markdown += `- Fix API validation for edge cases\n`;
  markdown += `- Add input sanitization for special characters\n`;
  markdown += `- Optimize slow endpoints (${Math.max(...results.map(r => r.responseTime))}ms max)\n`;
  
  return markdown;
}

// Only run if executed directly
if (process.argv.some(arg => arg.endsWith('api-integration-test.ts'))) {
  runAPITestSuite().catch(console.error);
}

// Export for reuse
export { runAPITestSuite, generateAPIReport };
