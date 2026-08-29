# TestPilot AI — System Architecture Specification (Phase 1)

## 1. High-Level Modular Monolith Architecture

TestPilot AI is designed as a **modular monolith** with clear boundary isolation between domain modules, ensuring easy maintainability, high testability, and a seamless path to future microservice extraction if required.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           REACT.JS FRONTEND                             │
│  - Modern Developer Dashboard          - Code Intelligence Explorer     │
│  - Test Generation & Gap Matrix        - Sandbox Test Runner            │
│  - Failure Diagnosis & Auto-Repair     - REST Assured API Suite         │
│  - RAG Repository Assistant            - TestPilot Quality Score Radar  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST / JSON (JWT Authenticated)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       SPRING BOOT / EXPRESS API                         │
│  ┌──────────────────┬──────────────────┬─────────────────────────────┐  │
│  │  Project Manager │  GitHub Syncer   │  AST & Repository Scanner   │  │
│  ├──────────────────┼──────────────────┼─────────────────────────────┤  │
│  │  Static Analyzer │  Test Gap Engine │  API Discovery Engine       │  │
│  │ (PMD/Checkstyle/ │                  │                             │  │
│  │  SpotBugs/JaCoCo)│                  │                             │  │
│  ├──────────────────┼──────────────────┼─────────────────────────────┤  │
│  │   RAG Engine     │ LLM Abstraction  │ Quality Scoring Engine      │  │
│  │ (Vector Search)  │ (Gemini/OpenAI)  │ (Multi-Factor Radar)        │  │
│  └──────────────────┴──────────────────┴─────────────────────────────┘  │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
                    ▼                                 ▼
         ┌────────────────────┐            ┌─────────────────────┐
         │ PostgreSQL Storage │            │ Vector DB / Context │
         │ (Entities/Reports) │            │ (Code Embeddings)   │
         └────────────────────┘            └─────────────────────┘
                                                      │
                                                      ▼
                                           ┌─────────────────────┐
                                           │ Isolated Runner Env │
                                           │ (Docker Sandbox)    │
                                           │ - mvn test          │
                                           │ - JaCoCo reports    │
                                           └─────────────────────┘
```

---

## 2. Core Subsystems

### A. Repository Ingestion & AST Analysis
- **Parser**: Traverses Java source directories (`src/main/java`, `src/test/java`).
- **AST Inspector**: Extracts classes, methods, parameters, cyclomatic complexity (branches + conditional operators), and Spring stereotyping (`@RestController`, `@Service`, `@Repository`).
- **Dependency Graph**: Maps autowired fields, constructors, and related DTO classes for context assembly.

### B. Deterministic Static Code Analysis
- **Engine**: Integrates normalized rulesets from PMD, Checkstyle, SpotBugs, and JaCoCo.
- **Normalization**: Formats findings into a unified model containing rule name, severity, exact line number, and actionable remediation tips.

### C. Context-Aware RAG Engine
- **Chunking**: Splits Java files into semantic blocks (Class interfaces, Method definitions, DTO contracts, Test fixtures).
- **Metadata Indexing**: Attaches `packageName`, `className`, `methodName`, and `springRole`.
- **Targeted Retrieval**: Assembles only relevant class schemas, dependencies, and existing test patterns into prompt context.

### D. LLM Test Generation & Repair Pipeline
```text
Select Method ──► Retrieve Context ──► Generate Prompt ──► LLM Inference
                                                              │
                                                              ▼
Compile Pass ◄── Validate Syntax ◄── Structured JSON Output
      │
      ▼
Execute in Isolated Docker Sandbox ──► Parse Results (JUnit 5 XML)
      │
      ├── Passed ──► Persist Test & Update Quality Score
      │
      └── Failed ──► Auto-Diagnosis ──► Prompt Fix ──► Retry (Max 3)
```

### E. Secure Sandboxed Execution
- Isolated temporary container with strict CPU (1 core), memory (1GB), and execution timeout (30 seconds) limits.
- Read-only volume mount for repository source; writable scratch volume for test execution output.
- No network access and no host secret exposure.
