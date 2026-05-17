# 🛒 AI Testing Toolkit Marketplace

Welcome to the AI Testing Marketplace! Browse our collection of **Agents**, **Skills**, and **Prompts** designed to supercharge your QA automation. 

Click on any module to view its documentation and source code.

## 🤖 Autonomous Agents
*Agents are independent scripts that can make decisions, interact with the browser, and report findings.*

| Agent Name | Description | Status | Tags |
|:---|:---|:---:|:---|
| **[Self-Healing Locator](./01-Self-Healing-Tests)** | Dynamically catches failing Playwright locators and uses the DOM to ask the LLM for a corrected selector. | 🟢 Active | `Playwright` `Claude` `Resilience` |
| **[Automated Triage](./03-Automated-Bug-Report)** | Ingests CI/CD stack traces and generates a Jira-ready Markdown root-cause analysis report. | 🟢 Active | `Debugging` `Jira` `Logs` |
| **Visual Regression Bot** | *(Coming Soon)* Compares screenshots using Vision AI to detect styling anomalies. | 🟡 Planned | `Vision` `UI/UX` |

## 🛠️ Testing Skills & Data Generators
*Skills are utility functions and generators that plug into your existing frameworks.*

| Skill Name | Description | Status | Tags |
|:---|:---|:---:|:---|
| **[Edge-Case Data Gen](./02-Smart-Data-Gen)** | Generates extreme, complex, and malicious JSON payloads for API fuzzing. | 🟢 Active | `API` `Data` `Fuzzing` |
| **Dynamic API Mocker** | *(Coming Soon)* AI reads an OpenAPI spec and generates a live Express mock server with intelligent responses. | 🟡 Planned | `Backend` `Mocking` |

## 🧠 Prompt Library (Copy & Paste)
*Curated system prompts to paste into Claude, ChatGPT, or Cursor IDE.*

| Prompt / Persona | Use Case | Link |
|:---|:---|:---|
| **The "Hacker" QA** | Break forms with SQLi, XSS, and boundary-pushing payloads. | [View Prompt](./02-Smart-Data-Gen/prompts) |
| **PRD to Test Matrix** | Convert a Product Requirement Doc into a full test plan. | *(Need Contributor)* |
| **Cursor Rules** | Make your Cursor IDE a Playwright master. | *(Need Contributor)* |

---
💡 **Want to add your own Agent or Prompt?** Check out our [Issues tab](https://github.com/MyNameIsEdi/intelligent-testing-toolkit/issues) and submit a PR!
