# Skill Template

This folder is a boilerplate for contributors to create new skills. Copy this folder and follow the structure below.

## How to Create a New Skill

1. **Copy this template** to a new numbered folder (e.g., `06-Your-Skill-Name/`)
2. **Update README.md** with your skill's description and usage
3. **Implement your skill** in `skill.ts`
4. **Test locally** with `npm test` and `npx tsx skill.ts`
5. **Update main README** to include your new skill
6. **Submit a PR** with your changes

## Folder Structure

```
XX-Skill-Name/
├── README.md              # Skill documentation
├── skill.ts               # Main implementation (exported functions + demo)
├── prompts/               # (Optional) Claude prompts specific to this skill
│   └── prompt.md
└── tests/                 # (Optional) Unit tests for helper functions
    └── skill.test.ts
```

## Template Files

### 1. README.md

Includes:

- **Title & emoji** (e.g., "# 06 — Your Skill Name 🎨")
- **Why it matters** — Problem it solves
- **Quick start** — How to run the demo
- **How it works** — Step-by-step explanation
- **Features** — Key capabilities (✅ checklist)
- **Configuration** — Settings users can customize
- **Output** — What files it generates
- **Real-world use cases** — 3+ practical examples
- **Advanced usage** — For power users
- **Limitations & notes** — Be honest about constraints
- **Contributing** — Link back to CONTRIBUTING.md

### 2. skill.ts

Must include:

- **USE_MOCK pattern** — Works without API key
  ```typescript
  const USE_MOCK = !Boolean(process.env.ANTHROPIC_API_KEY);
  ```
- **Exported helper functions** — Testable, side-effect-free
  ```typescript
  export function helperFunction(input: string): string { ... }
  export function anotherHelper(data: any): Promise<string> { ... }
  ```
- **Main demo function** — Entry point
  ```typescript
  export async function runDemoTest(): Promise<void> { ... }
  ```
- **argv check** — Only run demo when executed directly
  ```typescript
  if (process.argv.some((arg) => arg.endsWith('skill.ts'))) {
    runDemoTest().catch(console.error);
  }
  ```

### 3. Prompts (Optional)

If your skill uses Claude, create `prompts/prompt.md` with:

```markdown
# Your Skill Prompt

System prompt for Claude:

- Be specific about the task
- Include examples of expected output
- Set constraints (length, format, tone)

## Example Input

[Example]

## Expected Output

[Example]
```

## Code Style Guide

```typescript
// 1. Use TypeScript strict mode (no any types)
interface SkillConfig {
  enabled: boolean;
  threshold?: number;
}

// 2. Export all helper functions (for testing)
export function analyzeData(input: string): string {
  return input.toUpperCase();
}

// 3. Use MOCK mode for offline operation
const USE_MOCK = !Boolean(process.env.ANTHROPIC_API_KEY);

// 4. Create deterministic outputs in mock mode
export function generateMockResult(): string {
  const options = ['option-a', 'option-b', 'option-c'];
  return options[Math.floor(Math.random() * options.length)];
}

// 5. Log progress clearly
console.log('🚀 Starting skill...');
console.log('✅ Step 1 complete');
console.log(`📊 Result: ${result}`);

// 6. Save outputs to well-named files
const outputPath = `./MY_SKILL_OUTPUT.md`;
fs.writeFileSync(outputPath, markdown);
console.log(`✅ Output saved to: ${outputPath}`);
```

## Testing Checklist

Before submitting a PR, verify:

- [ ] `npm test` passes (if you added tests)
- [ ] `npm run typecheck` passes (no TypeScript errors)
- [ ] `npx tsx XX-Skill-Name/skill.ts` runs without errors
- [ ] Runs in MOCK mode (without API key)
- [ ] Runs in real mode (with ANTHROPIC_API_KEY set)
- [ ] Output files are generated with sensible names
- [ ] README clearly explains the skill and use cases
- [ ] All helper functions are exported and typed
- [ ] No console.error logs (only console.log)

## File Size Guidelines

Keep it small & focused:

- `skill.ts` < 400 lines (split if larger)
- `README.md` < 150 lines (be concise)
- Total folder < 500KB

## Real-World Examples

See these folders for reference:

- [01-Self-Healing-Tests](../01-Self-Healing-Tests/) — Playwright + Claude
- [02-Smart-Data-Gen](../02-Smart-Data-Gen/) — Data generation with mock fallback
- [03-Automated-Bug-Report](../03-Automated-Bug-Report/) — Log analysis
- [05-Visual-Regression](../05-Visual-Regression/) — Screenshot comparison

## Questions?

1. Check [CONTRIBUTING.md](../CONTRIBUTING.md) for contributor workflow
2. Read existing skill implementations for patterns
3. Open an issue to discuss your skill idea before implementing

---

**Ready to create? Start with this template! 🚀**
