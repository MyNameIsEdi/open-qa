# Skills

Composable utilities that can be imported into any test framework or called via the Express API. Each skill lives under `src/skills/`.

---

## 🟢 Smart Data Gen

**Status:** Active | **File:** `src/skills/generate-test-data.ts`

Generates extreme edge-case JSON payloads designed to break systems: SQL injection, XSS strings, null/missing fields, RTL text (Hebrew/Arabic), emoji, and boundary numbers. Perfect for API fuzzing.

### Run
```bash
npm run run:datagen
# or directly:
npx tsx src/skills/generate-test-data.ts
```

### Output
`output/generated-edge-cases.json`

### System Prompt
```
You are an elite Senior QA Data Engineer.
Generate JSON test data designed to break systems — SQLi, XSS, nulls, RTL text, emoji, boundary numbers.
Return ONLY a raw JSON array. No markdown fences. No commentary.
```

### Input Schema
```json
{
  "target": "string — the API field, schema, or URL to generate payloads for",
  "count": "integer — number of payloads to generate (default: 20)"
}
```

### Example Output
```json
[
  {
    "scenario_description": "SQL injection in name field",
    "name": "' OR '1'='1",
    "email": "test@test.com",
    "quantity": 1
  },
  {
    "scenario_description": "XSS payload in address",
    "name": "John",
    "address": "<script>alert('xss')</script>",
    "quantity": -1
  }
]
```

---

## 🟡 GraphQL Fuzzer _(Planned)_

Takes a GraphQL schema and generates a comprehensive fuzz test suite: type mismatches, nested injection, introspection abuse, and deeply nested queries.

```bash
# Coming soon:
npx tsx scripts/graphql-fuzzer.ts --schema ./api/schema.graphql
```

---

## 🟡 K6 Load Profile Gen _(Planned)_

Analyzes a Playwright test file and generates a k6 load test script that mirrors the same user journey at scale, with realistic virtual user ramp-up and think times.

```bash
# Coming soon:
npx tsx scripts/k6-profile-gen.ts --input ./tests/checkout.spec.ts
```

---

## 🟡 Regex Log Scraper _(Planned)_

AI-powered log analysis: extracts error patterns, anomaly timestamps, and severity clusters from raw production logs. Returns structured JSON with frequencies and P0–P3 classifications.

```bash
# Coming soon:
npx tsx scripts/regex-log-scraper.ts --file ./logs/production.log
```

---

## 🟡 JWT Manipulator _(Planned)_

Generates a full suite of JWT attack payloads for security regression testing: none algorithm, expired tokens, key confusion attacks, missing required claims.

```bash
# Coming soon:
npx tsx scripts/jwt-manipulator.ts --secret test --out ./fixtures/tokens.json
```
