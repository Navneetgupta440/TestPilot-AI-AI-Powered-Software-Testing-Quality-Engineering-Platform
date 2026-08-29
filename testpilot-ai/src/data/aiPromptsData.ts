export type PromptCategory =
  | 'Unit Testing'
  | 'Security & Vulnerability'
  | 'Mocking & Stubs'
  | 'REST API & Integration'
  | 'Performance & Concurrency'
  | 'Mutation & Boundary'
  | 'Spring Boot & Testcontainers'
  | 'Failure Diagnosis & Repair'
  | 'Clean Code & Refactoring'
  | 'CI/CD & Quality Gates';

export interface AiPrompt {
  id: string;
  title: string;
  category: PromptCategory;
  prompt: string;
  description: string;
  tags: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  frameworks?: string[];
}

export const AI_SUGGESTED_PROMPTS: AiPrompt[] = [
  // 1. UNIT TESTING & JUNIT 5
  {
    id: 'p-unit-01',
    title: 'High-Complexity Method Boundary Matrix',
    category: 'Unit Testing',
    prompt:
      'Analyze methods with Cyclomatic Complexity > 4. Generate a comprehensive JUnit 5 parameterized test matrix (@ParameterizedTest with @CsvSource) covering valid, boundary (min/max), zero, and null edge cases with AssertJ fluent assertions.',
    description: 'Generates tabular parameterized tests targeting branch decision points and extreme numeric/string boundaries.',
    tags: ['JUnit 5', 'Parameterized', 'AssertJ', 'Boundary Testing'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5', 'AssertJ'],
  },
  {
    id: 'p-unit-02',
    title: 'Custom Exception & Error Path Verification',
    category: 'Unit Testing',
    prompt:
      'Scan the codebase for all throw new custom exceptions (e.g., PaymentException, ResourceNotFoundException). Write isolated JUnit 5 unit tests verifying assertThatThrownBy(...) with exact message templates, cause validation, and HTTP status mappings.',
    description: 'Verifies negative execution paths, error payloads, and exception hierarchy handling.',
    tags: ['Exceptions', 'JUnit 5', 'Negative Testing'],
    complexity: 'Beginner',
    frameworks: ['JUnit 5', 'AssertJ'],
  },
  {
    id: 'p-unit-03',
    title: 'Java 17 Records & Immutable DTO Serialization Tests',
    category: 'Unit Testing',
    prompt:
      'Write exhaustive unit tests for all Java Record DTOs and immutable domain objects, validating canonical constructors, compact validation rules, equals(), hashCode(), toString(), and Jackson @JsonProperty serializability.',
    description: 'Ensures immutability contracts, compact validation triggers, and JSON parsing stability for records.',
    tags: ['Java 17', 'Records', 'Jackson', 'Serialization'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5', 'Jackson'],
  },
  {
    id: 'p-unit-04',
    title: 'Nested BDD-Style Hierarchy with @Nested & @DisplayName',
    category: 'Unit Testing',
    prompt:
      'Refactor the existing test suite into clean BDD style using JUnit 5 @Nested classes grouped by method context (e.g., "when input is valid", "when downstream service fails") with descriptive @DisplayName annotations following Given-When-Then.',
    description: 'Improves test readability and living documentation with hierarchical nested contexts.',
    tags: ['BDD', 'Clean Code', '@Nested', 'JUnit 5'],
    complexity: 'Beginner',
    frameworks: ['JUnit 5'],
  },
  {
    id: 'p-unit-05',
    title: 'Dynamic Test Generation with @TestFactory & Stream',
    category: 'Unit Testing',
    prompt:
      'Create dynamic JUnit 5 tests using @TestFactory returning Stream<DynamicNode> or DynamicTest to evaluate combinatorial matrix permutations for user permission validation and role-based access rules.',
    description: 'Constructs runtime dynamic test graphs for complex multi-dimensional rule matrices.',
    tags: ['DynamicTest', 'Permutations', 'RBAC'],
    complexity: 'Advanced',
    frameworks: ['JUnit 5'],
  },
  {
    id: 'p-unit-06',
    title: 'Null Safety & Optional<T> Branch Coverage',
    category: 'Unit Testing',
    prompt:
      'Audit all service methods returning Optional<T>. Generate rigorous unit tests for Optional.empty() vs. Optional.of(), ensuring no NoSuchElementException is thrown and map/flatMap/orElseThrow chains execute properly.',
    description: 'Guarantees zero null-pointer leaks and 100% branch coverage across optional functional pipelines.',
    tags: ['Optional', 'Null Safety', 'Functional'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5', 'AssertJ'],
  },

  // 2. SECURITY & VULNERABILITY
  {
    id: 'p-sec-01',
    title: 'SQL Injection & JPQL Dynamic Query Fuzzing',
    category: 'Security & Vulnerability',
    prompt:
      'Audit all repository queries, EntityManager operations, and custom CriteriaBuilder filters for SQL injection risks. Synthesize attack vector tests passing malicious inputs (\' OR \'1\'=\'1, stacked queries, unicode escapes) to verify parameter sanitization.',
    description: 'Generates security fuzz tests to verify automated query parameter binding and prevent SQLi.',
    tags: ['Security', 'SQLi', 'OWASP Top 10', 'JPA'],
    complexity: 'Advanced',
    frameworks: ['JUnit 5', 'Spring Security'],
  },
  {
    id: 'p-sec-02',
    title: 'JWT Token Expiration, Tampering & Replay Attacks',
    category: 'Security & Vulnerability',
    prompt:
      'Generate security unit and slice tests for JWT Authentication Filter. Test expired tokens, manipulated signatures, algorithm switching attacks (none alg), missing bearer prefixes, and replay attack timestamp validations.',
    description: 'Simulates cryptographic token tampering and claims verification vulnerabilities.',
    tags: ['JWT', 'Authentication', 'Security', 'Spring Security'],
    complexity: 'Expert',
    frameworks: ['Spring Security', 'JUnit 5'],
  },
  {
    id: 'p-sec-03',
    title: 'Cross-Site Scripting (XSS) Payload Sanitization',
    category: 'Security & Vulnerability',
    prompt:
      'Generate REST API integration tests injecting known XSS vectors (<script>alert(1)</script>, SVG onerror, javascript: URIs) into request bodies. Verify proper HTML escaping and content-security headers on responses.',
    description: 'Checks input sanitizers, Jackson string deserializers, and output encoding filters.',
    tags: ['XSS', 'Sanitization', 'OWASP'],
    complexity: 'Intermediate',
    frameworks: ['REST Assured', 'Spring Boot Test'],
  },
  {
    id: 'p-sec-04',
    title: 'Mass Assignment & DTO Over-Posting Defense',
    category: 'Security & Vulnerability',
    prompt:
      'Inspect controller DTO mappings. Write integration tests attempting to submit restricted fields (e.g., isAdmin, balance, internalRole, accountStatus) during standard user creation to ensure they cannot be over-posted.',
    description: 'Protects entity state integrity against mass assignment vulnerabilities in API contracts.',
    tags: ['Mass Assignment', 'DTO', 'Security', 'Spring MVC'],
    complexity: 'Intermediate',
    frameworks: ['MockMvc', 'JUnit 5'],
  },
  {
    id: 'p-sec-05',
    title: 'Rate Limiting & Denial of Service (DoS) Thresholds',
    category: 'Security & Vulnerability',
    prompt:
      'Generate concurrent stress tests against sensitive endpoints (login, forgot password, checkout) asserting HTTP 429 Too Many Requests response after exceeding rate limit bucket quotas.',
    description: 'Validates Bucket4j / Redis token bucket rate limiters under burst traffic.',
    tags: ['Rate Limiting', 'DoS', 'Security', 'Concurrency'],
    complexity: 'Advanced',
    frameworks: ['REST Assured', 'JUnit 5'],
  },
  {
    id: 'p-sec-06',
    title: 'CORS & Security Header Compliance Audit',
    category: 'Security & Vulnerability',
    prompt:
      'Write WebMvcTest cases checking that all HTTP responses enforce HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Content-Security-Policy, and strict CORS AllowedOrigins validation.',
    description: 'Audits defensive HTTP response headers against OWASP security guidance.',
    tags: ['CORS', 'Security Headers', 'HSTS', 'OWASP'],
    complexity: 'Beginner',
    frameworks: ['MockMvc', 'JUnit 5'],
  },

  // 3. MOCKING & STUBS
  {
    id: 'p-mock-01',
    title: 'Strict Mockito 5 Verification & Zero Unused Stubs',
    category: 'Mocking & Stubs',
    prompt:
      'Refactor test class mocks with Mockito 5 @ExtendWith(MockitoExtension.class) in StrictMode.LENIENT/STRICT_STUBS. Verify no redundant stubbings exist and verifyNoMoreInteractions() on all dependency mocks.',
    description: 'Enforces strict mock hygiene, eliminates unnecessary stubbings, and detects zombie mocks.',
    tags: ['Mockito 5', 'StrictStubs', 'Refactoring'],
    complexity: 'Intermediate',
    frameworks: ['Mockito 5', 'JUnit 5'],
  },
  {
    id: 'p-mock-02',
    title: 'Deep ArgumentCaptor & Complex Payload Validation',
    category: 'Mocking & Stubs',
    prompt:
      'Write Mockito tests using @Captor ArgumentCaptor<T> to capture complex objects passed into external third-party clients. Assert all internal fields, timestamps, and generated UUIDs match expected business invariants.',
    description: 'Inspects intermediate method arguments without altering private state.',
    tags: ['ArgumentCaptor', 'Mockito 5', 'Invariants'],
    complexity: 'Intermediate',
    frameworks: ['Mockito 5', 'AssertJ'],
  },
  {
    id: 'p-mock-03',
    title: 'Simulating Downstream Microservice Latency & Timeouts',
    category: 'Mocking & Stubs',
    prompt:
      'Generate tests stubbing external HTTP/gRPC clients with doAnswer() or WireMock delays to simulate 5000ms network timeouts, connection resets, and verify fallback CircuitBreaker (Resilience4j) execution.',
    description: 'Tests resilience, fallback degradation, and fault tolerance when dependencies stall.',
    tags: ['Resilience4j', 'CircuitBreaker', 'Timeouts', 'WireMock'],
    complexity: 'Advanced',
    frameworks: ['Mockito 5', 'WireMock', 'Resilience4j'],
  },
  {
    id: 'p-mock-04',
    title: 'Spying Partial Implementations & Void Method Callbacks',
    category: 'Mocking & Stubs',
    prompt:
      'Demonstrate best practices for Mockito spy() on legacy service classes, overriding only specific external methods while executing real internal business logic and asserting void method side effects.',
    description: 'Safe partial mocking for legacy code without refactoring the whole architecture.',
    tags: ['Spy', 'Partial Mocking', 'Legacy Code'],
    complexity: 'Intermediate',
    frameworks: ['Mockito 5'],
  },
  {
    id: 'p-mock-05',
    title: 'Static Method Mocking with mockStatic in Mockito 5',
    category: 'Mocking & Stubs',
    prompt:
      'Write tests leveraging Mockito.mockStatic(Instant.class) / LocalDateTime.class / UUID.class inside try-with-resources blocks to deterministically freeze system clocks and predictable random generators.',
    description: 'Freezes time-dependent calculations and deterministic crypto randoms in tests.',
    tags: ['mockStatic', 'Time Freezing', 'Mockito 5'],
    complexity: 'Advanced',
    frameworks: ['Mockito 5'],
  },
  {
    id: 'p-mock-06',
    title: 'Async CompletableFuture & Reactive Mono/Flux Mocking',
    category: 'Mocking & Stubs',
    prompt:
      'Generate unit tests for asynchronous service methods returning CompletableFuture<T> or Project Reactor Mono<T>/Flux<T>. Use StepVerifier and AssertJ CompletableFuture assertions for non-blocking stream testing.',
    description: 'Validates non-blocking reactive pipelines and async event emission.',
    tags: ['Reactive', 'Project Reactor', 'StepVerifier', 'Async'],
    complexity: 'Advanced',
    frameworks: ['Reactor Test', 'AssertJ', 'JUnit 5'],
  },

  // 4. REST API & INTEGRATION
  {
    id: 'p-api-01',
    title: 'End-to-End REST Assured Contract & Schema Validation',
    category: 'REST API & Integration',
    prompt:
      'Write end-to-end REST Assured tests for all endpoints in the controller. Validate JSON Schema compliance against OpenAPI spec, HTTP status codes, JSONPath field values, and response time < 500ms.',
    description: 'Validates API contract schemas, response structures, and performance budgets in one run.',
    tags: ['REST Assured', 'JSON Schema', 'OpenAPI', 'E2E'],
    complexity: 'Intermediate',
    frameworks: ['REST Assured', 'JUnit 5'],
  },
  {
    id: 'p-api-02',
    title: 'Idempotency & Duplicate Request Safety (POST / PUT)',
    category: 'REST API & Integration',
    prompt:
      'Generate integration tests for transaction processing and payment endpoints with Idempotency-Key headers. Send identical requests concurrently and verify only 1 side effect occurs while returning identical cached responses.',
    description: 'Ensures payment transactions and state-mutating APIs cannot be charged twice.',
    tags: ['Idempotency', 'Payments', 'API Design', 'Transactions'],
    complexity: 'Advanced',
    frameworks: ['REST Assured', 'Spring Boot Test'],
  },
  {
    id: 'p-api-03',
    title: 'Pagination, Sorting & Large Result Sets (@Pageable)',
    category: 'REST API & Integration',
    prompt:
      'Write tests for paginated GET endpoints validating page numbers, pageSize limits (preventing negative or 10,000+ DOS sizes), sort field whitelists, totalPages calculation, and cursor-based navigation.',
    description: 'Tests edge cases for pagination parameters, out-of-range pages, and sort stability.',
    tags: ['Pagination', 'Pageable', 'Spring Data', 'REST'],
    complexity: 'Beginner',
    frameworks: ['MockMvc', 'JUnit 5'],
  },
  {
    id: 'p-api-04',
    title: 'Multipart File Upload & MIME Type Validation',
    category: 'REST API & Integration',
    prompt:
      'Write MockMvc multipart upload tests for file upload endpoints. Test oversized files exceeding max-file-size, spoofed file extensions (.exe renamed to .png), corrupt binary streams, and empty file payloads.',
    description: 'Secures file upload endpoints against malware extension spoofing and buffer overruns.',
    tags: ['Multipart', 'FileUpload', 'MIME Validation', 'MockMvc'],
    complexity: 'Intermediate',
    frameworks: ['MockMvc', 'JUnit 5'],
  },
  {
    id: 'p-api-05',
    title: 'HTTP Content Negotiation & Internationalization (i18n)',
    category: 'REST API & Integration',
    prompt:
      'Generate tests for localized endpoints asserting Accept-Language headers (en, es, fr, hi, de) return translated error messages and format dates/currencies according to locale.',
    description: 'Tests internationalization headers, localized error bundles, and currency formatters.',
    tags: ['i18n', 'Content Negotiation', 'Localization'],
    complexity: 'Beginner',
    frameworks: ['MockMvc', 'JUnit 5'],
  },
  {
    id: 'p-api-06',
    title: 'OpenAPI 3 / Swagger Documentation Sync Verification',
    category: 'REST API & Integration',
    prompt:
      'Write an automated test comparing the runtime /v3/api-docs output against documented Controller annotations, ensuring no undocumented endpoints or missing parameter descriptions exist.',
    description: 'Prevents documentation drift by validating live runtime OpenAPI specs.',
    tags: ['OpenAPI 3', 'Swagger', 'Contract Testing'],
    complexity: 'Intermediate',
    frameworks: ['Springdoc', 'JUnit 5'],
  },

  // 5. PERFORMANCE & CONCURRENCY
  {
    id: 'p-perf-01',
    title: 'Multi-Threaded Race Condition Detection with CountDownLatch',
    category: 'Performance & Concurrency',
    prompt:
      'Write a concurrency test using ExecutorService and CountDownLatch with 50 simultaneous threads accessing shared state (e.g., inventory deduction, account balance). Assert thread safety and zero lost updates.',
    description: 'Exposes synchronization bugs, deadlocks, and atomicity violations under load.',
    tags: ['Concurrency', 'CountDownLatch', 'Thread Safety', 'Race Conditions'],
    complexity: 'Expert',
    frameworks: ['JUnit 5', 'Java Concurrency'],
  },
  {
    id: 'p-perf-02',
    title: 'JMH (Java Microbenchmark Harness) Throughput Benchmark',
    category: 'Performance & Concurrency',
    prompt:
      'Generate a JMH benchmark suite comparing execution throughput (ops/sec) and memory allocations between alternative algorithms (e.g., Streams vs. for loops, Jackson vs. Protobuf serialization).',
    description: 'Measures nano-second level performance bottlenecks and GC allocation pressure.',
    tags: ['JMH', 'Benchmarks', 'Performance', 'Optimization'],
    complexity: 'Expert',
    frameworks: ['JMH', 'Java 17'],
  },
  {
    id: 'p-perf-03',
    title: 'JPA N+1 Query Detection with Hypersistence Utilities',
    category: 'Performance & Concurrency',
    prompt:
      'Write an integration test utilizing hibernate query statement inspector / count assertions to verify that fetching collections does not trigger N+1 SQL queries, ensuring JOIN FETCH is active.',
    description: 'Prevents catastrophic database load caused by lazy loading loops in ORM queries.',
    tags: ['JPA', 'N+1', 'Hibernate', 'Database Performance'],
    complexity: 'Advanced',
    frameworks: ['Hypersistence Utils', 'Spring Data JPA'],
  },
  {
    id: 'p-perf-04',
    title: 'Memory Leak & Resource Leak Detection (AutoCloseable)',
    category: 'Performance & Concurrency',
    prompt:
      'Audit all FileInputStream, Connection, and Socket instances. Write tests verifying try-with-resources blocks properly release handles even when OutOfMemoryError or runtime exceptions occur.',
    description: 'Guarantees OS handles, file descriptors, and database connections close cleanly.',
    tags: ['Memory Leak', 'AutoCloseable', 'Resource Management'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5'],
  },
  {
    id: 'p-perf-05',
    title: 'Database Connection Pool Exhaustion Simulation',
    category: 'Performance & Concurrency',
    prompt:
      'Simulate HikariCP connection pool starvation by holding maximum pool connections in background threads, asserting timeout exceptions are handled gracefully without application crash.',
    description: 'Validates connection timeout thresholds and pool configuration under traffic spikes.',
    tags: ['HikariCP', 'Connection Pool', 'Resilience'],
    complexity: 'Advanced',
    frameworks: ['HikariCP', 'Spring Boot'],
  },

  // 6. MUTATION & BOUNDARY
  {
    id: 'p-mut-01',
    title: 'PITest Mutation Score Maximization & Mutant Killing',
    category: 'Mutation & Boundary',
    prompt:
      'Analyze PITest mutation report. Identify survived mutants (negated conditionals, replaced return values, modified boundary increments). Generate targeted assertions specifically crafted to kill every surviving mutant.',
    description: 'Elevates mutation score > 90% by verifying exact logical thresholds rather than loose coverage.',
    tags: ['PITest', 'Mutation Testing', 'Code Quality'],
    complexity: 'Expert',
    frameworks: ['PITest', 'JUnit 5'],
  },
  {
    id: 'p-mut-02',
    title: 'Off-By-One Boundary Value Analysis (< vs <=)',
    category: 'Mutation & Boundary',
    prompt:
      'Identify all conditional operators (<, <=, >, >=, ==). Generate test cases specifically testing values at boundary - 1, boundary, and boundary + 1 to eliminate off-by-one errors in discount and tier rules.',
    description: 'Catches classic fence-post and edge off-by-one algorithmic bugs.',
    tags: ['Boundary Analysis', 'Edge Cases', 'JUnit 5'],
    complexity: 'Beginner',
    frameworks: ['JUnit 5', 'AssertJ'],
  },
  {
    id: 'p-mut-03',
    title: 'String Encoding, Unicode & Emoji Boundary Testing',
    category: 'Mutation & Boundary',
    prompt:
      'Generate tests passing zero-width spaces, RTL characters, multi-byte UTF-8 emojis (🚀👨‍👩‍👧‍👦), 10,000+ character strings, and trailing whitespace to text parsing and database storage methods.',
    description: 'Ensures unicode compliance and prevents truncation or charset corruption.',
    tags: ['Unicode', 'UTF-8', 'String Parsing', 'Sanitization'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5'],
  },
  {
    id: 'p-mut-04',
    title: 'BigDecimal Precision & Currency Rounding Mode Tests',
    category: 'Mutation & Boundary',
    prompt:
      'Audit monetary calculations. Write tests checking RoundingMode.HALF_EVEN (Banker\'s rounding), fractional pennies ($0.001), zero amounts, negative refunds, and overflow limits with BigDecimal assertions.',
    description: 'Protects financial accounting from precision loss and float arithmetic hazards.',
    tags: ['BigDecimal', 'Currency', 'Financial', 'Math'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5', 'AssertJ'],
  },
  {
    id: 'p-mut-05',
    title: 'Leap Years, Timezones & Daylight Savings Time Boundaries',
    category: 'Mutation & Boundary',
    prompt:
      'Write tests for date/time calculation methods using Clock.fixed() targeting February 29 leap years, UTC epoch 0, Daylight Savings transitions (spring forward / fall back), and cross-midnight recurring jobs.',
    description: 'Eliminates timezone and DST calendar calculation crashes in scheduling logic.',
    tags: ['Timezone', 'Leap Year', 'Java Time API', 'Clock'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5'],
  },
  {
    id: 'p-mut-06',
    title: 'Empty, Singleton & Massive Collection Boundary Tests',
    category: 'Mutation & Boundary',
    prompt:
      'Test collection processing methods with Collections.emptyList(), single-element list, 10,000 items, and unmodifiable lists to verify immutability, stream chunking, and array allocation logic.',
    description: 'Verifies algorithmic scaling across empty, single-element, and bulk collections.',
    tags: ['Collections', 'Data Structures', 'Scaling'],
    complexity: 'Beginner',
    frameworks: ['JUnit 5', 'AssertJ'],
  },

  // 7. SPRING BOOT & TESTCONTAINERS
  {
    id: 'p-boot-01',
    title: 'Testcontainers PostgreSQL & Flyway Migration Test',
    category: 'Spring Boot & Testcontainers',
    prompt:
      'Configure a real PostgreSQL Testcontainers instance using @Testcontainers and DynamicPropertySource. Run all Flyway/Liquibase DB migrations and verify repository schema integrity in isolated Docker container.',
    description: 'Replaces in-memory H2 with production-identical PostgreSQL database containers.',
    tags: ['Testcontainers', 'PostgreSQL', 'Docker', 'Flyway'],
    complexity: 'Advanced',
    frameworks: ['Testcontainers', 'Spring Boot Test'],
  },
  {
    id: 'p-boot-02',
    title: 'Sliced @WebMvcTest with MockBean for Fast Feedback',
    category: 'Spring Boot & Testcontainers',
    prompt:
      'Write lightweight sliced @WebMvcTest focusing only on web layer controller logic, injecting @MockBean for all service dependencies, avoiding full Spring context startup time.',
    description: 'Accelerates test execution by booting only Spring MVC infrastructure in sub-seconds.',
    tags: ['@WebMvcTest', 'Sliced Tests', 'Fast Feedback', 'MockBean'],
    complexity: 'Intermediate',
    frameworks: ['Spring Boot Test', 'MockMvc'],
  },
  {
    id: 'p-boot-03',
    title: '@DataJpaTest Slicing with Custom Auditing & Soft Deletes',
    category: 'Spring Boot & Testcontainers',
    prompt:
      'Write isolated @DataJpaTest verifying @CreatedDate, @LastModifiedBy auditing, entity lifecycle hooks (@PrePersist), and @SQLRestriction / Hibernate soft delete filtering.',
    description: 'Verifies JPA entity lifecycle hooks and custom SQL filters without starting web server.',
    tags: ['@DataJpaTest', 'JPA', 'Auditing', 'Soft Delete'],
    complexity: 'Intermediate',
    frameworks: ['Spring Boot Test', 'Spring Data JPA'],
  },
  {
    id: 'p-boot-04',
    title: 'Kafka & Redis Testcontainers Event-Driven Integration',
    category: 'Spring Boot & Testcontainers',
    prompt:
      'Write an end-to-end event-driven test using Testcontainers Kafka & Redis modules. Publish messages to topics, assert consumer listener processing with Awaitility, and verify Redis cache invalidation.',
    description: 'Validates asynchronous pub/sub messaging and distributed caching with real Docker containers.',
    tags: ['Kafka', 'Redis', 'Testcontainers', 'Awaitility'],
    complexity: 'Expert',
    frameworks: ['Testcontainers', 'Kafka', 'Awaitility'],
  },
  {
    id: 'p-boot-05',
    title: 'ArchUnit Architectural Fitness & Dependency Rule Tests',
    category: 'Spring Boot & Testcontainers',
    prompt:
      'Implement ArchUnit rules verifying architecture standards: Controllers must not call Repositories directly, Service classes must reside in service packages, and no circular package dependencies exist.',
    description: 'Enforces architectural rules in unit test runs to prevent spaghetti code degradation.',
    tags: ['ArchUnit', 'Architecture', 'Clean Architecture'],
    complexity: 'Advanced',
    frameworks: ['ArchUnit', 'JUnit 5'],
  },

  // 8. FAILURE DIAGNOSIS & REPAIR
  {
    id: 'p-rep-01',
    title: 'Stack Trace Root-Cause Synthesis & Patch Generation',
    category: 'Failure Diagnosis & Repair',
    prompt:
      'Analyze the provided failed JUnit assertion and stack trace. Identify the exact root cause in either the test fixture or business logic, and generate a minimal surgical patch with explanation.',
    description: 'Pinpoints stack trace origin and outputs direct drop-in code fix.',
    tags: ['Failure Repair', 'Root Cause', 'Stack Trace', 'Auto-Repair'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5', 'AssertJ'],
  },
  {
    id: 'p-rep-02',
    title: 'Flaky Test Diagnosis & Non-Deterministic Thread Fix',
    category: 'Failure Diagnosis & Repair',
    prompt:
      'Audit this flaky test that fails intermittently in CI. Identify non-deterministic root causes (shared static state, Thread.sleep timing assumptions, hash map ordering) and replace with Awaitility polling.',
    description: 'Cures intermittent CI pipeline failures and replaces fragile sleeps with condition polling.',
    tags: ['Flaky Tests', 'Awaitility', 'CI/CD', 'Deterministic'],
    complexity: 'Advanced',
    frameworks: ['Awaitility', 'JUnit 5'],
  },
  {
    id: 'p-rep-03',
    title: 'Mockito Strictness & UnnecessaryStubbingException Fixer',
    category: 'Failure Diagnosis & Repair',
    prompt:
      'Fix UnnecessaryStubbingException errors in the test suite by pruning unused when(...) declarations or migrating to specific argument matchers without weakening test assertions.',
    description: 'Fixes strict Mockito 5 exceptions caused by unused mock stubs.',
    tags: ['Mockito 5', 'UnnecessaryStubbing', 'Debugging'],
    complexity: 'Beginner',
    frameworks: ['Mockito 5'],
  },
  {
    id: 'p-rep-04',
    title: 'Database Schema Drift & Entity Mapping Mismatch Repair',
    category: 'Failure Diagnosis & Repair',
    prompt:
      'Diagnose DataIntegrityViolationException or SchemaValidationException in integration tests. Identify mismatched column names, nullable constraints, or missing foreign keys and update JPA annotations.',
    description: 'Repairs mismatches between DB migrations and JPA @Entity class definitions.',
    tags: ['Schema Drift', 'JPA', 'Database', 'Auto-Repair'],
    complexity: 'Intermediate',
    frameworks: ['Hibernate', 'JPA'],
  },
  {
    id: 'p-rep-05',
    title: 'Circular Dependency & BeanCreationException Resolver',
    category: 'Failure Diagnosis & Repair',
    prompt:
      'Analyze Spring Boot BeanCurrentlyInCreationException. Refactor circular constructor injections using domain events, facade classes, or @Lazy injection while maintaining clean architecture.',
    description: 'Eliminates circular Spring Bean dependencies gracefully.',
    tags: ['Spring Boot', 'Circular Dependency', 'Refactoring'],
    complexity: 'Advanced',
    frameworks: ['Spring Framework'],
  },
  {
    id: 'p-rep-06',
    title: 'JSON Deserialization Mismatch & Missing Field Patch',
    category: 'Failure Diagnosis & Repair',
    prompt:
      'Diagnose Jackson InvalidDefinitionException or MismatchedInputException. Fix missing @JsonCreator, @JsonProperty annotations, or incompatible date/time formats in DTO request bodies.',
    description: 'Fixes JSON payload deserialization failures and timezone date parser errors.',
    tags: ['Jackson', 'JSON', 'DTO', 'Debugging'],
    complexity: 'Beginner',
    frameworks: ['Jackson', 'Spring Boot'],
  },

  // 9. CLEAN CODE & REFACTORING
  {
    id: 'p-clean-01',
    title: 'Test Data Builder & Object Mother Pattern Synthesis',
    category: 'Clean Code & Refactoring',
    prompt:
      'Generate a Fluent Test Data Builder or Object Mother factory class for complex domain entities (User, Order, Payment) with sensible defaults and chainable withCustomField(...) overrides.',
    description: 'DRYs up test setup code and eliminates massive boilerplate instantiation lines.',
    tags: ['Builder Pattern', 'Object Mother', 'Clean Code', 'Refactoring'],
    complexity: 'Intermediate',
    frameworks: ['Java 17', 'JUnit 5'],
  },
  {
    id: 'p-clean-02',
    title: 'Eliminate Test Smells (Assertion Roulette & Magic Numbers)',
    category: 'Clean Code & Refactoring',
    prompt:
      'Audit the test file for test smells: Assertion Roulette (multiple unlabelled assertions), Mystery Guest, Eager Test, and Magic Numbers. Refactor into clean, self-documenting single-concept tests.',
    description: 'Replaces cryptic magic values and noisy assertions with self-explanatory tests.',
    tags: ['Test Smells', 'Clean Code', 'Refactoring'],
    complexity: 'Intermediate',
    frameworks: ['JUnit 5', 'AssertJ'],
  },
  {
    id: 'p-clean-03',
    title: 'Custom AssertJ Assertions for Domain Invariants',
    category: 'Clean Code & Refactoring',
    prompt:
      'Create custom AssertJ assertion classes (e.g., PaymentAssert extends AbstractAssert) with domain-specific fluent methods like isSettled(), hasSufficientFunds(), and withTransactionFee(amount).',
    description: 'Produces ultra-readable business assertions that fail with crystal clear domain error messages.',
    tags: ['AssertJ', 'Custom Assertions', 'Domain Driven'],
    complexity: 'Advanced',
    frameworks: ['AssertJ'],
  },
  {
    id: 'p-clean-04',
    title: 'Extract Reusable Test Fixtures with JUnit 5 ParameterResolver',
    category: 'Clean Code & Refactoring',
    prompt:
      'Implement a custom JUnit 5 Extension implementing ParameterResolver to automatically inject authenticated test users, mock tenant contexts, or pre-seeded database entities into test method parameters.',
    description: 'Eliminates repetitive @BeforeEach setup by injecting custom test fixtures via parameters.',
    tags: ['JUnit 5 Extension', 'ParameterResolver', 'DRY'],
    complexity: 'Advanced',
    frameworks: ['JUnit 5'],
  },
  {
    id: 'p-clean-05',
    title: 'SonarQube Cognitive Complexity Reduction Guide',
    category: 'Clean Code & Refactoring',
    prompt:
      'Identify methods with Cognitive Complexity > 15. Provide a step-by-step refactoring extracting strategy pattern classes, reducing nesting levels, and maintaining existing test safety nets.',
    description: 'Breaks down spaghetti methods into maintainable, easily testable subroutines.',
    tags: ['SonarQube', 'Cognitive Complexity', 'Strategy Pattern'],
    complexity: 'Advanced',
    frameworks: ['Java 17'],
  },

  // 10. CI/CD & QUALITY GATES
  {
    id: 'p-ci-01',
    title: 'GitHub Actions Matrix CI Pipeline with Test Splitting',
    category: 'CI/CD & Quality Gates',
    prompt:
      'Generate a high-performance GitHub Actions workflow with matrix execution across Java 17/21, Maven test parallelization (Surefire forkCount=1C), Docker caching for Testcontainers, and JaCoCo coverage badges.',
    description: 'Builds blazing fast parallel CI pipeline with automated coverage reporting.',
    tags: ['GitHub Actions', 'CI/CD', 'Maven', 'JaCoCo'],
    complexity: 'Intermediate',
    frameworks: ['GitHub Actions', 'Maven'],
  },
  {
    id: 'p-ci-02',
    title: 'JaCoCo Coverage Enforcement Quality Gate Configuration',
    category: 'CI/CD & Quality Gates',
    prompt:
      'Configure Maven JaCoCo plugin execution rules enforcing minimum 85% instruction coverage, 80% branch coverage, and zero missed branches in critical payment/security packages, failing build if violated.',
    description: 'Enforces automated hard build failure gates when code coverage dips below standards.',
    tags: ['JaCoCo', 'Quality Gate', 'Maven', 'Coverage'],
    complexity: 'Beginner',
    frameworks: ['Maven', 'JaCoCo'],
  },
  {
    id: 'p-ci-03',
    title: 'Maven Surefire Parallel Test Suite Tuning & Memory Caps',
    category: 'CI/CD & Quality Gates',
    prompt:
      'Optimize pom.xml maven-surefire-plugin configuration for parallel method/class execution with reuseForks=true, argLine memory allocations (-Xmx2g -XX:+UseG1GC), and rerunFailingTestsCount for CI stability.',
    description: 'Cuts test execution runtime in half while avoiding JVM out-of-memory heap crashes.',
    tags: ['Maven Surefire', 'Performance', 'Parallel Execution'],
    complexity: 'Intermediate',
    frameworks: ['Maven'],
  },
  {
    id: 'p-ci-04',
    title: 'Automated PR Test Impact Analysis (TIA) Strategy',
    category: 'CI/CD & Quality Gates',
    prompt:
      'Design a Test Impact Analysis strategy using git diff inspection to dynamically select and execute only unit/integration tests affected by changed classes on pull requests for sub-minute feedback.',
    description: 'Executes only relevant test subsets affected by git commit changes.',
    tags: ['Test Impact Analysis', 'Git Diff', 'CI Optimization'],
    complexity: 'Expert',
    frameworks: ['Git', 'Maven', 'Bash'],
  },
  {
    id: 'p-ci-05',
    title: 'Trivy & Snyk Dependency Vulnerability Scanner Integration',
    category: 'CI/CD & Quality Gates',
    prompt:
      'Configure automated CI vulnerability scanning checking for high/critical CVEs in Maven dependencies, auditing transitive dependency trees and generating SARIF report uploads for GitHub Security alerts.',
    description: 'Automates supply chain security checks and CVE scanning for external libraries.',
    tags: ['Snyk', 'Trivy', 'CVE', 'Dependency Check'],
    complexity: 'Intermediate',
    frameworks: ['Trivy', 'GitHub Actions'],
  },
];
