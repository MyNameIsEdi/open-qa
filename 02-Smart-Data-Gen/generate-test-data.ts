import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { QA_ENGINEER_SYSTEM_PROMPT, buildEcommerceEdgeCasePrompt } from './prompts/ecommerce-edge-cases';

// טעינת משתני סביבה מהתיקייה הראשית של הפרויקט
dotenv.config({ path: '../.env' });

interface EdgeCasePayload {
  scenario_description: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string | null;
  cart_total: number;
  items_count: number;
}

const USE_MOCK: boolean = !Boolean(process.env.ANTHROPIC_API_KEY);
let anthropic: any = undefined;
if (!USE_MOCK) {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
} else {
  console.warn('⚠️ Anthropic API key not found — running data-gen in MOCK mode.');
}

export function createMockEdgeCaseData(numberOfCases: number = 5): EdgeCasePayload[] {
  const testData: EdgeCasePayload[] = [];
  for (let i = 0; i < numberOfCases; i++) {
    testData.push({
      scenario_description: `Mock edge case #${i + 1} - long name / special chars`,
      first_name: 'A'.repeat(200) + '🚫',
      last_name: "O'Connor<script>alert(1)</script>",
      email: `edgecase+${i}@example.com`,
      address: i % 2 === 0 ? null : 'שד-הרצל 12, תל-אביב',
      cart_total: i % 3 === 0 ? -99.99 : 9999999,
      items_count: i === 2 ? 1000000 : 1,
    });
  }
  return testData;
}

export async function generateEdgeCaseData(numberOfCases: number = 5) {
  console.log(`🤖 Asking Claude to generate ${numberOfCases} extreme QA edge cases...`);

  try {
    let testData: EdgeCasePayload[] = [];
    if (USE_MOCK) {
      testData = createMockEdgeCaseData(numberOfCases);
    } else {
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        system: QA_ENGINEER_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildEcommerceEdgeCasePrompt(numberOfCases) }
        ],
        temperature: 0.8, // טמפרטורה מעט גבוהה כדי לקבל תרחישי קצה יצירתיים במיוחד
      });

      // חילוץ הטקסט (ה-JSON) מהתשובה
      const rawContent = response.content[0].type === 'text' ? response.content[0].text : '';
      // גיבוי לניקוי markdown במידה והמודל התעלם מהוראות המערכת
      const cleanJsonStr = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      testData = JSON.parse(cleanJsonStr);
    }

    // שמירת הנתונים לתיקייה הנוכחית
    const outputPath = './generated-edge-cases.json';
    fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2));

    console.log(`\n✅ Success! Data generated and saved to ${outputPath}`);
    console.log("--------------------------------------------------");
    console.log(`Preview of Scenario 1: [${testData[0].scenario_description}]`);
    console.log(`Payload: ${testData[0].first_name} ${testData[0].last_name} | Cart: $${testData[0].cart_total}`);
    console.log("--------------------------------------------------\n");

  } catch (error) {
    console.error("❌ Error generating data. Ensure your API key is correct and valid.", error);
  }
}

// הפעלת הפונקציה - אפשר לשנות את המספר כדי לקבל יותר או פחות נתונים
if (process.argv.some(arg => arg.endsWith('generate-test-data.ts'))) {
  generateEdgeCaseData(5);
}
