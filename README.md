# 🤖 AI-Powered QA & Testing Arsenal

![AI in QA](https://img.shields.io/badge/AI_Testing-Next_Gen-6366F1?style=flat-square)
![Claude AI](https://img.shields.io/badge/Claude_AI-D97757?style=flat-square&logo=anthropic&logoColor=white)
![Cursor](https://img.shields.io/badge/Cursor_IDE-000000?style=flat-square&logo=github&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=flat-square&logo=Playwright&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

Traditional automation follows strict rules; modern automation adapts. This repository is my personal lab and toolkit for integrating **Artificial Intelligence (Claude 3.5 Sonnet, Cursor IDE, Agents)** directly into Quality Assurance and Web Automation workflows.

---

## 🎯 Purpose of this Repository

As applications grow more dynamic, static assertions and brittle locators are no longer enough. This repo demonstrates how to leverage **Claude's reasoning capabilities** and **Cursor's AI-first coding environment** to build smarter, self-maintaining, and highly analytical testing frameworks.

---

## 🛒 The AI Toolkit Marketplace 

Welcome to the AI Testing Marketplace! Browse our collection of **Agents**, **Skills**, and **Prompts** designed to supercharge your QA automation.

> Open the live HTML marketplace: [index.html](./index.html)

### 🤖 Autonomous Agents
*Agents are independent scripts that can make decisions, interact with the browser, and report findings.*

| Agent Name | Description | Status | Tags |
|:---|:---|:---:|:---|
| **[Self-Healing Locator](./01-Self-Healing-Tests)** | Catch failing Playwright locators dynamically and use the DOM to ask the LLM for a corrected selector. | 🟢 Active | `Playwright` `Claude` |
| **[Automated Triage](./03-Automated-Bug-Report)** | Ingest CI/CD stack traces and generate a Jira-ready Markdown root-cause analysis report. | 🟢 Active | `Debugging` `Jira` |
| **Visual Regression Bot** | Compare screenshots using Vision AI to detect styling anomalies and UI bugs. | 🟡 Planned | `Vision AI` `UI/UX` |

### 🛠️ Testing Skills & Data Generators
*Skills are utility functions and generators that plug into your existing frameworks.*

| Skill Name | Description | Status | Tags |
|:---|:---|:---:|:---|
| **[Edge-Case Data Gen](./02-Smart-Data-Gen)** | Generate extreme, complex, and malicious JSON payloads for API fuzzing. | 🟢 Active | `API` `Data Fuzzing` |
| **Dynamic API Mocker** | Read an OpenAPI spec and generate a live mock server with intelligent responses. | 🟡 Planned | `Backend` `Mocking` |

### 🧠 Prompt Library & IDE Mastery
*Curated system prompts to paste into Claude, ChatGPT, or Cursor IDE.*

| Item | Description | Link |
|:---|:---|:---|
| **Cursor Mastery** | Custom `.cursorrules` to make Cursor IDE the ultimate QA copilot (POM generation, etc). | *(Need Contributor)* |
| **The "Hacker" QA** | System prompt to break forms with SQLi, XSS, and boundary-pushing payloads. | **[View Prompt](./02-Smart-Data-Gen/prompts)** |
| **PRD to Test Matrix** | Convert a Product Requirement Doc into a full test plan and mind map. | *(Need Contributor)* |

---

## 💻 Tech Stack & AI Models
* **Core:** TypeScript, Node.js
* **Automation:** Playwright
* **AI Tooling:** Cursor IDE, Anthropic (Claude 3.5 Sonnet) API
* **Workflow:** Prompt Engineering, Retrieval-Augmented Generation (RAG) for documentation.

---

## 🤝 Contributing: Let's Build the Future of QA Together!

The QA landscape is shifting fast, and AI is at the forefront. While I built this as a personal lab, I want it to be a **community-driven hub** for testing professionals who want to push the boundaries of what's possible.

Your knowledge is valuable! Here is how you can contribute:
* **📝 Share Prompts:** Got a killer system prompt for Claude/ChatGPT that generates perfect POMs or API tests? Open a PR!
* **⚙️ Cursor Rules:** Found the ultimate `.cursorrules` configuration for Playwright or Cypress? Share it with the community.
* **🚀 New AI Scripts:** Built a PoC for visual regression using Vision models? Or an agent that explores websites? We want it.
* **🐛 Improvements:** See a way to make the self-healing scripts faster, cheaper, or more accurate? Let's optimize it.

### How to contribute:
1. **Fork** the repository.
2. **Create a new branch** (`git checkout -b feature/amazing-ai-qa-tool`).
3. **Commit your changes** (`git commit -m 'Add awesome Claude prompt for API testing'`).
4. **Push to the branch** (`git push origin feature/amazing-ai-qa-tool`).
5. **Open a Pull Request** and let's discuss it!

> *"Automate the routine, use AI for the unpredictable."*
