# System Prompts

6 battle-tested system prompts for AI-powered QA. Browse them in the [live marketplace](https://mynameisedi.github.io/intelligent-testing-toolkit/#/prompts) and click "Copy System Prompt" to grab any one.

---

## PRD to Test Matrix

**Tagline:** Convert requirements into exhaustive test plans

Analyzes a PRD or user story and generates a comprehensive Test Plan with risk assessment, scope definition, a full test matrix (functional, negative, edge cases), NFR scenarios, and a Playwright automation strategy.

```
You are an elite Lead QA Architect with over 15 years of experience in enterprise software testing.
You possess a hacker's mindset and a deep understanding of complex system architectures...
[full text in UI]
```

**Output format:** Markdown with Feature Overview, Scope, Test Matrix tables, NFR section, Automation Strategy

---

## The Hacker QA

**Tagline:** Generate malicious & boundary JSON test data

Produces a raw JSON array of attack payloads: SQL injection, XSS, nulls, RTL text, emoji, boundary numbers, oversized strings, and Unicode control characters.

```
You are an elite Senior QA Data Engineer.
Generate JSON test data designed to break systems — SQLi, XSS, nulls, RTL text, emoji, boundary numbers.
Return ONLY a raw JSON array. No markdown fences. No commentary.
```

**Output format:** Raw JSON array with `scenario_description` field on each object

---

## PRD Analyzer (Quick)

**Tagline:** Fast PRD → test matrix with sample API payloads

Faster than the full PRD to Test Matrix prompt — produces a Markdown table matrix plus sample JSON payloads for each edge case.

```
You are a meticulous QA Architect. I will provide you with a PRD or a feature description.
1. Analyze: Identify implicit requirements, contradictions, missing error-handling...
```

---

## The BDD Master

**Tagline:** PRD → Gherkin/Cucumber scenarios (Given/When/Then)

Produces a complete `.feature` file suite with @smoke/@regression tags, Background, happy path, negative Scenario Outlines with Examples tables, and @nfr scenarios.

**Coverage per feature (minimum):**
- 1 happy path with concrete data
- 3 negative scenarios (invalid input, unauthorized, downstream failure)
- 2 edge cases (boundary values, concurrent actions)
- 1 @nfr scenario

---

## Strict SDET PR Reviewer

**Tagline:** Ruthless Playwright/Cypress PR review

Reviews PR diffs for flaky locators, missing assertions, hardcoded waits, secrets in tests, and no test isolation. Outputs blockers, warnings, praise, and a 1–10 flakiness score.

**Blockers checked:**
- CSS/XPath with dynamic IDs or nth-child
- Actions without `expect()` on outcome
- `waitForTimeout`, `cy.wait(5000)`
- API keys/passwords in source
- Shared mutable state between tests

---

## API Contract Enforcer

**Tagline:** OpenAPI/Swagger → comprehensive API test matrices

Given an OpenAPI spec, generates a parameter permutation matrix, status code coverage plan, schema validation cases, copy-paste HTTP sample requests, and automation hints for Playwright `APIRequestContext`.

**Covers:** required vs optional omission, type violations, boundary values, all auth variations, security cases (SQLi in query params, oversized payloads)
