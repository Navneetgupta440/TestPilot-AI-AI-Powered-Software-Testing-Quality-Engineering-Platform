# TestPilot AI — Product Requirements & Specifications (Phase 1)

## 1. Executive Summary
**TestPilot AI** is an AI-assisted Software Testing and Quality Engineering platform engineered for Java/Spring Boot ecosystems. It combines deterministic static code analysis (PMD, Checkstyle, SpotBugs, JaCoCo) with advanced LLM intelligence (JUnit 5, Mockito, REST Assured generation, failure auto-repair loops, and RAG context retrieval) to eliminate test coverage gaps, validate code reliability, and produce actionable quality scores.

---

## 2. User Roles & Persona Matrix

| Role | Permissions & Scope | Key Workflows |
|---|---|---|
| **ADMIN** | Full administrative rights, project deletion, global prompt template management, execution resource quotas, system observability. | Configure LLM providers, set sandbox quotas, manage team members, audit security logs. |
| **DEVELOPER** | Connect repositories, trigger AST & static analysis, generate unit and API tests, execute sandbox runs, review AI failure diagnoses. | Select methods, review test gaps, 1-click test generation, execute sandbox tests, commit generated tests. |
| **VIEWER** | Read-only access to quality dashboards, coverage heatmaps, test execution logs, and compliance reports. | Review sprint quality metrics, export executive quality reports, track coverage trends. |

---

## 3. User Stories

1. **Repository Ingestion**: *As a Developer, I want to connect my GitHub repository URL so TestPilot can automatically parse its Maven build structure, discover classes, and map REST endpoints.*
2. **Deterministic Static Analysis**: *As a QA Engineer, I want PMD, SpotBugs, and Checkstyle to analyze my codebase deterministically so I can catch potential bugs and code smells without hallucination.*
3. **Test Gap Prioritization**: *As a Developer, I want to see which methods have missing tests ranked by cyclomatic complexity and business criticality so I know where testing is most urgently needed.*
4. **Context-Aware AI Test Generation**: *As a Developer, I want an LLM to generate JUnit 5 and Mockito tests tailored to my project's conventions and DTO schemas using RAG.*
5. **Isolated Test Execution**: *As a Security Engineer, I want generated tests to be compiled and executed in an isolated sandbox with resource limits so untrusted code cannot harm host infrastructure.*
6. **Automated Failure Repair Loop**: *As a Developer, I want test execution failures to be diagnosed by the AI and automatically re-generated with fixes up to a 3-retry limit.*
7. **REST API Discovery & Testing**: *As a Backend Engineer, I want automatic discovery of Spring `@RestController` endpoints with generated REST Assured assertions for happy and negative paths.*
8. **TestPilot Quality Score**: *As an Engineering Lead, I want a composite Quality Score (0-100) combining coverage, pass rates, static findings, and complexity to gauge release readiness.*

---

## 4. Functional Requirements (FR)

- **FR-1: Repository Parsing & AST Intelligence**: Scan Java source trees, extract packages, classes, methods, visibility, annotations (`@RestController`, `@Service`, `@Repository`), parameters, return types, and dependencies.
- **FR-2: Static Code Rules Engine**: Normalize findings from PMD, Checkstyle, SpotBugs, and JaCoCo into standard `CodeFinding` records with severity levels (`BLOCKER`, `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`).
- **FR-3: Priority Gap Scoring**: Compute priority score:
  $$\text{Priority} = 0.35 \times \text{Complexity} + 0.35 \times (100 - \text{Coverage}) + 0.20 \times \text{BusinessImportance} + 0.10 \times \text{PublicVisibility}$$
- **FR-4: RAG Context Retrieval**: Retrieve matching class definitions, DTO schemas, and existing test patterns from a vector database before prompting the LLM.
- **FR-5: Structured Test Generation**: Generate JUnit 5, Mockito, and Spring Boot Test code following target project conventions with standard assertions.
- **FR-6: Compilation & Sandbox Validation**: Verify syntax, sanitize imports, and compile tests before execution.
- **FR-7: Isolated Containerized Execution**: Run `mvn test` in sandboxed Docker containers with timeout and memory constraints.
- **FR-8: Automated Failure Diagnostic & Repair**: Parse stack traces, correlate with source lines, send root-cause diagnosis to LLM, and apply iterative patches.
- **FR-9: REST API Test Suite**: Generate and execute REST Assured tests for all discovered HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
- **FR-10: Quality Scoring Engine**: Generate weighted score from 6 pillars (Coverage 30%, Static Analysis 20%, Pass Rate 20%, Complexity 10%, Security 10%, Test Quality 10%).

---

## 5. Non-Functional Requirements (NFR)

- **Performance**: AST parsing of 1,000 files in $< 5$ seconds; AI test generation turnaround $< 6$ seconds per method.
- **Security**: Zero execution of unvalidated code on host JVM; strict RBAC and JWT token management; sanitization of all prompt inputs.
- **Reliability**: Configurable retry limit ($N=3$) for AI test repair loops to prevent infinite loops.
- **Maintainability**: Modular monolith backend package structure; provider-agnostic LLM interface (`LlmProvider`).
- **Observability**: Spring Boot Actuator health endpoints, structured JSON logging, and test execution telemetry.
