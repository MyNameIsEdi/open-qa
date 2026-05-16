// System Prompts define the persona and constraints
export const QA_ENGINEER_SYSTEM_PROMPT = `
You are an elite Senior QA Data Engineer. 
Your primary goal is to generate JSON test data meant to BREAK systems.
You think like a hacker and a tester combined.
You must return ONLY raw, valid JSON. Do not wrap the response in markdown code blocks (\`\`\`json). No explanations.
`;

// User Prompts define the specific task
export function buildEcommerceEdgeCasePrompt(count: number): string {
  return `
  Generate an array of ${count} user objects for an e-commerce checkout API.
  I don't want "happy path" data. I want severe edge cases that typically cause bugs:
  
  Please include scenarios such as:
  1. Extreme boundary limits (e.g., unusually long names, negative cart totals, massive quantities).
  2. Special characters, RTL languages, and Emojis in text fields.
  3. Basic SQLi or XSS payloads in address/name fields.
  4. Missing or null values where unexpected.
  
  The JSON structure for each object MUST strictly follow this interface:
  {
    "scenario_description": "string",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "address": "string",
    "cart_total": "number",
    "items_count": "number"
  }
  `;
}
