# 🤖 AI-Powered QA & Testing Arsenal

![AI in QA](https://img.shields.io/badge/AI_Testing-Next_Gen-6366F1?style=flat-square)
![Claude AI](https://img.shields.io/badge/Claude_AI-D97757?style=flat-square&logo=anthropic&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor_IDE-000000?style=flat-square&logo=github&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat-square&logo=Playwright&logoColor=white)

Traditional automation follows strict rules; modern automation adapts. This repository is my personal lab and toolkit for integrating **Artificial Intelligence (Claude 3.5 Sonnet, Cursor IDE, Agents)** directly into Quality Assurance and Web Automation workflows.

---

## 🎯 Purpose of this Repository

As applications grow more dynamic, static assertions and brittle locators are no longer enough. This repo demonstrates how to leverage **Claude's reasoning capabilities** and **Cursor's AI-first coding environment** to build smarter, self-maintaining, and highly analytical testing frameworks.

---

## 📂 The AI Toolkit (What's Inside?)

### 1. 🪄 Cursor IDE Mastery (`/.cursorrules`)
How I configure Cursor to be the ultimate QA copilot.
* Custom rules for writing resilient Playwright tests.
* Auto-generating Page Object Models (POM) based on HTML snippets.
* Context-aware debugging configurations.

### 2. 🧠 Claude System Prompts (`/claude-projects`)
Using Claude as a Lead QA Engineer.
* **PRD to Test Cases:** Prompts that ingest Product Requirements Documents and output exhaustive mind maps and edge-case test matrices.
* **Smart Data Generation:** Generating complex, deeply nested JSON payloads loaded with edge cases and specific personas for API testing.

### 3. 🛠️ Self-Healing Automation (`/01-Self-Healing-Tests`)
Overcoming the biggest pain point in UI testing: brittle locators.
* **Dynamic Locator Resolution:** Scripts that catch `TimeoutError` in Playwright, pass the HTML DOM context to the Claude API, and dynamically infer the new CSS/XPath selector.

### 4. 🕵️ Automated Triage & Log Analysis (`/03-Automated-Bug-Report`)
Reducing debugging time from hours to seconds.
* **AI Log Analyzer:** Consumes failed CI/CD stack traces, analyzes the root cause, and automatically drafts a detailed JIRA-ready bug report.

---

## 💻 Tech Stack & AI Models
* **Core:** TypeScript, Node.js
* **Automation:** Playwright
* **AI Tooling:** Cursor IDE, Anthropic (Claude 3.5 Sonnet) API
* **Workflow:** Prompt Engineering, Retrieval-Augmented Generation (RAG) for documentation.

> *"Automate the routine, use AI for the unpredictable."*
