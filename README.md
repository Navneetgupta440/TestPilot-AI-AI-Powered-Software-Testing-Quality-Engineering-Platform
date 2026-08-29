# 🚀 TestPilot AI

<div align="center">
  <img src="./public/logo.svg" alt="TestPilot AI Logo" width="180" height="180" />
  
  <h3>AI-Powered Testing. Smarter Quality.</h3>
  <p>Autonomous Quality Engineering Platform for Java, Spring Boot, and Enterprise Microservices</p>

  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)](./package.json)
  [![React](https://img.shields.io/badge/React-19.0.1-61DAFB.svg?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Gemini](https://img.shields.io/badge/AI_Engine-Gemini_3.7_Flash-8E75B2.svg?style=flat-square&logo=google)](https://ai.google.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.14-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [System Pages & Workflow Modules](#-system-pages--workflow-modules)
- [Cyclomatic Complexity & Flakiness Detection](#-cyclomatic-complexity--flakiness-detection)
- [AI Autonomous Self-Repair Loop](#-ai-autonomous-self-repair-loop)
- [API Reference](#-api-reference)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Project Directory Structure](#-project-directory-structure)
- [Project Timeline & Milestones](#-project-timeline--milestones)
- [Developer Details & Contact](#-developer-details--contact)
- [License & Authors](#-license--authors)

---

## 🌟 Overview

**TestPilot AI** is an enterprise-grade, full-stack Quality Engineering and Autonomous Test Automation Platform designed specifically for Java and Spring Boot ecosystems. 

Powered by **Google Gemini 3.7 Flash** and deep Retrieval-Augmented Generation (RAG) context engines, TestPilot AI closes the gap between code authoring and rigorous test validation. It continuously parses project abstract syntax trees (AST), calculates McCabe cyclomatic complexity, pinpoints test coverage gaps, generates production-grade JUnit 5 / Mockito suites, executes test runs in sandboxed Docker-like runtime environments, detects flaky tests with oscillation telemetry, and autonomously diagnoses and patches test failures.

---

## ✨ Key Features

### 1. 🧠 Intelligent Test Suite Generation
- **Context-Aware Synthesis**: Uses AST and RAG chunking to ingest target class logic, DTO schemas, and Spring bean dependencies.
- **Multi-Framework Output**: Generates clean, ready-to-run tests across **JUnit 5**, **Mockito 5**, **AssertJ Fluent Assertions**, **Spring Boot Test** (`@SpringBootTest`, `@WebMvcTest`), and **REST Assured**.
- **Boundary & Branch Targeting**: Automatically drafts tests targeting edge conditions (null payloads, negative values, authorization barriers, exception bubbles).

### 2. 🔍 Static Code Analysis & Linting Engine
- Unified inspection combining metrics from **PMD**, **Checkstyle**, **SpotBugs**, **JaCoCo**, and the proprietary **TestPilot AST Engine**.
- Categorizes findings across *Code Smells*, *Potential Bugs*, *Security Vulnerabilities*, *Style Violations*, and *Coverage Gaps*.
- One-click AI remediation with side-by-side unified diffs.

### 3. 🌀 Cyclomatic Complexity Matrix & Hotspot Visualizer
- Calculates precise **McCabe Cyclomatic Complexity** for every class and method.
- Detailed decision point decomposition: `if/else`, loops (`for`/`while`/`do-while`), switch `case`, `catch` blocks, ternary operators, and logical operators (`&&`, `||`).
- Calculates the minimum number of independent basis path test cases needed to achieve 100% branch coverage.
- Interactive **Arbitrary Java Code Sandbox** for on-the-fly AST complexity parsing.

### 4. ⚡ Intermittent Failure & Flakiness Detector
- Tracks non-deterministic test oscillations across runs with identical source code commits.
- **Root-Cause Classification**: Automatically diagnoses *Async Race Conditions*, *System Clock Drift*, *Unseeded Random/UUID collisions*, and *Shared Static State Leaks*.
- **10-Run Historical Jitter Timeline**: Visualizes pass/fail flips and flip frequency percentages.
- **CI Quarantine Gate**: One-click test isolation to prevent intermittent tests from breaking CI/CD pipeline builds while auto-stabilizing fixes with `Awaitility` or fixed `Clock` injection.

### 5. 🛠️ Autonomous Self-Repair Loop
- Multi-iteration automated repair engine: detects failure stack traces, executes Gemini root-cause diagnosis, synthesizes patches, and verifies fixes against the execution runner.
- Configurable **Mutation Depth** (Levels 1–4: Conservative to Exhaustive).
- Tracks **Mean Time to Resolution (MTTR)** and autonomous fix success rates.

### 6. 🌐 REST API Testing & Mock Sandbox
- Discovers Spring `@RestController` request mappings and parameter schemas.
- One-click API contract test generation using Spring `MockMvc` or `REST Assured`.
- Live API playground with customizable request headers, query params, and JSON body payloads.

### 7. 🤖 Gemini AI Quality Assistant
- Conversational chat interface grounded in the active project's RAG codebase documents.
- Supports instant queries: *"Generate test cases for PaymentService"*, *"Explain this SpotBugs warning"*, or *"How can I reduce cyclomatic complexity in calculateDiscount?"*.

---

## 🏛️ Architecture & Tech Stack

```
                                  ┌─────────────────────────────┐
                                  │      Client (React 19)      │
                                  │   Tailwind CSS v4 + Motion  │
                                  └──────────────┬──────────────┘
                                                 │
                                           REST API (JSON)
                                                 │
                                  ┌──────────────▼──────────────┐
                                  │     Express API Server      │
                                  │         (Node.js)           │
                                  └───────┬──────────────┬──────┘
                                          │              │
                   ┌──────────────────────┴──────┐       │
                   │                             │       │
          ┌────────▼────────┐           ┌────────▼───────▼───────┐
          │  Google GenAI   │           │   Static Analysis &    │
          │ Gemini 3.7 Flash│           │ AST Complexity Engine  │
          └─────────────────┘           └────────────────────────┘
```

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript 5.8 |
| **Styling & Animation** | Tailwind CSS v4, Motion (Framer Motion) |
| **Icons & Visuals** | Lucide React, Custom SVG Brand System |
| **Charts & Visualizations** | Recharts (Historical Trends, Quality Gauges, Jitter Timelines) |
| **Backend & API** | Express 4.21, Node.js, `tsx` runtime |
| **Bundler & Build Tool** | Vite 6.2, esbuild |
| **AI & LLM Provider** | `@google/genai` (Gemini 3.7 Flash) |

---

## 🖥️ System Pages & Workflow Modules

1. **Dashboard (`/src/pages/DashboardPage.tsx`)**
   - High-level health score, code coverage metrics, 10-run pass rate trend chart, flakiness radar, and test suite execution status.
2. **Code Explorer (`/src/pages/CodeExplorerPage.tsx`)**
   - File tree navigation, class inspection, method signatures, spring bean role tagging, and inline test generation buttons.
3. **Static Analysis (`/src/pages/StaticAnalysisPage.tsx`)**
   - Linting and vulnerability table with filtering by severity (`BLOCKER`, `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and automated remediation.
4. **Test Generation (`/src/pages/TestGenerationPage.tsx`)**
   - Interactive prompt customizer, scenario selector, live Java syntax highlighting, and suite sync.
5. **Test Execution (`/src/pages/TestExecutionPage.tsx`)**
   - Parallel test runner interface, live execution logs terminal, duration telemetry, and failure drill-downs.
6. **Failure & Auto-Repair (`/src/pages/FailureRepairPage.tsx`)**
   - Stack trace parser, root-cause explanation, side-by-side patch viewer, and autonomous repair loop trigger.
7. **API Testing (`/src/pages/ApiTestingPage.tsx`)**
   - REST endpoint catalog, request payload editor, and HTTP contract test generator.
8. **Quality Reports (`/src/pages/QualityReportsPage.tsx`)**
   - Comprehensive letter-grade (`A+` to `F`) scorecard with customizable category weightings.
9. **AI Assistant (`/src/pages/AiAssistantPage.tsx`)**
   - Interactive chat assistant with context-aware RAG codebase retrieval.
10. **Architecture & Docs (`/src/pages/ArchitectureDocsPage.tsx`)**
    - Technical specifications, data schemas, and pipeline blueprints.
11. **Developer Profile & Settings (`/src/pages/DeveloperDetailsPage.tsx`)**
    - User preferences, mutation depth controls, assertion styles, and reasoning settings.

---

## 📊 Cyclomatic Complexity & Flakiness Detection

### Cyclomatic Complexity Formula
The platform computes McCabe Cyclomatic Complexity using:
$$V(G) = P + 1$$
Where $P$ is the total count of decision points (`if`, `for`, `while`, `case`, `catch`, `&&`, `||`, `?`, `throw`).

| Complexity $V(G)$ | Risk Category | Recommended Action |
|---|---|---|
| **1 – 4** | **Low Risk** | Simple procedure; 1–4 test cases provide full branch coverage. |
| **5 – 7** | **Moderate Risk** | Moderate logic; parameterization recommended. |
| **8 – 10** | **High Risk** | Complex logic; thorough boundary and exception testing required. |
| **11+** | **Critical Hotspot** | Unmaintainable; refactor into smaller methods and generate comprehensive suites. |

### Flakiness Telemetry Archetypes
- **Async Race Conditions**: Detected when `Thread.sleep` or uncoordinated futures are used instead of `Awaitility`.
- **Clock Drift**: Unmocked `Instant.now()` or `System.currentTimeMillis()` calls causing intermittent boundary errors.
- **Concurrency Latches**: Inadequate thread pool timeouts failing under CI CPU load.
- **Shared State**: Static state leakage across `@DirtiesContext` boundaries.

---

## 🔄 AI Autonomous Self-Repair Loop

When a test fails during execution:
1. **Stack Trace Extraction**: Captures `AssertionFailedError`, `NullPointerException`, or compilation errors.
2. **Context Enrichment**: Ingests related production code, DTOs, and test fixtures from the RAG store.
3. **Gemini 3.7 Synthesis**: Prompts the AI model with failure telemetry and mutation depth constraints.
4. **Isolated Verification**: Executes the patched test in the runner to verify deterministic green status.
5. **PR & Workspace Patching**: Updates the codebase state and updates MTTR statistics.

---

## 🔌 API Reference

### Health & System
- `GET /api/v1/health` - System component health & status check

### Projects & Repository Management
- `GET /api/v1/projects` - List all tracked repositories
- `POST /api/v1/projects` - Import a new Git repository
- `GET /api/v1/projects/:id` - Get repository metadata & metrics
- `POST /api/v1/projects/:id/analysis` - Trigger AST static analysis

### Code Intelligence & Complexity
- `GET /api/v1/projects/:id/classes` - Retrieve indexed classes and methods
- `GET /api/v1/projects/:id/endpoints` - Retrieve discovered REST API endpoints
- `GET /api/v1/projects/:id/findings` - List static analysis findings (PMD/SpotBugs/JaCoCo)
- `GET /api/v1/projects/:id/complexity` - Retrieve cyclomatic complexity breakdown
- `POST /api/v1/analysis/calculate-complexity` - Compute complexity for arbitrary Java code

### Test Generation & AI
- `POST /api/v1/projects/:id/tests/generate` - Generate JUnit 5 / Mockito tests with Gemini
- `POST /api/v1/tests/repair` - Trigger AI automated self-repair for failed test
- `POST /api/v1/ai/chat` - Chat with Gemini Quality Assistant using RAG context

### Test Execution & Flakiness
- `GET /api/v1/projects/:id/tests` - List all repository test cases
- `POST /api/v1/projects/:id/tests/run` - Execute test suite run
- `GET /api/v1/projects/:id/flakiness` - Get flakiness detector summary & flaky tests list
- `POST /api/v1/projects/:id/tests/:testId/quarantine` - Toggle test quarantine status
- `POST /api/v1/projects/:id/tests/:testId/stabilize` - AI auto-stabilize flaky test

### Quality Reports
- `GET /api/v1/projects/:id/quality-report` - Generate comprehensive quality scorecard

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **bun** / **yarn**
- **Google Gemini API Key** (optional for local mock mode; required for live AI generation)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/testpilot/testpilot-ai.git
   cd testpilot-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` to `.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will boot at **`http://localhost:3000`**.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## ⚙️ Configuration & Environment Variables

| Variable | Description | Default / Required |
|---|---|---|
| `PORT` | HTTP port for Express server and Vite proxy | `3000` (Strict platform requirement) |
| `GEMINI_API_KEY` | Google Gemini API Key for test generation & self-repair | Recommended (Fallback simulation provided) |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |

---

## 📂 Project Directory Structure

```
.
├── public/
│   └── logo.svg                 # SVG Vector logo & favicon
├── src/
│   ├── components/              # Shared UI components
│   │   ├── DashboardMetricsSummary.tsx
│   │   ├── FlakinessDetector.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TestPassTrendChart.tsx
│   │   └── TestPilotLogo.tsx
│   ├── pages/                   # Main application view pages
│   │   ├── AiAssistantPage.tsx
│   │   ├── ApiTestingPage.tsx
│   │   ├── ArchitectureDocsPage.tsx
│   │   ├── CodeExplorerPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DeveloperDetailsPage.tsx
│   │   ├── FailureRepairPage.tsx
│   │   ├── QualityReportsPage.tsx
│   │   ├── StaticAnalysisPage.tsx
│   │   ├── TestExecutionPage.tsx
│   │   └── TestGenerationPage.tsx
│   ├── types.ts                 # Global TypeScript interfaces & enums
│   ├── App.tsx                  # Root application router & state coordinator
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind CSS v4 styling rules
├── server.ts                    # Express API server with Gemini AI integration
├── metadata.json                # AI Studio application metadata
├── package.json                 # Build configuration & dependencies
├── tsconfig.json                # TypeScript compiler config
└── vite.config.ts               # Vite configuration with Tailwind CSS plugin
```

---

## 📅 Project Timeline & Milestones

**Project Working & Completion Period**: `18/08/2026 – 29/08/2026`

| Phase / Sprint | Dates | Key Objectives & Deliverables | Status |
|---|---|---|:---:|
| **Phase 1: Architecture & Static Analysis Engine** | `18/08/2026 – 20/08/2026` | • AST parsing engine setup<br>• McCabe Cyclomatic Complexity matrix calculation<br>• Integration of PMD, Checkstyle, SpotBugs, and JaCoCo analyzers<br>• Core REST API server architecture & repository indexing | ✅ Complete |
| **Phase 2: RAG Context & AI Test Generation** | `21/08/2026 – 23/08/2026` | • Google Gemini 3.7 Flash SDK integration<br>• RAG context ingestion for Java classes, DTOs, and Spring beans<br>• JUnit 5, Mockito 5, AssertJ, and Spring Boot Test synthesis<br>• Boundary and edge-case scenario prompt tuning | ✅ Complete |
| **Phase 3: Sandboxed Test Runner & API Sandbox** | `24/08/2026 – 26/08/2026` | • Sandboxed test execution runtime simulator<br>• Live test execution telemetry & duration tracking<br>• REST API endpoint discovery (`@RestController`) & contract testing<br>• Historical 10-run pass rate trend visualizers | ✅ Complete |
| **Phase 4: Flakiness Detector & Self-Repair Engine** | `27/08/2026 – 28/08/2026` | • Intermittent failure detector & oscillation frequency tracking<br>• Multi-iteration autonomous test repair loop with mutation levels (1–4)<br>• CI/CD Quarantine isolation gate for flaky tests<br>• Automated stabilization patches (`Awaitility`, deterministic Clocks) | ✅ Complete |
| **Phase 5: Brand Identity, Quality Scorecards & Release** | `29/08/2026` | • TestPilot AI vector brand design & logo integration<br>• Comprehensive quality report scorecard with category weightings<br>• Gemini Quality Assistant RAG chat system<br>• Complete technical documentation & production deployment | ✅ Complete |

---

## 👨‍💻 Developer Details & Contact

<div align="center">
  <h3>Navneet Gupta</h3>
  <p><b>Full Stack Software Engineer & AI / Machine Learning Specialist</b></p>
  <p>Greater Noida, India</p>
</div>

| Channel | Details / Link |
|---|---|
| 📧 **Email** | [indianavneetgupta33@gmail.com](mailto:indianavneetgupta33@gmail.com) |
| 💼 **LinkedIn** | [linkedin.com/in/navneet-gupta-4a1644297](https://www.linkedin.com/in/navneet-gupta-4a1644297) |
| 🐙 **GitHub** | [github.com/Navneetgupta440](https://github.com/Navneetgupta440) |
| 🌐 **Portfolio** | [portfolio-ng440.netlify.app](https://portfolio-ng440.netlify.app/) |
| 📱 **Phone** | `+91-7317567350` |

### 🛠️ Technical Proficiencies & Expertise
- **Languages**: Java, Python, TypeScript, JavaScript, SQL, C
- **Web & Backend**: React 19, Spring Boot, Node.js, Express.js, REST APIs, JWT Auth, Tailwind CSS
- **Databases**: PostgreSQL, MySQL, MongoDB, Mongoose, Database Indexing & Optimization
- **Data Science & ML**: TensorFlow, Keras, Scikit-Learn, Pandas, NumPy, OpenCV, CNNs, ETL Pipelines, Power BI
- **Tools & DevOps**: Git, GitHub Actions (CI/CD), Docker, AWS, Gemini GenAI SDK, VS Code

---

## 📄 License & Authors

Distributed under the MIT License. See `LICENSE` for more details.

**Author**: Navneet Gupta  
**Project**: TestPilot AI — Quality Engineering Platform  
**Crafted with ❤️ by Navneet Gupta and the TestPilot AI Team.**
