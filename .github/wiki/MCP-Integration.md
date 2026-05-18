# MCP Integration

## "Add to Claude" Button

Every agent and skill card in the marketplace has an **"🤖 Add to Claude"** button. Clicking it copies a complete tool payload to your clipboard, ready to paste into Claude Desktop or the Anthropic API.

### Payload Format

```json
{
  "name": "Self-Healing Locator",
  "description": "Suggests a new Playwright locator when the current one fails.",
  "system_prompt": "You are a senior Playwright automation engineer...",
  "tool_schema": {
    "name": "self_healing_locator",
    "description": "Suggests a new Playwright locator when the current one fails.",
    "input_schema": {
      "type": "object",
      "properties": {
        "failed_locator": {
          "type": "string",
          "description": "The locator that failed"
        },
        "dom_snapshot": {
          "type": "string",
          "description": "Stripped DOM context around the target element"
        }
      },
      "required": ["failed_locator", "dom_snapshot"]
    }
  },
  "run_command": "npx tsx src/agents/self-healing.ts"
}
```

---

## Using with Claude Desktop

1. Open **Claude Desktop** → Settings → Tools
2. Paste the copied JSON into the tools array
3. Claude will now have the agent available as a native tool

---

## Using with the Anthropic API

Pass the `tool_schema` directly into the `tools` parameter:

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  tools: [
    {
      name: 'self_healing_locator',
      description: 'Suggests a new Playwright locator when the current one fails.',
      input_schema: {
        type: 'object',
        properties: {
          failed_locator: { type: 'string' },
          dom_snapshot: { type: 'string' },
        },
        required: ['failed_locator', 'dom_snapshot'],
      },
    },
  ],
  messages: [
    {
      role: 'user',
      content: 'My locator getByText("Submit") broke. Here is the DOM: ...',
    },
  ],
})
```

---

## Native MCP Server (Roadmap)

We are building a native **Model Context Protocol (MCP) server** that will register every agent and skill as a first-class Claude tool — no copy-paste needed.

```bash
# Coming soon:
npx open-qa mcp-server --port 3001
```

Then add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "open-qa": {
      "command": "npx",
      "args": ["open-qa", "mcp-server"]
    }
  }
}
```

Once connected, all agents, skills, and prompts appear natively inside Claude Desktop.
