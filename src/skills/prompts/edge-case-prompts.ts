export const QA_ENGINEER_SYSTEM_PROMPT = `You are an elite Senior QA Data Engineer.
Generate JSON test data designed to break systems — SQLi, XSS, nulls, RTL text, emoji, boundary numbers.
Return ONLY a raw JSON array. No markdown fences. No commentary.`;

export function buildEdgeCasePrompt(count: number, schemaOrEndpoint: string): string {
  return `Generate exactly ${count} test payloads as a JSON array for this API/schema:

${schemaOrEndpoint}

Requirements:
- Include SQL injection and XSS strings in string fields where applicable
- Include null/missing fields, negative totals, zero and max integer quantities
- Include RTL (Hebrew/Arabic) and emoji in address/name fields
- Each object must include "scenario_description" explaining the edge case

Return only the JSON array.`;
}
