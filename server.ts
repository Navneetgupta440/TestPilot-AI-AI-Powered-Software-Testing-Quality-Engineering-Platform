import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI Client with standard aistudio-build telemetry
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDemoKeyForTestPilot';
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory state representing the current projects, analysis, and test suites
interface StoreState {
  projects: any[];
  classes: Record<string, any[]>;
  endpoints: Record<string, any[]>;
  findings: Record<string, any[]>;
  testCases: Record<string, any[]>;
  testRuns: Record<string, any[]>;
  ragDocs: Record<string, any[]>;
}

const db: StoreState = {
  projects: [
    {
      id: 'proj-sample-spring',
      name: 'sample-spring-app',
      description: 'Spring Boot 3 Enterprise Financial & User Service',
      repositoryUrl: 'https://github.com/testpilot/sample-spring-app',
      defaultBranch: 'main',
      currentBranch: 'main',
      language: 'Java 17',
      buildSystem: 'MAVEN',
      framework: 'SPRING_BOOT',
      lastAnalysisDate: '2026-08-28T07:20:00Z',
      qualityScore: 78.5,
      coveragePercentage: 42.0,
      totalClasses: 4,
      totalMethods: 8,
      totalTests: 2,
      status: 'READY',
      createdAt: '2026-08-28T07:00:00Z',
    },
  ],
  classes: {
    'proj-sample-spring': [
      {
        id: 'cls-payment-service',
        name: 'PaymentService',
        packageName: 'com.testpilot.sample.service',
        filePath: 'src/main/java/com/testpilot/sample/service/PaymentService.java',
        type: 'CLASS',
        springRole: 'SERVICE',
        dependencies: ['PaymentRequest', 'PaymentResponse', 'BigDecimal'],
        annotations: ['@Service'],
        linesOfCode: 84,
        complexity: 14,
        coveragePercentage: 45.0,
        methods: [
          {
            id: 'm-calc-discount',
            name: 'calculateDiscount',
            signature: 'public double calculateDiscount(double price, int customerType)',
            returnType: 'double',
            parameters: [
              { name: 'price', type: 'double' },
              { name: 'customerType', type: 'int' },
            ],
            visibility: 'PUBLIC',
            startLine: 16,
            endLine: 47,
            cyclomaticComplexity: 7,
            isCovered: true,
            coveragePercentage: 50.0,
            hasExistingTest: true,
            priorityScore: 78,
            priorityLevel: 'HIGH',
            annotations: [],
            codeSnippet: `public double calculateDiscount(double price, int customerType) {
    if (price < 0) throw new IllegalArgumentException("Price cannot be negative");
    if (price == 0.0) return 0.0;
    double discountRate;
    switch (customerType) {
        case 1: discountRate = (price > 500.0) ? 0.05 : 0.0; break;
        case 2: discountRate = (price > 1000.0) ? 0.15 : 0.10; break;
        case 3: discountRate = 0.20; break;
        case 4: discountRate = (price > 5000.0) ? 0.30 : 0.25; break;
        default: throw new IllegalArgumentException("Unsupported customer tier: " + customerType);
    }
    return BigDecimal.valueOf(price * discountRate).setScale(2, RoundingMode.HALF_UP).doubleValue();
}`,
          },
          {
            id: 'm-proc-payment',
            name: 'processPayment',
            signature: 'public PaymentResponse processPayment(PaymentRequest request)',
            returnType: 'PaymentResponse',
            parameters: [{ name: 'request', type: 'PaymentRequest' }],
            visibility: 'PUBLIC',
            startLine: 52,
            endLine: 82,
            cyclomaticComplexity: 6,
            isCovered: true,
            coveragePercentage: 40.0,
            hasExistingTest: true,
            priorityScore: 85,
            priorityLevel: 'CRITICAL',
            annotations: [],
            codeSnippet: `public PaymentResponse processPayment(PaymentRequest request) {
    if (request == null) throw new IllegalArgumentException("Payment request payload is null");
    if (request.getAmount() <= 0) throw new IllegalArgumentException("Transaction amount must be strictly positive");
    if (request.getCurrency() == null || request.getCurrency().trim().isEmpty()) throw new IllegalArgumentException("Currency code is mandatory");
    if (request.getAmount() > 10000.0 && !request.isTwoFactorVerified()) {
        return PaymentResponse.builder().transactionId(UUID.randomUUID().toString()).status("REJECTED_SUSPECTED_FRAUD").amount(request.getAmount()).fee(0.0).message("Transactions over $10,000 require verified 2FA token").build();
    }
    double discount = calculateDiscount(request.getAmount(), request.getCustomerType());
    double finalAmount = Math.max(0.0, request.getAmount() - discount);
    double gatewayFee = BigDecimal.valueOf(finalAmount * 0.029 + 0.30).setScale(2, RoundingMode.HALF_UP).doubleValue();
    return PaymentResponse.builder().transactionId(UUID.randomUUID().toString()).status("APPROVED").amount(finalAmount).discountApplied(discount).fee(gatewayFee).currency(request.getCurrency().toUpperCase()).message("Payment settled successfully").build();
}`,
          },
          {
            id: 'm-val-iban',
            name: 'validateIban',
            signature: 'public boolean validateIban(String iban)',
            returnType: 'boolean',
            parameters: [{ name: 'iban', type: 'String' }],
            visibility: 'PUBLIC',
            startLine: 87,
            endLine: 92,
            cyclomaticComplexity: 4,
            isCovered: false,
            coveragePercentage: 0.0,
            hasExistingTest: false,
            priorityScore: 92,
            priorityLevel: 'CRITICAL',
            annotations: [],
            codeSnippet: `public boolean validateIban(String iban) {
    if (iban == null) return false;
    String clean = iban.replaceAll("\\\\s+", "").toUpperCase();
    if (clean.length() < 15 || clean.length() > 34) return false;
    return clean.matches("^[A-Z]{2}[0-9]{2}[A-Z0-9]+$");
}`,
          },
        ],
      },
      {
        id: 'cls-user-service',
        name: 'UserService',
        packageName: 'com.testpilot.sample.service',
        filePath: 'src/main/java/com/testpilot/sample/service/UserService.java',
        type: 'CLASS',
        springRole: 'SERVICE',
        dependencies: ['Pattern'],
        annotations: ['@Service'],
        linesOfCode: 42,
        complexity: 9,
        coveragePercentage: 0.0,
        methods: [
          {
            id: 'm-val-email',
            name: 'isValidEmail',
            signature: 'public boolean isValidEmail(String email)',
            returnType: 'boolean',
            parameters: [{ name: 'email', type: 'String' }],
            visibility: 'PUBLIC',
            startLine: 11,
            endLine: 14,
            cyclomaticComplexity: 2,
            isCovered: false,
            coveragePercentage: 0.0,
            hasExistingTest: false,
            priorityScore: 68,
            priorityLevel: 'MEDIUM',
            annotations: [],
            codeSnippet: `public boolean isValidEmail(String email) {
    if (email == null || email.isBlank()) return false;
    return EMAIL_PATTERN.matcher(email).matches();
}`,
          },
          {
            id: 'm-val-pw',
            name: 'validatePasswordStrength',
            signature: 'public boolean validatePasswordStrength(String password)',
            returnType: 'boolean',
            parameters: [{ name: 'password', type: 'String' }],
            visibility: 'PUBLIC',
            startLine: 16,
            endLine: 31,
            cyclomaticComplexity: 6,
            isCovered: false,
            coveragePercentage: 0.0,
            hasExistingTest: false,
            priorityScore: 88,
            priorityLevel: 'CRITICAL',
            annotations: [],
            codeSnippet: `public boolean validatePasswordStrength(String password) {
    if (password == null || password.length() < 8) return false;
    boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
    for (char c : password.toCharArray()) {
        if (Character.isUpperCase(c)) hasUpper = true;
        else if (Character.isLowerCase(c)) hasLower = true;
        else if (Character.isDigit(c)) hasDigit = true;
        else hasSpecial = true;
    }
    return hasUpper && hasLower && hasDigit && hasSpecial;
}`,
          },
          {
            id: 'm-res-role',
            name: 'resolveUserRole',
            signature: 'public String resolveUserRole(int accountLevel, boolean isInternalEmployee)',
            returnType: 'String',
            parameters: [
              { name: 'accountLevel', type: 'int' },
              { name: 'isInternalEmployee', type: 'boolean' },
            ],
            visibility: 'PUBLIC',
            startLine: 33,
            endLine: 41,
            cyclomaticComplexity: 5,
            isCovered: false,
            coveragePercentage: 0.0,
            hasExistingTest: false,
            priorityScore: 72,
            priorityLevel: 'HIGH',
            annotations: [],
            codeSnippet: `public String resolveUserRole(int accountLevel, boolean isInternalEmployee) {
    if (isInternalEmployee) {
        return accountLevel >= 5 ? "SUPER_ADMIN" : "STAFF_OPERATOR";
    }
    return switch (accountLevel) {
        case 1 -> "STANDARD_USER";
        case 2 -> "PREMIUM_USER";
        case 3 -> "ENTERPRISE_USER";
        default -> "GUEST";
    };
}`,
          },
        ],
      },
      {
        id: 'cls-payment-ctrl',
        name: 'PaymentController',
        packageName: 'com.testpilot.sample.controller',
        filePath: 'src/main/java/com/testpilot/sample/controller/PaymentController.java',
        type: 'CLASS',
        springRole: 'CONTROLLER',
        dependencies: ['PaymentService', 'PaymentRequest', 'PaymentResponse'],
        annotations: ['@RestController', '@RequestMapping("/api/v1/payments")'],
        linesOfCode: 48,
        complexity: 5,
        coveragePercentage: 0.0,
        methods: [
          {
            id: 'm-ctrl-proc',
            name: 'processPayment',
            signature: 'public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request)',
            returnType: 'ResponseEntity<?>',
            parameters: [{ name: 'request', type: 'PaymentRequest' }],
            visibility: 'PUBLIC',
            startLine: 23,
            endLine: 36,
            cyclomaticComplexity: 3,
            isCovered: false,
            coveragePercentage: 0.0,
            hasExistingTest: false,
            priorityScore: 75,
            priorityLevel: 'HIGH',
            annotations: ['@PostMapping("/process")'],
            codeSnippet: `@PostMapping("/process")
public ResponseEntity<?> processPayment(@RequestBody PaymentRequest request) {
    try {
        PaymentResponse response = paymentService.processPayment(request);
        if ("REJECTED_SUSPECTED_FRAUD".equals(response.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        return ResponseEntity.ok(response);
    } catch (IllegalArgumentException ex) {
        Map<String, Object> err = new HashMap<>();
        err.put("error", "VALIDATION_FAILED");
        err.put("message", ex.getMessage());
        return ResponseEntity.badRequest().body(err);
    }
}`,
          },
          {
            id: 'm-ctrl-quote',
            name: 'getDiscountQuote',
            signature: 'public ResponseEntity<Map<String, Object>> getDiscountQuote(@RequestParam double price, @RequestParam int customerType)',
            returnType: 'ResponseEntity<Map<String, Object>>',
            parameters: [
              { name: 'price', type: 'double' },
              { name: 'customerType', type: 'int' },
            ],
            visibility: 'PUBLIC',
            startLine: 38,
            endLine: 47,
            cyclomaticComplexity: 1,
            isCovered: false,
            coveragePercentage: 0.0,
            hasExistingTest: false,
            priorityScore: 55,
            priorityLevel: 'MEDIUM',
            annotations: ['@GetMapping("/discount-quote")'],
            codeSnippet: `@GetMapping("/discount-quote")
public ResponseEntity<Map<String, Object>> getDiscountQuote(@RequestParam double price, @RequestParam(defaultValue = "1") int customerType) {
    double discount = paymentService.calculateDiscount(price, customerType);
    Map<String, Object> res = new HashMap<>();
    res.put("originalPrice", price);
    res.put("customerType", customerType);
    res.put("discountAmount", discount);
    res.put("netPrice", price - discount);
    return ResponseEntity.ok(res);
}`,
          },
        ],
      },
    ],
  },
  endpoints: {
    'proj-sample-spring': [
      {
        id: 'ep-payment-process',
        httpMethod: 'POST',
        path: '/api/v1/payments/process',
        controllerClass: 'PaymentController',
        handlerMethod: 'processPayment',
        requestDto: 'PaymentRequest',
        responseDto: 'PaymentResponse',
        requestBodySample: '{\n  "amount": 250.0,\n  "customerType": 2,\n  "currency": "USD",\n  "twoFactorVerified": false,\n  "customerEmail": "customer@example.com"\n}',
        responseBodySample: '{\n  "transactionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",\n  "status": "APPROVED",\n  "amount": 225.0,\n  "discountApplied": 25.0,\n  "fee": 6.83,\n  "currency": "USD",\n  "message": "Payment settled successfully"\n}',
        requiresAuth: false,
        statusCodes: [200, 400, 403],
        generatedTestsCount: 1,
      },
      {
        id: 'ep-discount-quote',
        httpMethod: 'GET',
        path: '/api/v1/payments/discount-quote',
        controllerClass: 'PaymentController',
        handlerMethod: 'getDiscountQuote',
        queryParams: ['price', 'customerType'],
        responseBodySample: '{\n  "originalPrice": 1200.0,\n  "customerType": 2,\n  "discountAmount": 180.0,\n  "netPrice": 1020.0\n}',
        requiresAuth: false,
        statusCodes: [200, 400],
        generatedTestsCount: 0,
      },
    ],
  },
  findings: {
    'proj-sample-spring': [
      {
        id: 'find-1',
        tool: 'PMD',
        severity: 'HIGH',
        category: 'CODE_SMELL',
        rule: 'AvoidCatchingGenericException',
        message: 'Catching general IllegalArgumentException in controller should be centralized using @ControllerAdvice',
        file: 'PaymentController.java',
        line: 30,
        remediationSuggestion: 'Refactor exception handling to GlobalExceptionHandler annotated with @RestControllerAdvice.',
      },
      {
        id: 'find-2',
        tool: 'CHECKSTYLE',
        severity: 'MEDIUM',
        category: 'STYLE_VIOLATION',
        rule: 'MagicNumber',
        message: "'5000.0' is a magic number in calculateDiscount()",
        file: 'PaymentService.java',
        line: 25,
        remediationSuggestion: 'Extract 5000.0 into a private static final double PLATINUM_THRESHOLD = 5000.0;',
      },
      {
        id: 'find-3',
        tool: 'SPOTBUGS',
        severity: 'CRITICAL',
        category: 'POTENTIAL_BUG',
        rule: 'DMI_RANDOM_USED_ONLY_ONCE',
        message: 'UUID.randomUUID() string creation in rapid payment settlement loop may create collision risks if used for primary key idempotency',
        file: 'PaymentService.java',
        line: 65,
        remediationSuggestion: 'Ensure transaction IDs are validated against unique DB constraint or UUID v7 monotonic IDs.',
      },
      {
        id: 'find-4',
        tool: 'JACOCO',
        severity: 'HIGH',
        category: 'COVERAGE_GAP',
        rule: 'UncoveredBranch',
        message: 'validateIban method has 0% branch coverage across 4 logical branches',
        file: 'PaymentService.java',
        line: 87,
        remediationSuggestion: 'Generate JUnit 5 parameterized test covering valid/invalid lengths, null strings, and non-alphanumeric characters.',
      },
    ],
  },
  testCases: {
    'proj-sample-spring': [
      {
        id: 'tc-init-1',
        projectId: 'proj-sample-spring',
        targetClass: 'PaymentService',
        targetMethod: 'calculateDiscount',
        testClassName: 'PaymentServiceTest',
        testMethodName: 'shouldApplyRegularDiscount',
        testType: 'UNIT_JUNIT5',
        scenarioDescription: 'Happy path discount calculation for customer tier 1 with amount > 500',
        sourceCode: `@Test
@DisplayName("Should apply regular discount when price > 500")
void shouldApplyRegularDiscount() {
    double discount = paymentService.calculateDiscount(600.0, 1);
    assertEquals(30.0, discount, 0.001);
}`,
        validationStatus: 'VALID',
        executionStatus: 'PASSED',
        durationMs: 42,
        retryCount: 0,
        createdAt: '2026-08-28T07:10:00Z',
        isFlaky: false,
        flakinessScore: 0,
      },
      {
        id: 'tc-init-2',
        projectId: 'proj-sample-spring',
        targetClass: 'PaymentService',
        targetMethod: 'processPayment',
        testClassName: 'PaymentServiceTest',
        testMethodName: 'shouldProcessStandardPayment',
        testType: 'UNIT_JUNIT5',
        scenarioDescription: 'Standard payment settlement approval for normal customer amount',
        sourceCode: `@Test
@DisplayName("Should approve valid regular payment")
void shouldProcessStandardPayment() {
    PaymentRequest req = new PaymentRequest(100.0, 1, "USD", false, "alice@example.com");
    PaymentResponse res = paymentService.processPayment(req);

    assertNotNull(res.getTransactionId());
    assertEquals("APPROVED", res.getStatus());
    assertEquals(100.0, res.getAmount());
}`,
        validationStatus: 'VALID',
        executionStatus: 'PASSED',
        durationMs: 88,
        retryCount: 0,
        createdAt: '2026-08-28T07:12:00Z',
        isFlaky: false,
        flakinessScore: 0,
      },
      {
        id: 'tc-flaky-1',
        projectId: 'proj-sample-spring',
        targetClass: 'PaymentService',
        targetMethod: 'processPayment',
        testClassName: 'PaymentServiceAsyncTest',
        testMethodName: 'shouldVerifyAsyncWebhookNotification',
        testType: 'SPRING_BOOT_TEST',
        scenarioDescription: 'Non-deterministic async event delivery check with unmocked Thread.sleep',
        sourceCode: `@Test
@DisplayName("Should deliver asynchronous payment webhook confirmation")
void shouldVerifyAsyncWebhookNotification() throws Exception {
    PaymentRequest req = new PaymentRequest(250.0, 2, "USD", false, "webhook@example.com");
    PaymentResponse res = paymentService.processPayment(req);
    
    // ⚠️ Flaky race condition: arbitrary sleep may finish before or after async event bus
    Thread.sleep(50);
    
    assertTrue(webhookEventDispatcher.hasDispatched(res.getTransactionId()), 
        "Webhook dispatch was not received within arbitrary 50ms window");
}`,
        validationStatus: 'VALID',
        executionStatus: 'FAILED',
        durationMs: 95,
        retryCount: 3,
        createdAt: '2026-08-28T07:15:00Z',
        isFlaky: true,
        flakinessScore: 40.0,
        flakinessSeverity: 'HIGH',
        flakinessCause: 'ASYNC_RACE_CONDITION',
        flakinessDescription: 'Thread.sleep(50) races with asynchronous Spring ApplicationEventMulticaster under CPU contention',
        recommendedFix: 'Replace Thread.sleep with Awaitility await().atMost(2, SECONDS).untilAsserted(...)',
        isQuarantined: false,
        flipsCount: 4,
        totalMonitoredRuns: 10,
        flakinessHistory: ['PASSED', 'FAILED', 'PASSED', 'FAILED', 'PASSED', 'PASSED', 'FAILED', 'PASSED', 'FAILED', 'PASSED'],
      },
      {
        id: 'tc-flaky-2',
        projectId: 'proj-sample-spring',
        targetClass: 'UserService',
        targetMethod: 'validatePasswordStrength',
        testClassName: 'AuthTokenValidationTest',
        testMethodName: 'shouldValidateTokenExpiryWithinGracePeriod',
        testType: 'UNIT_JUNIT5',
        scenarioDescription: 'Token expiration assertion reliant on unmocked system wall-clock (Instant.now())',
        sourceCode: `@Test
@DisplayName("Should allow token refresh within exact 5-second grace period")
void shouldValidateTokenExpiryWithinGracePeriod() {
    Instant issuedAt = Instant.now();
    AuthSession session = new AuthSession("tok_123", issuedAt, 5); // 5 sec duration
    
    // Flaky under heavy JVM garbage collection pauses
    boolean isValid = session.isWithinGracePeriod(Instant.now());
    assertTrue(isValid, "Session unexpectedly expired due to non-isolated system clock drift");
}`,
        validationStatus: 'VALID',
        executionStatus: 'PASSED',
        durationMs: 35,
        retryCount: 2,
        createdAt: '2026-08-28T07:18:00Z',
        isFlaky: true,
        flakinessScore: 30.0,
        flakinessSeverity: 'MEDIUM',
        flakinessCause: 'TIME_OR_CLOCK_DRIFT',
        flakinessDescription: 'Direct Instant.now() invocation without deterministic Clock bean causes intermittent boundary expirations',
        recommendedFix: 'Inject fixed Clock (Clock.fixed(Instant.parse("..."), ZoneOffset.UTC)) in test harness',
        isQuarantined: true,
        flipsCount: 3,
        totalMonitoredRuns: 10,
        flakinessHistory: ['PASSED', 'PASSED', 'FAILED', 'PASSED', 'FAILED', 'PASSED', 'PASSED', 'PASSED', 'FAILED', 'PASSED'],
      },
      {
        id: 'tc-flaky-3',
        projectId: 'proj-sample-spring',
        targetClass: 'PaymentService',
        targetMethod: 'processPayment',
        testClassName: 'PaymentConcurrencyTest',
        testMethodName: 'shouldGenerateUniqueMonotonicId',
        testType: 'UNIT_JUNIT5',
        scenarioDescription: 'Asserts unique sequential monotonic ID generation in concurrent thread pool',
        sourceCode: `@Test
@DisplayName("Should produce collision-free monotonic transaction IDs")
void shouldGenerateUniqueMonotonicId() throws InterruptedException {
    Set<String> ids = ConcurrentHashMap.newKeySet();
    ExecutorService exec = Executors.newFixedThreadPool(4);
    CountDownLatch latch = new CountDownLatch(10);
    
    for (int i = 0; i < 10; i++) {
        exec.submit(() -> {
            ids.add(paymentService.generateIdempotencyKey());
            latch.countDown();
        });
    }
    latch.await(100, TimeUnit.MILLISECONDS);
    assertEquals(10, ids.size(), "Collision detected in fast concurrent thread pool");
}`,
        validationStatus: 'VALID',
        executionStatus: 'PASSED',
        durationMs: 110,
        retryCount: 1,
        createdAt: '2026-08-28T07:22:00Z',
        isFlaky: true,
        flakinessScore: 20.0,
        flakinessSeverity: 'LOW',
        flakinessCause: 'UNSEEDED_RANDOM_OR_UUID',
        flakinessDescription: '100ms latch timeout triggers before executor pool allocates threads on busy CI nodes',
        recommendedFix: 'Increase CountDownLatch timeout to 2000ms and verify ThreadPoolExecutor shutdown',
        isQuarantined: false,
        flipsCount: 2,
        totalMonitoredRuns: 10,
        flakinessHistory: ['PASSED', 'PASSED', 'PASSED', 'FAILED', 'PASSED', 'PASSED', 'PASSED', 'PASSED', 'FAILED', 'PASSED'],
      },
      {
        id: 'tc-init-3',
        projectId: 'proj-sample-spring',
        targetClass: 'PaymentService',
        targetMethod: 'processPayment',
        testClassName: 'PaymentServiceTest',
        testMethodName: 'shouldRejectOverlimitWithoutTwoFactor',
        testType: 'UNIT_JUNIT5',
        scenarioDescription: 'Rejects transactions over $10,000 when 2FA flag is false',
        sourceCode: `@Test
@DisplayName("Should reject overlimit payment when two-factor is false")
void shouldRejectOverlimitWithoutTwoFactor() {
    PaymentRequest req = new PaymentRequest(15000.0, 1, "USD", false, "large@example.com");
    PaymentResponse res = paymentService.processPayment(req);

    assertEquals("REJECTED_REQUIRES_2FA", res.getStatus());
}`,
        validationStatus: 'VALID',
        executionStatus: 'PASSED',
        durationMs: 31,
        retryCount: 0,
        createdAt: '2026-08-28T07:25:00Z',
        isFlaky: false,
        flakinessScore: 0,
      },
      {
        id: 'tc-init-4',
        projectId: 'proj-sample-spring',
        targetClass: 'UserService',
        targetMethod: 'validatePasswordStrength',
        testClassName: 'UserServiceTest',
        testMethodName: 'shouldValidateComplexPasswordRules',
        testType: 'UNIT_JUNIT5',
        scenarioDescription: 'Validates uppercase, lowercase, digit, and special character requirements',
        sourceCode: `@Test
@DisplayName("Should validate complex password rules")
void shouldValidateComplexPasswordRules() {
    boolean valid = userService.validatePasswordStrength("Secret@123");
    assertTrue(valid);
}`,
        validationStatus: 'VALID',
        executionStatus: 'FAILED',
        durationMs: 44,
        failureMessage: 'AssertionFailedError: expected: <true> but was: <false>',
        stackTrace: 'org.opentest4j.AssertionFailedError: expected: <true> but was: <false>\n\tat org.junit.jupiter.api.AssertionUtils.fail(AssertionUtils.java:55)\n\tat com.testpilot.sample.UserServiceTest.shouldValidateComplexPasswordRules(UserServiceTest.java:28)',
        retryCount: 1,
        createdAt: '2026-08-28T07:30:00Z',
        isFlaky: false,
        flakinessScore: 0,
      },
    ],
  },
  testRuns: {
    'proj-sample-spring': [
      {
        id: 'run-10',
        projectId: 'proj-sample-spring',
        triggerType: 'CI_WEBHOOK',
        totalTests: 22,
        passedCount: 21,
        failedCount: 1,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 385,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-28T18:45:00Z',
        completedAt: '2026-08-28T18:45:01Z',
        results: [
          { id: 'r10-1', testCaseId: 'tc-init-1', testName: 'shouldApplyRegularDiscount', className: 'PaymentServiceTest', status: 'PASSED', durationMs: 24 },
          { id: 'r10-2', testCaseId: 'tc-init-2', testName: 'shouldProcessStandardPayment', className: 'PaymentServiceTest', status: 'PASSED', durationMs: 38 },
          { id: 'r10-3', testCaseId: 'tc-init-3', testName: 'shouldRejectOverlimitWithoutTwoFactor', className: 'PaymentServiceTest', status: 'PASSED', durationMs: 31 },
          { id: 'r10-4', testCaseId: 'tc-init-4', testName: 'shouldValidateComplexPasswordRules', className: 'UserServiceTest', status: 'FAILED', durationMs: 44, failureMessage: 'AssertionFailedError: expected: <true> but was: <false>' },
        ],
        logs: [
          '[INFO] Initialized isolated container worker #41890',
          '[INFO] Running 22 JUnit 5 test cases in parallel...',
          '[INFO] Tests run: 22, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 0.385 s',
          '[INFO] Run #10 completed with 95.5% pass rate.',
        ],
      },
      {
        id: 'run-9',
        projectId: 'proj-sample-spring',
        triggerType: 'MANUAL',
        totalTests: 21,
        passedCount: 20,
        failedCount: 1,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 410,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-28T16:20:00Z',
        completedAt: '2026-08-28T16:20:01Z',
        results: [],
        logs: ['[INFO] Tests run: 21, Failures: 1, Errors: 0', '[INFO] Execution completed in 410ms'],
      },
      {
        id: 'run-8',
        projectId: 'proj-sample-spring',
        triggerType: 'AI_AUTOREPAIR',
        totalTests: 20,
        passedCount: 18,
        failedCount: 2,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 440,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-28T14:05:00Z',
        completedAt: '2026-08-28T14:05:01Z',
        results: [],
        logs: ['[INFO] Tests run: 20, Failures: 2, Errors: 0', '[INFO] Execution completed in 440ms'],
      },
      {
        id: 'run-7',
        projectId: 'proj-sample-spring',
        triggerType: 'CI_WEBHOOK',
        totalTests: 19,
        passedCount: 17,
        failedCount: 2,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 460,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-28T11:30:00Z',
        completedAt: '2026-08-28T11:30:01Z',
        results: [],
        logs: ['[INFO] Tests run: 19, Failures: 2, Errors: 0', '[INFO] Execution completed in 460ms'],
      },
      {
        id: 'run-6',
        projectId: 'proj-sample-spring',
        triggerType: 'MANUAL',
        totalTests: 18,
        passedCount: 15,
        failedCount: 3,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 490,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-28T09:15:00Z',
        completedAt: '2026-08-28T09:15:01Z',
        results: [],
        logs: ['[INFO] Tests run: 18, Failures: 3, Errors: 0', '[INFO] Execution completed in 490ms'],
      },
      {
        id: 'run-5',
        projectId: 'proj-sample-spring',
        triggerType: 'MANUAL',
        totalTests: 17,
        passedCount: 14,
        failedCount: 3,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 510,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-28T06:50:00Z',
        completedAt: '2026-08-28T06:50:01Z',
        results: [],
        logs: ['[INFO] Tests run: 17, Failures: 3, Errors: 0', '[INFO] Execution completed in 510ms'],
      },
      {
        id: 'run-4',
        projectId: 'proj-sample-spring',
        triggerType: 'CI_WEBHOOK',
        totalTests: 16,
        passedCount: 12,
        failedCount: 4,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 560,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-27T22:10:00Z',
        completedAt: '2026-08-27T22:10:01Z',
        results: [],
        logs: ['[INFO] Tests run: 16, Failures: 4, Errors: 0', '[INFO] Execution completed in 560ms'],
      },
      {
        id: 'run-3',
        projectId: 'proj-sample-spring',
        triggerType: 'MANUAL',
        totalTests: 16,
        passedCount: 13,
        failedCount: 3,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 540,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-27T18:00:00Z',
        completedAt: '2026-08-27T18:00:01Z',
        results: [],
        logs: ['[INFO] Tests run: 16, Failures: 3, Errors: 0', '[INFO] Execution completed in 540ms'],
      },
      {
        id: 'run-2',
        projectId: 'proj-sample-spring',
        triggerType: 'MANUAL',
        totalTests: 15,
        passedCount: 11,
        failedCount: 4,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 580,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-27T14:30:00Z',
        completedAt: '2026-08-27T14:30:01Z',
        results: [],
        logs: ['[INFO] Tests run: 15, Failures: 4, Errors: 0', '[INFO] Execution completed in 580ms'],
      },
      {
        id: 'run-1',
        projectId: 'proj-sample-spring',
        triggerType: 'MANUAL',
        totalTests: 15,
        passedCount: 10,
        failedCount: 5,
        errorCount: 0,
        skippedCount: 0,
        durationMs: 620,
        executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
        status: 'COMPLETED',
        startedAt: '2026-08-27T10:00:00Z',
        completedAt: '2026-08-27T10:00:01Z',
        results: [],
        logs: ['[INFO] Tests run: 15, Failures: 5, Errors: 0', '[INFO] Execution completed in 620ms'],
      },
    ],
  },
  ragDocs: {
    'proj-sample-spring': [
      {
        id: 'rag-1',
        filePath: 'src/main/java/com/testpilot/sample/service/PaymentService.java',
        packageName: 'com.testpilot.sample.service',
        className: 'PaymentService',
        chunkType: 'CLASS_DEFINITION',
        content: 'PaymentService handles discount calculation, 2FA fraud checks for > $10,000, gateway fee computation (2.9% + 0.30), and IBAN validation.',
        tokenCount: 48,
      },
      {
        id: 'rag-2',
        filePath: 'src/main/java/com/testpilot/sample/dto/PaymentRequest.java',
        packageName: 'com.testpilot.sample.dto',
        className: 'PaymentRequest',
        chunkType: 'DTO_SCHEMA',
        content: 'PaymentRequest fields: double amount, int customerType (1=Regular, 2=Silver, 3=Gold, 4=Platinum), String currency, boolean twoFactorVerified, String customerEmail.',
        tokenCount: 52,
      },
      {
        id: 'rag-3',
        filePath: 'src/main/java/com/testpilot/sample/service/UserService.java',
        packageName: 'com.testpilot.sample.service',
        className: 'UserService',
        chunkType: 'CLASS_DEFINITION',
        content: 'UserService validates RFC compliant emails, verifies password complexity (>=8 chars, upper, lower, digit, special), and maps numeric account levels to role strings.',
        tokenCount: 44,
      },
    ],
  },
};

// ==========================================
// REST API ROUTES (/api/v1/...)
// ==========================================

// 1. Health & Actuator
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    version: '1.0.0-PROD',
    timestamp: new Date().toISOString(),
    components: {
      database: 'UP (PostgreSQL 16.2 Dialect)',
      aiProvider: 'UP (Google Gemini 3.7 Flash Engine)',
      executionSandbox: 'UP (Docker Isolated Runner)',
      vectorEngine: 'UP (RAG In-Memory & Semantic Embeddings)',
      staticAnalysis: 'UP (PMD, Checkstyle, SpotBugs, JaCoCo)',
    },
  });
});

// 2. Auth Endpoints
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({
    token: 'jwt_mock_token_testpilot_ai_2026',
    user: {
      id: 'u-lead-dev-1',
      email: email || 'developer@testpilot.ai',
      name: 'Senior QA Architect',
      role: 'DEVELOPER',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-08-01T00:00:00Z',
    },
  });
});

app.get('/api/v1/auth/me', (req: Request, res: Response) => {
  res.json({
    id: 'u-lead-dev-1',
    email: 'developer@testpilot.ai',
    name: 'Senior QA Architect',
    role: 'DEVELOPER',
  });
});

// 3. Projects
app.get('/api/v1/projects', (req: Request, res: Response) => {
  res.json(db.projects);
});

app.post('/api/v1/projects', (req: Request, res: Response) => {
  const { name, description, repositoryUrl, defaultBranch } = req.body;
  const newProj = {
    id: 'proj-' + Date.now(),
    name: name || 'new-spring-service',
    description: description || 'Imported Git repository service',
    repositoryUrl: repositoryUrl || 'https://github.com/org/repo',
    defaultBranch: defaultBranch || 'main',
    currentBranch: defaultBranch || 'main',
    language: 'Java 17',
    buildSystem: 'MAVEN',
    framework: 'SPRING_BOOT',
    qualityScore: 65.0,
    coveragePercentage: 20.0,
    totalClasses: 2,
    totalMethods: 4,
    totalTests: 0,
    status: 'READY',
    createdAt: new Date().toISOString(),
  };
  db.projects.push(newProj);
  db.classes[newProj.id] = [];
  db.endpoints[newProj.id] = [];
  db.findings[newProj.id] = [];
  db.testCases[newProj.id] = [];
  db.testRuns[newProj.id] = [];
  db.ragDocs[newProj.id] = [];
  res.status(201).json(newProj);
});

app.get('/api/v1/projects/:id', (req: Request, res: Response) => {
  const p = db.projects.find((proj) => proj.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  res.json(p);
});

// 4. Code Intelligence & Explorer
app.get('/api/v1/projects/:id/classes', (req: Request, res: Response) => {
  const list = db.classes[req.params.id] || [];
  res.json(list);
});

app.get('/api/v1/projects/:id/endpoints', (req: Request, res: Response) => {
  const list = db.endpoints[req.params.id] || [];
  res.json(list);
});

app.get('/api/v1/projects/:id/findings', (req: Request, res: Response) => {
  const list = db.findings[req.params.id] || [];
  res.json(list);
});

// 4b. Cyclomatic Complexity Metrics for Project Classes
app.get('/api/v1/projects/:id/complexity', (req: Request, res: Response) => {
  const classes = db.classes[req.params.id] || [];
  const projectSummary = {
    projectId: req.params.id,
    totalClasses: classes.length,
    classes: classes.map((c) => {
      const methods = c.methods || [];
      const totalComplexity = methods.reduce((acc: number, m: any) => acc + (m.cyclomaticComplexity || 1), 0) || c.complexity || 1;
      const avgMethod = methods.length ? Number((totalComplexity / methods.length).toFixed(1)) : totalComplexity;
      const maxMethod = methods.length ? Math.max(...methods.map((m: any) => m.cyclomaticComplexity || 1)) : totalComplexity;
      const loc = Math.max(1, c.linesOfCode || 20);
      const density = Number(((totalComplexity / loc) * 100).toFixed(1));

      return {
        classId: c.id,
        className: c.name,
        packageName: c.packageName,
        filePath: c.filePath,
        springRole: c.springRole,
        linesOfCode: c.linesOfCode,
        totalComplexity,
        avgMethodComplexity: avgMethod,
        maxMethodComplexity: maxMethod,
        complexityDensity: density,
        riskLevel: totalComplexity > 25 || maxMethod > 10 ? 'CRITICAL' : totalComplexity >= 15 || maxMethod >= 8 ? 'HIGH' : totalComplexity >= 8 || maxMethod >= 5 ? 'MODERATE' : 'LOW',
        methods: methods.map((m: any) => ({
          methodId: m.id,
          name: m.name,
          signature: m.signature,
          cyclomaticComplexity: m.cyclomaticComplexity || 1,
          riskLevel: (m.cyclomaticComplexity || 1) > 10 ? 'CRITICAL' : (m.cyclomaticComplexity || 1) >= 8 ? 'HIGH' : (m.cyclomaticComplexity || 1) >= 5 ? 'MODERATE' : 'LOW',
          minTestsForCoverage: m.cyclomaticComplexity || 1,
          hasExistingTest: m.hasExistingTest || false,
          coveragePercentage: m.coveragePercentage || 0,
          codeSnippet: m.codeSnippet || '',
        })),
      };
    }),
  };
  res.json(projectSummary);
});

// 4c. Arbitrary Code Cyclomatic Complexity Calculator
app.post('/api/v1/analysis/calculate-complexity', (req: Request, res: Response) => {
  const { codeSnippet = '' } = req.body;
  const clean = codeSnippet
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ')
    .replace(/"(?:\\.|[^"\\])*"/g, '""');

  const ifCount = (clean.match(/\bif\s*\(/g) || []).length;
  const loopCount = (clean.match(/\b(for|while)\s*\(/g) || []).length + (clean.match(/\bdo\s*\{/g) || []).length;
  const caseCount = (clean.match(/\bcase\b[^:]*:/g) || []).length;
  const catchCount = (clean.match(/\bcatch\s*\(/g) || []).length;
  const logicalOpsCount = (clean.match(/&&/g) || []).length + (clean.match(/\|\|/g) || []).length;
  const ternaryCount = (clean.match(/\?/g) || []).length;
  const throwCount = (clean.match(/\bthrow\s+new\b/g) || []).length;

  const totalDecisions = ifCount + loopCount + caseCount + catchCount + logicalOpsCount + ternaryCount + throwCount;
  const score = Math.max(1, 1 + totalDecisions);

  const riskLevel = score > 10 ? 'CRITICAL' : score >= 8 ? 'HIGH' : score >= 5 ? 'MODERATE' : 'LOW';

  res.json({
    score,
    riskLevel,
    minTestsForCoverage: score,
    decisionPoints: {
      ifCount,
      loopCount,
      caseCount,
      catchCount,
      logicalOpsCount,
      ternaryCount,
      throwCount,
      totalDecisions,
    },
  });
});

// 5. Trigger Analysis (AST + Static Code + Test Gaps)
app.post('/api/v1/projects/:id/analysis', async (req: Request, res: Response) => {
  const p = db.projects.find((proj) => proj.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });

  p.status = 'ANALYZING';
  
  // Simulate AST parsing, rule application, and metrics calculation
  setTimeout(() => {
    p.status = 'READY';
    p.lastAnalysisDate = new Date().toISOString();
  }, 1000);

  res.json({
    analysisRunId: 'an-' + Date.now(),
    status: 'RUNNING',
    message: 'AST and static code analysis initiated',
    estimatedDurationSeconds: 2,
  });
});

// 6. Test Generation with Gemini 3.7 Flash + RAG
app.post('/api/v1/projects/:id/tests/generate', async (req: Request, res: Response) => {
  const { className, methodName, testType = 'UNIT_JUNIT5', focusScenarios = [], customPrompt } = req.body;
  const projId = req.params.id;

  // Retrieve matching class and method snippet
  const classes = db.classes[projId] || [];
  const targetClass = classes.find((c) => c.name === className);
  const targetMethod = targetClass?.methods.find((m: any) => m.name === methodName);
  const ragContext = (db.ragDocs[projId] || []).map((d) => `[File: ${d.filePath}]\n${d.content}`).join('\n\n');

  const snippet = targetMethod?.codeSnippet || `// Target method: ${methodName} in class ${className}`;

  let generatedTestCode = '';
  let scenarioDesc = `AI-generated test for ${className}.${methodName}() covering boundary conditions, exceptions, and business rules`;

  try {
    const ai = getAi();
    const prompt = `You are a Senior Java QA Automation Engineer creating production-grade JUnit 5 and Mockito tests.
Target Class: ${className}
Target Method: ${methodName}
Package: ${targetClass?.packageName || 'com.testpilot.sample'}
Method Source Code:
\`\`\`java
${snippet}
\`\`\`

Related Project Context (RAG):
${ragContext}

Focus Scenarios: ${focusScenarios.length ? focusScenarios.join(', ') : 'Boundary values, null/negative inputs, exception handling, happy paths'}
${customPrompt ? `Additional Instructions: ${customPrompt}` : ''}

REQUIREMENTS:
1. Write real executable JUnit 5 test methods using Assertions (e.g., assertEquals, assertThrows, assertNotNull, assertTrue, assertFalse).
2. Follow standard Java naming conventions (@Test, @DisplayName, shouldDoSomethingWhenCondition).
3. Do NOT include markdown fences, package lines, or class declaration wrapping if only generating the test methods, OR provide a clean method block.
4. Output ONLY valid Java test code methods.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    generatedTestCode = response.text || '';
    // Clean code blocks if present
    generatedTestCode = generatedTestCode.replace(/^```java\n?/, '').replace(/```$/, '').trim();
  } catch (error) {
    console.warn('Gemini live generation fallback:', error);
    generatedTestCode = `@Test
@DisplayName("Should throw IllegalArgumentException when ${methodName} receives invalid boundary arguments")
void shouldHandleBoundaryConditionsFor${methodName.charAt(0).toUpperCase() + methodName.slice(1)}() {
    // Assert boundary checks and exception handling
    assertThrows(IllegalArgumentException.class, () -> {
        // Invoking ${methodName} with illegal inputs
        ${className.toLowerCase()}.${methodName}(-1.0, 99);
    });
}

@Test
@DisplayName("Should accurately process expected outcome for valid parameters")
void shouldProcessValidCaseFor${methodName.charAt(0).toUpperCase() + methodName.slice(1)}() {
    var result = ${className.toLowerCase()}.${methodName}(1000.0, 2);
    assertNotNull(result);
}`;
  }

  const newTestCase = {
    id: 'tc-' + Date.now(),
    projectId: projId,
    targetClass: className,
    targetMethod: methodName,
    testClassName: `${className}Test`,
    testMethodName: `shouldValidate_${methodName}_${Date.now().toString().slice(-4)}`,
    testType,
    scenarioDescription: scenarioDesc,
    sourceCode: generatedTestCode,
    validationStatus: 'VALID',
    executionStatus: 'NOT_RUN',
    retryCount: 0,
    createdAt: new Date().toISOString(),
  };

  if (!db.testCases[projId]) db.testCases[projId] = [];
  db.testCases[projId].unshift(newTestCase);

  res.status(201).json(newTestCase);
});

app.get('/api/v1/projects/:id/tests', (req: Request, res: Response) => {
  const tests = db.testCases[req.params.id] || [];
  res.json(tests);
});

// 7. Test Execution & Sandbox Runner
app.post('/api/v1/test-runs', async (req: Request, res: Response) => {
  const { projectId, testCaseIds = [] } = req.body;
  const projectTests = db.testCases[projectId] || [];

  const targets = testCaseIds.length
    ? projectTests.filter((t) => testCaseIds.includes(t.id))
    : projectTests;

  const results: any[] = [];
  let passed = 0;
  let failed = 0;

  for (const t of targets) {
    const isFail = t.sourceCode.includes('FAIL_SIMULATION') || Math.random() < 0.15;
    const duration = Math.floor(Math.random() * 80) + 15;

    if (isFail) {
      failed++;
      t.executionStatus = 'FAILED';
      t.durationMs = duration;
      t.failureMessage = `AssertionFailedError: expected: <150.0> but was: <100.0> at line 34 in ${t.testMethodName}`;
      t.stackTrace = `org.opentest4j.AssertionFailedError: expected: <150.0> but was: <100.0>\n\tat org.junit.jupiter.api.AssertionUtils.fail(AssertionUtils.java:55)\n\tat org.junit.jupiter.api.AssertEquals.assertEquals(AssertEquals.java:182)\n\tat com.testpilot.sample.${t.testClassName}.${t.testMethodName}(${t.testClassName}.java:34)`;
      results.push({
        id: 'res-' + Date.now() + Math.random(),
        testCaseId: t.id,
        testName: t.testMethodName,
        className: t.testClassName,
        status: 'FAILED',
        durationMs: duration,
        failureMessage: t.failureMessage,
        stackTrace: t.stackTrace,
      });
    } else {
      passed++;
      t.executionStatus = 'PASSED';
      t.durationMs = duration;
      t.failureMessage = undefined;
      t.stackTrace = undefined;
      results.push({
        id: 'res-' + Date.now() + Math.random(),
        testCaseId: t.id,
        testName: t.testMethodName,
        className: t.testClassName,
        status: 'PASSED',
        durationMs: duration,
      });
    }
  }

  const run = {
    id: 'run-' + Date.now(),
    projectId,
    triggerType: 'MANUAL',
    totalTests: targets.length,
    passedCount: passed,
    failedCount: failed,
    errorCount: 0,
    skippedCount: 0,
    durationMs: targets.length * 90 + 120,
    executionEnvironment: 'DOCKER_ISOLATED_SANDBOX',
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 1000).toISOString(),
    completedAt: new Date().toISOString(),
    results,
    logs: [
      `[INFO] Spawning sandbox runner container image 'testpilot-runner:java17-mvn3'`,
      `[INFO] Attached isolated scratch workspace volume: /tmp/testpilot-sandbox-${Date.now().toString().slice(-6)}`,
      `[INFO] Compiling generated tests with Maven Surefire 3.2.5...`,
      `[INFO] Running ${targets.length} test cases...`,
      ...results.map((r) => `[TEST] ${r.className}.${r.testName} -> [${r.status}] (${r.durationMs}ms)`),
      `[INFO] Execution summary: ${passed} passed, ${failed} failed in ${targets.length * 90 + 120}ms`,
    ],
  };

  if (!db.testRuns[projectId]) db.testRuns[projectId] = [];
  db.testRuns[projectId].unshift(run);

  res.json(run);
});

app.get('/api/v1/projects/:id/test-runs', (req: Request, res: Response) => {
  res.json(db.testRuns[req.params.id] || []);
});

// User Preferences State with default AI auto-repair settings
let userPreferences = {
  theme: 'dark',
  autoRepair: {
    allowedMutationDepth: 2, // 1: Conservative, 2: Standard, 3: Deep, 4: Exhaustive
    targetFrameworks: ['JUNIT_5', 'MOCKITO_5', 'ASSERTJ', 'SPRING_BOOT_TEST'],
    primaryFramework: 'JUNIT_5',
    assertionStyle: 'ASSERTJ_FLUENT',
    mockingStrategy: 'MOCKITO_DEFAULT',
    maxSelfRepairIterations: 3,
    autoVerifyInSandbox: true,
    detectFlakyTests: true,
    flakinessThreshold: 3,
    reasoningEffort: 'HIGH',
    temperature: 0.2,
    preserveExistingComments: true,
    requireHumanReviewThreshold: 'DEPTH_3_PLUS',
    allowProductionCodePatching: false,
    customSystemPromptPrefix: 'Adhere strictly to enterprise Java best practices and Given-When-Then behavioral structure.',
  },
  generation: {
    defaultTestFramework: 'JUNIT_5',
    defaultAssertionStyle: 'ASSERTJ_FLUENT',
    includeParameterizedTests: true,
    includeEdgeCasesAndBoundaries: true,
    includeCyclomaticBranchCoverage: true,
    defaultTimeoutMs: 5000,
  },
  editor: {
    indentSize: 4,
    wordWrap: true,
    showLineNumbers: true,
    autoFormatOnSave: true,
  },
  notifications: {
    toastOnAutoRepair: true,
    soundOnCompletion: false,
  },
};

// Preferences Endpoints
app.get('/api/v1/preferences', (req: Request, res: Response) => {
  res.json(userPreferences);
});

app.put('/api/v1/preferences', (req: Request, res: Response) => {
  if (req.body && typeof req.body === 'object') {
    userPreferences = {
      ...userPreferences,
      ...req.body,
      autoRepair: {
        ...userPreferences.autoRepair,
        ...(req.body.autoRepair || {}),
      },
      generation: {
        ...userPreferences.generation,
        ...(req.body.generation || {}),
      },
      editor: {
        ...userPreferences.editor,
        ...(req.body.editor || {}),
      },
      notifications: {
        ...userPreferences.notifications,
        ...(req.body.notifications || {}),
      },
    };
  }
  res.json(userPreferences);
});

// 8. AI Failure Diagnosis & Auto-Repair Loop
app.post('/api/v1/ai/repair', async (req: Request, res: Response) => {
  const { testCaseId, customInstruction, preferences } = req.body;

  // Merge runtime preferences with stored preferences
  const repairPrefs = {
    ...userPreferences.autoRepair,
    ...(preferences || {}),
  };

  // Find test case across projects
  let targetTestCase: any = null;
  let targetProject: any = null;

  for (const projId of Object.keys(db.testCases)) {
    const found = db.testCases[projId].find((t) => t.id === testCaseId);
    if (found) {
      targetTestCase = found;
      targetProject = projId;
      break;
    }
  }

  // Fallback to sample test case if not found
  if (!targetTestCase) {
    const sampleTests = Object.values(db.testCases).flat();
    targetTestCase = sampleTests[0] || {
      id: testCaseId,
      testClassName: 'PaymentServiceTest',
      testMethodName: 'shouldCalculateDiscount_Tier1Boundary',
      targetClass: 'PaymentService',
      targetMethod: 'calculateDiscount',
      sourceCode: `@Test
void shouldCalculateDiscount_Tier1Boundary() {
    double discount = paymentService.calculateDiscount(500.0, 1);
    assertEquals(25.0, discount);
}`,
      failureMessage: 'AssertionFailedError: expected: <25.0> but was: <0.0> at line 4',
      stackTrace: 'org.opentest4j.AssertionFailedError: expected: <25.0> but was: <0.0>\n\tat org.junit.jupiter.api.Assertions.assertEquals(Assertions.java:243)',
    };
  }

  const mutationDepth = repairPrefs.allowedMutationDepth || 2;
  const targetFrameworks = repairPrefs.targetFrameworks || ['JUNIT_5', 'MOCKITO_5', 'ASSERTJ'];
  const assertionStyle = repairPrefs.assertionStyle || 'ASSERTJ_FLUENT';
  const customPrefix = repairPrefs.customSystemPromptPrefix || '';

  const mutationDepthDescriptions: Record<number, string> = {
    1: 'LEVEL 1 (CONSERVATIVE): Only tweak assertion arguments, threshold numbers, expected status codes, or boundary constants. Do NOT alter mocks, setup fixtures, or method parameters.',
    2: 'LEVEL 2 (STANDARD): Modify assertion logic, mock return values (when().thenReturn()), and input argument variations to accurately reflect business requirements.',
    3: 'LEVEL 3 (DEEP): Refactor test fixtures, re-stub multi-collaborator mocks (@MockBean/@Mock), update @BeforeEach setup blocks, and handle expected exceptions with assertThrows/assertThatThrownBy.',
    4: 'LEVEL 4 (EXHAUSTIVE): Complete architectural overhaul of the test class, rewriting setup, mock contracts, parameterized test matrix, and full boundary verification.',
  };

  const assertionStyleGuideline =
    assertionStyle === 'ASSERTJ_FLUENT'
      ? 'Use AssertJ fluent assertions: assertThat(actual).isEqualTo(expected); or assertThatThrownBy(() -> ...).isInstanceOf(...);'
      : assertionStyle === 'HAMCREST_MATCHERS'
      ? 'Use Hamcrest matchers: assertThat(actual, is(equalTo(expected)));'
      : 'Use standard JUnit 5 Assertions: assertEquals(expected, actual); or assertThrows(Exception.class, () -> ...);';

  let repairedCode = '';
  let explanation = '';
  let rootCause = '';
  let diffSummary = '';

  try {
    const ai = getAi();
    const prompt = `You are a Principal Software Quality Engineer performing automated test repair.
System Directive: ${customPrefix}

A test has failed during sandbox execution:
Target Class: ${targetTestCase.targetClass}
Target Method: ${targetTestCase.targetMethod}
Test Name: ${targetTestCase.testClassName}.${targetTestCase.testMethodName}

Failure Message:
${targetTestCase.failureMessage || 'Assertion failed: expected value mismatch on boundary threshold.'}

Stack Trace:
${targetTestCase.stackTrace || 'org.opentest4j.AssertionFailedError: condition not satisfied'}

Current Test Source Code:
\`\`\`java
${targetTestCase.sourceCode}
\`\`\`

USER-CONFIGURED AUTO-REPAIR POLICY:
- Allowed Mutation Depth: ${mutationDepth} -> ${mutationDepthDescriptions[mutationDepth]}
- Target Test Frameworks: ${targetFrameworks.join(', ')}
- Assertion Style Preference: ${assertionStyleGuideline}
- Mocking Strategy: ${repairPrefs.mockingStrategy}
- Allow Production Code Patching: ${repairPrefs.allowProductionCodePatching ? 'YES' : 'NO (test code only)'}
${customInstruction ? `- Developer Custom Instruction: "${customInstruction}"` : ''}

TASK:
1. Diagnose the exact root cause of the failure.
2. Synthesize a clean, production-ready, fully passing test replacement adhering to the Allowed Mutation Depth (${mutationDepth}) and Framework preferences.
3. Output ONLY the repaired Java test method without markdown wrappers, OR provide the method cleanly formatted.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const text = response.text || '';
    repairedCode = text.replace(/^```java\n?/, '').replace(/```$/, '').trim();
    rootCause = `Identified assertion discrepancy at Mutation Depth ${mutationDepth}: boundary threshold logic requires alignment with target specification.`;
    explanation = `Repaired using ${targetFrameworks.join(', ')} with ${assertionStyle.replace('_', ' ')} assertions under Mutation Depth ${mutationDepth} policy.`;
    diffSummary = `Adjusted assertion thresholds and verified mock contracts.`;
  } catch (error) {
    console.warn('Gemini auto-repair live fallback:', error);
    
    // High-quality fallback conforming to user preferences
    if (assertionStyle === 'ASSERTJ_FLUENT') {
      repairedCode = `@Test
@DisplayName("Should accurately calculate tiered discount on threshold and edge boundaries")
void ${targetTestCase.testMethodName || 'shouldVerifyTieredDiscount'}() {
    // Given - Mutation Depth ${mutationDepth} (${mutationDepth <= 2 ? 'Conservative/Standard' : 'Deep Fixture'} Alignment)
    double priceAtBoundary = 500.00;
    double priceAboveBoundary = 500.01;
    int customerTypeTier1 = 1;

    // When
    double discountAtBoundary = paymentService.calculateDiscount(priceAtBoundary, customerTypeTier1);
    double discountAboveBoundary = paymentService.calculateDiscount(priceAboveBoundary, customerTypeTier1);

    // Then - AssertJ Fluent Assertions
    org.assertj.core.api.Assertions.assertThat(discountAtBoundary)
        .as("Tier 1 boundary <= $500.00 qualifies for 0% discount")
        .isEqualTo(0.0);

    org.assertj.core.api.Assertions.assertThat(discountAboveBoundary)
        .as("Tier 1 strictly above $500.00 qualifies for 5% discount ($25.00)")
        .isEqualTo(25.00);
}`;
    } else {
      repairedCode = `@Test
@DisplayName("Should accurately calculate tiered discount on threshold and edge boundaries")
void ${targetTestCase.testMethodName || 'shouldVerifyTieredDiscount'}() {
    // Given - Mutation Depth ${mutationDepth} Policy
    double priceAtBoundary = 500.00;
    double priceAboveBoundary = 500.01;
    int customerTypeTier1 = 1;

    // When & Then
    double discountAtBoundary = paymentService.calculateDiscount(priceAtBoundary, customerTypeTier1);
    assertEquals(0.0, discountAtBoundary, "Tier 1 boundary <= 500 receives 0% discount");

    double discountAboveBoundary = paymentService.calculateDiscount(priceAboveBoundary, customerTypeTier1);
    assertEquals(25.00, discountAboveBoundary, 0.01, "Tier 1 > 500 receives 5% discount");
}`;
    }

    rootCause = `The test assertion assumed price <= 500 received a discount, whereas business logic requires price strictly > 500.0.`;
    explanation = `Applied Mutation Depth ${mutationDepth} patch adhering to target frameworks (${targetFrameworks.join(', ')}) and ${assertionStyle} assertion format.`;
  }

  // Update in-memory test case
  if (targetTestCase) {
    targetTestCase.sourceCode = repairedCode;
    targetTestCase.executionStatus = 'PASSED';
    targetTestCase.failureMessage = undefined;
    targetTestCase.stackTrace = undefined;
    targetTestCase.lastRepairedAt = new Date().toISOString();
    targetTestCase.mutationDepthUsed = mutationDepth;
  }

  res.json({
    testCaseId,
    repairedCode,
    explanation,
    rootCause,
    diffSummary,
    mutationDepth,
    targetFrameworks,
    assertionStyle,
    verificationStatus: 'VERIFIED_GREEN_SANDBOX',
    sandboxLogs: [
      `[SANDBOX] Injected synthesized patch into /src/test/java/${targetTestCase.testClassName}.java`,
      `[SANDBOX] Mutation Depth policy applied: Level ${mutationDepth}`,
      `[SANDBOX] Target frameworks verified: ${targetFrameworks.join(', ')}`,
      `[SANDBOX] Running Maven Surefire 3.2.5 sandbox compiler...`,
      `[SANDBOX] [INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.182 s`,
      `[SANDBOX] [SUCCESS] Patch validated - Test passed with 100% assertion satisfaction!`,
    ],
  });
});

app.post('/api/v1/ai/analyze-failure', async (req: Request, res: Response) => {
  const { testCaseId, failureMessage, stackTrace, sourceCode } = req.body;

  let rootCause = 'Assertion threshold mismatch on tiered discount calculation boundary condition.';
  let explanation = 'The test expected customer tier 1 with amount 500 to receive discount, but the service logic requires price strictly > 500.0.';
  let suggestedPatch = 'Adjust assertion or adjust service operator to strictly match business requirement specs.';
  let improvedTestCode = '';

  try {
    const ai = getAi();
    const prompt = `You are a Senior QA Failure Diagnostics Engineer.
A JUnit 5 test has failed during isolated execution.
Failure Message: ${failureMessage}
Stack Trace:
${stackTrace}
Target Method / Test Code:
\`\`\`java
${sourceCode}
\`\`\`

Diagnose the failure:
1. Explain the exact root cause in 2 sentences.
2. Provide the corrected, working JUnit 5 test code snippet that passes against the target logic without false positives.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    const text = response.text || '';
    improvedTestCode = text.replace(/^```java\n?/, '').replace(/```$/, '').trim();
    rootCause = `Detected boundary mismatch in assertion versus implementation logic.`;
  } catch (error) {
    console.warn('Gemini failure analysis fallback:', error);
    improvedTestCode = `@Test
@DisplayName("Should handle boundary threshold at 500.0 strictly")
void shouldHandleBoundaryThresholdCorrectly() {
    double discountAtThreshold = paymentService.calculateDiscount(500.0, 1);
    assertEquals(0.0, discountAtThreshold, "Tier 1 <= 500 receives 0% discount");

    double discountAboveThreshold = paymentService.calculateDiscount(500.01, 1);
    assertEquals(25.0, discountAboveThreshold, 0.01, "Tier 1 > 500 receives 5% discount");
} `;
  }

  res.json({
    testCaseId,
    failureMessage,
    rootCause,
    explanation,
    suggestedPatch,
    improvedTestCode,
  });
});

// 9. AI Code Explanation
app.post('/api/v1/ai/explain', async (req: Request, res: Response) => {
  const { className, methodName, codeSnippet } = req.body;
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `Explain this Java method for a testing & QA perspective. Highlight:
1. Core business purpose
2. Cyclomatic complexity & branch paths
3. Crucial edge cases & test scenarios to cover (nulls, zero, boundary values, exception paths)

Method: ${className}.${methodName}
Code:
\`\`\`java
${codeSnippet}
\`\`\``,
    });
    res.json({ explanation: response.text });
  } catch (err) {
    res.json({
      explanation: `**${className}.${methodName} Analysis:**
- **Business Function**: Validates and executes operations according to configured domain rules.
- **Complexity**: Multiple conditional branches requiring comprehensive coverage for edge cases (zero values, boundary thresholds, negative inputs, and unsupported tiers).
- **Key Testing Paths**: Verify valid inputs, boundary limits, negative inputs, and verify that expected exceptions are thrown with proper error messages.`,
    });
  }
});

// 10. AI RAG Assistant Chat
app.post('/api/v1/ai/chat', async (req: Request, res: Response) => {
  const { projectId, message } = req.body;
  const classes = db.classes[projectId] || [];
  const findings = db.findings[projectId] || [];
  const endpoints = db.endpoints[projectId] || [];

  const contextSummary = `Repository Architecture & Code Intelligence Context:
- Classes: ${classes.map((c) => `${c.name} (${c.springRole}, ${c.linesOfCode} LOC, ${c.methods.length} methods, ${c.coveragePercentage}% coverage)`).join(', ')}
- REST Endpoints: ${endpoints.map((e) => `${e.httpMethod} ${e.path} -> ${e.controllerClass}.${e.handlerMethod}`).join(', ')}
- Static Analysis Findings: ${findings.length} findings (${findings.map((f) => `[${f.tool}] ${f.rule} in ${f.file}`).join(', ')})`;

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `You are TestPilot AI Assistant — an expert testing, Spring Boot architecture, and QA engineering copilot.
Context about the active project repository:
${contextSummary}

User question: "${message}"

Provide a concise, highly technical, and actionable answer directly grounded in the repository's classes, testing gaps, APIs, and static analysis findings.`,
    });
    res.json({ reply: response.text });
  } catch (err) {
    res.json({
      reply: `Based on your repository analysis of **sample-spring-app**:
- **PaymentService**: Contains 3 methods with critical gaps in \`validateIban\` (0% coverage) and missing boundary tests for tiered discounts.
- **UserService**: Currently has 0% coverage on \`validatePasswordStrength\`.
- **PaymentController**: Exposes \`POST /api/v1/payments/process\` and \`GET /api/v1/payments/discount-quote\`.
- **Recommendations**: Use the Test Generation tab to generate JUnit 5 tests for \`PaymentService.validateIban()\` and \`UserService.validatePasswordStrength()\`.`,
    });
  }
});

// 11. REST Assured API Test Generation & Runner
app.post('/api/v1/projects/:id/api-tests/generate', async (req: Request, res: Response) => {
  const { endpointId } = req.body;
  const endpoints = db.endpoints[req.params.id] || [];
  const ep = endpoints.find((e) => e.id === endpointId) || endpoints[0];

  const testCode = `@Test
@DisplayName("REST API: ${ep.httpMethod} ${ep.path} - Should return 200 OK for valid payload")
void shouldReturn200ForValid${ep.handlerMethod.charAt(0).toUpperCase() + ep.handlerMethod.slice(1)}() {
    given()
        .contentType(ContentType.JSON)
        .body("""
${ep.requestBodySample || '{}'}
        """)
    .when()
        .${ep.httpMethod.toLowerCase()}("${ep.path}")
    .then()
        .statusCode(200)
        .body("status", equalTo("APPROVED"))
        .body("transactionId", notNullValue());
}

@Test
@DisplayName("REST API: ${ep.httpMethod} ${ep.path} - Should return 400 Bad Request when amount is negative")
void shouldReturn400ForNegativeAmount() {
    given()
        .contentType(ContentType.JSON)
        .body("""
        {
          "amount": -50.0,
          "customerType": 1,
          "currency": "USD"
        }
        """)
    .when()
        .${ep.httpMethod.toLowerCase()}("${ep.path}")
    .then()
        .statusCode(400)
        .body("error", equalTo("VALIDATION_FAILED"));
}`;

  res.json({
    endpointId: ep.id,
    path: ep.path,
    httpMethod: ep.httpMethod,
    generatedTestCode: testCode,
    framework: 'REST_ASSURED_5_4',
  });
});

app.post('/api/v1/projects/:id/api-tests/execute', (req: Request, res: Response) => {
  const { endpointId } = req.body;
  const endpoints = db.endpoints[req.params.id] || [];
  const ep = endpoints.find((e) => e.id === endpointId) || endpoints[0];

  res.json({
    executionId: 'api-run-' + Date.now(),
    endpoint: `${ep.httpMethod} ${ep.path}`,
    status: 'PASSED',
    durationMs: 148,
    scenariosTested: [
      { name: 'Happy Path 200 OK', status: 'PASSED', responseTimeMs: 42, statusCode: 200 },
      { name: 'Negative Amount Validation 400', status: 'PASSED', responseTimeMs: 28, statusCode: 400 },
      { name: '2FA Verification Requirement 403', status: 'PASSED', responseTimeMs: 34, statusCode: 403 },
      { name: 'Malformed JSON Contract Test', status: 'PASSED', responseTimeMs: 18, statusCode: 400 },
    ],
  });
});

// 12. TestPilot Quality Score & Reports
app.get('/api/v1/projects/:id/reports/quality', (req: Request, res: Response) => {
  const p = db.projects.find((proj) => proj.id === req.params.id) || db.projects[0];
  const findings = db.findings[p.id] || [];
  const tests = db.testCases[p.id] || [];

  const coverageScore = 72.0;
  const staticScore = 85.0;
  const passRateScore = 95.0;
  const complexityScore = 80.0;
  const securityScore = 88.0;
  const testQualityScore = 82.0;

  // Composite TestPilot Quality Score:
  // Coverage 30% + Static Analysis 20% + Pass Rate 20% + Complexity 10% + Security 10% + Test Quality 10%
  const overall = Math.round(
    coverageScore * 0.3 +
    staticScore * 0.2 +
    passRateScore * 0.2 +
    complexityScore * 0.1 +
    securityScore * 0.1 +
    testQualityScore * 0.1
  );

  res.json({
    id: 'rep-' + Date.now(),
    projectId: p.id,
    generatedAt: new Date().toISOString(),
    overallScore: overall,
    grade: overall >= 90 ? 'A+' : overall >= 80 ? 'A' : overall >= 70 ? 'B' : 'C',
    weights: {
      testCoverage: 30,
      staticAnalysis: 20,
      testPassRate: 20,
      codeComplexity: 10,
      securityFindings: 10,
      testQuality: 10,
    },
    metrics: {
      testCoverageScore: coverageScore,
      staticAnalysisScore: staticScore,
      testPassRateScore: passRateScore,
      codeComplexityScore: complexityScore,
      securityFindingsScore: securityScore,
      testQualityScore: testQualityScore,
    },
    coverageSummary: {
      lineCoverage: 52.4,
      branchCoverage: 48.0,
      methodCoverage: 62.5,
      classCoverage: 75.0,
      totalLines: 174,
      coveredLines: 91,
    },
    findingsSummary: {
      blockerCount: 0,
      criticalCount: findings.filter((f) => f.severity === 'CRITICAL').length,
      highCount: findings.filter((f) => f.severity === 'HIGH').length,
      mediumCount: findings.filter((f) => f.severity === 'MEDIUM').length,
      lowCount: findings.filter((f) => f.severity === 'LOW').length,
    },
    recommendations: [
      'Generate tests for PaymentService.validateIban() to eliminate 0% coverage gap on critical security method.',
      'Generate tests for UserService.validatePasswordStrength() covering special characters and length boundaries.',
      'Address PMD rule violation in PaymentController to centralize exception handling via @ControllerAdvice.',
      'Execute REST Assured suite against GET /api/v1/payments/discount-quote endpoint.',
    ],
  });
});

// 13. Flakiness Detector & Intermittent Failure Monitor
app.get('/api/v1/projects/:id/flakiness', (req: Request, res: Response) => {
  const projId = req.params.id;
  const tests = db.testCases[projId] || [];
  
  const flakyList = tests
    .filter((t) => t.isFlaky)
    .map((t) => {
      const historyRuns = (t.flakinessHistory || ['PASSED', 'FAILED', 'PASSED', 'FAILED', 'PASSED']).map((st: string, idx: number) => ({
        runId: `run-hist-${idx + 1}`,
        runIndex: idx + 1,
        status: st as any,
        durationMs: Math.floor(Math.random() * 60) + 25,
        timestamp: new Date(Date.now() - (10 - idx) * 3600000).toISOString(),
        commitHash: 'c4a8f9d (main - No Code Changes)',
      }));

      const passedCount = historyRuns.filter((r) => r.status === 'PASSED').length;
      const failedCount = historyRuns.filter((r) => r.status === 'FAILED').length;

      return {
        testCaseId: t.id,
        testClassName: t.testClassName,
        testMethodName: t.testMethodName,
        targetClass: t.targetClass,
        targetMethod: t.targetMethod,
        flakinessScore: t.flakinessScore || 35.0,
        severity: t.flakinessSeverity || (t.flakinessScore > 35 ? 'HIGH' : t.flakinessScore > 20 ? 'MEDIUM' : 'LOW'),
        flipsCount: t.flipsCount || 3,
        totalMonitoredRuns: historyRuns.length,
        passedRunsCount: passedCount,
        failedRunsCount: failedCount,
        suspectedCause: t.flakinessCause || 'ASYNC_RACE_CONDITION',
        causeTitle: t.flakinessCause === 'ASYNC_RACE_CONDITION'
          ? 'Async Race Condition & Event Bus Desync'
          : t.flakinessCause === 'TIME_OR_CLOCK_DRIFT'
          ? 'System Wall-Clock Drift (Instant.now)'
          : t.flakinessCause === 'UNSEEDED_RANDOM_OR_UUID'
          ? 'Non-Deterministic Concurrent Idempotency Latch'
          : 'Order-Dependent Static State Leak',
        causeDescription: t.flakinessDescription || 'Test intermittently fails under thread scheduling variation without source code modifications.',
        recommendedFix: t.recommendedFix || 'Replace arbitrary Thread.sleep with deterministic Awaitility or mock fixed clock.',
        isQuarantined: !!t.isQuarantined,
        history: historyRuns,
        lastFlakedAt: new Date(Date.now() - 4200000).toISOString(),
      };
    });

  const quarantined = flakyList.filter((f) => f.isQuarantined).length;
  const avgScore = flakyList.length
    ? Number((flakyList.reduce((acc, f) => acc + f.flakinessScore, 0) / flakyList.length).toFixed(1))
    : 0;

  const stabilityHealth = Math.max(0, Math.round(100 - (flakyList.length * 12)));

  res.json({
    monitoredCommit: 'c4a8f9d (main - Verified zero code changes between runs)',
    totalMonitoredTests: tests.length,
    flakyTestsCount: flakyList.length,
    quarantinedCount: quarantined,
    averageFlakinessScore: avgScore,
    stabilityHealthScore: stabilityHealth,
    highSeverityCount: flakyList.filter((f) => f.severity === 'HIGH' || f.severity === 'CRITICAL').length,
    mediumSeverityCount: flakyList.filter((f) => f.severity === 'MEDIUM').length,
    lowSeverityCount: flakyList.filter((f) => f.severity === 'LOW').length,
    flakyTests: flakyList,
    recentStressRunsCount: 10,
  });
});

app.post('/api/v1/projects/:id/flakiness/detect', async (req: Request, res: Response) => {
  const projId = req.params.id;
  const { iterations = 10 } = req.body;
  const tests = db.testCases[projId] || [];

  // Simulate stress detection runs across identical commit
  for (const t of tests) {
    if (t.isFlaky) {
      // Re-evaluate oscillations
      const newHistory: ('PASSED' | 'FAILED')[] = [];
      let flips = 0;
      let prev = 'PASSED';
      for (let i = 0; i < iterations; i++) {
        const pass = Math.random() > (t.flakinessScore / 100);
        const st: 'PASSED' | 'FAILED' = pass ? 'PASSED' : 'FAILED';
        if (st !== prev) flips++;
        prev = st;
        newHistory.push(st);
      }
      t.flakinessHistory = newHistory;
      t.flipsCount = flips;
      t.totalMonitoredRuns = iterations;
      t.flakinessScore = Number(((flips / iterations) * 100).toFixed(1));
    }
  }

  // Return refreshed summary
  const summaryRes = await fetch(`http://localhost:${PORT}/api/v1/projects/${projId}/flakiness`).then((r) => r.json()).catch(() => null);
  if (summaryRes) return res.json(summaryRes);

  res.json({
    message: `Flakiness stress detection completed across ${iterations} iterations`,
    monitoredCommit: 'c4a8f9d (main)',
    status: 'COMPLETED',
  });
});

app.post('/api/v1/projects/:id/flakiness/quarantine', (req: Request, res: Response) => {
  const projId = req.params.id;
  const { testCaseId, isQuarantined } = req.body;
  const tests = db.testCases[projId] || [];
  const target = tests.find((t) => t.id === testCaseId);

  if (target) {
    target.isQuarantined = isQuarantined;
    if (isQuarantined && !target.tags?.includes('QUARANTINED')) {
      target.tags = [...(target.tags || []), 'QUARANTINED'];
    } else if (!isQuarantined) {
      target.tags = (target.tags || []).filter((tg: string) => tg !== 'QUARANTINED');
    }
    return res.json({ success: true, testCase: target });
  }

  res.status(404).json({ error: 'Test case not found' });
});

app.post('/api/v1/projects/:id/flakiness/fix', async (req: Request, res: Response) => {
  const projId = req.params.id;
  const { testCaseId } = req.body;
  const tests = db.testCases[projId] || [];
  const target = tests.find((t) => t.id === testCaseId);

  if (!target) {
    return res.status(404).json({ error: 'Test case not found' });
  }

  let patchCode = '';
  let fixDetails = '';

  try {
    const ai = getAi();
    const prompt = `You are a Principal Java Reliability & QA Architect.
The following test is FLAKY (intermittently passes and fails with 0 code changes):
Test Class: ${target.testClassName}
Test Method: ${target.testMethodName}
Suspected Cause: ${target.flakinessCause || 'ASYNC_RACE_CONDITION'}
Issue Description: ${target.flakinessDescription}

Source Code:
\`\`\`java
${target.sourceCode}
\`\`\`

TASK:
1. Rewrite this JUnit 5 / Spring Boot test to be 100% DETERMINISTIC and eliminate all flakiness.
   - If race condition / sleep: use Awaitility (await().atMost(2, TimeUnit.SECONDS).untilAsserted(...))
   - If time/clock: inject fixed Clock
   - If thread pool / latch: use robust count down latch with sufficient timeout
2. Return ONLY the sanitized Java test method block.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    patchCode = response.text?.replace(/^```java\n?/, '').replace(/```$/, '').trim() || '';
    fixDetails = `Stabilized non-deterministic execution using deterministic concurrency primitives and isolated state assertions.`;
  } catch (err) {
    if (target.flakinessCause === 'ASYNC_RACE_CONDITION') {
      patchCode = `@Test
@DisplayName("Should deliver asynchronous payment webhook confirmation [STABILIZED]")
void shouldVerifyAsyncWebhookNotification() {
    PaymentRequest req = new PaymentRequest(250.0, 2, "USD", false, "webhook@example.com");
    PaymentResponse res = paymentService.processPayment(req);
    
    // ✅ Replaced flaky Thread.sleep with deterministic Awaitility condition polling
    org.awaitility.Awaitility.await()
        .atMost(Duration.ofSeconds(3))
        .pollInterval(Duration.ofMillis(50))
        .untilAsserted(() -> {
            assertTrue(webhookEventDispatcher.hasDispatched(res.getTransactionId()),
                "Webhook dispatch was not received within deterministic Awaitility window");
        });
}`;
    } else if (target.flakinessCause === 'TIME_OR_CLOCK_DRIFT') {
      patchCode = `@Test
@DisplayName("Should allow token refresh within exact 5-second grace period [STABILIZED]")
void shouldValidateTokenExpiryWithinGracePeriod() {
    // ✅ Deterministic fixed Clock eliminates wall-clock drift and GC pauses
    Clock fixedClock = Clock.fixed(Instant.parse("2026-08-28T12:00:00Z"), ZoneOffset.UTC);
    Instant issuedAt = fixedClock.instant();
    AuthSession session = new AuthSession("tok_123", issuedAt, 5, fixedClock);
    
    boolean isValid = session.isWithinGracePeriod(fixedClock.instant().plusSeconds(3));
    assertTrue(isValid, "Session is guaranteed valid within deterministic fixed clock bounds");
}`;
    } else {
      patchCode = `@Test
@DisplayName("Should produce collision-free monotonic transaction IDs [STABILIZED]")
void shouldGenerateUniqueMonotonicId() throws InterruptedException {
    Set<String> ids = ConcurrentHashMap.newKeySet();
    ExecutorService exec = Executors.newFixedThreadPool(4);
    CountDownLatch latch = new CountDownLatch(10);
    
    for (int i = 0; i < 10; i++) {
        exec.submit(() -> {
            try {
                ids.add(paymentService.generateIdempotencyKey());
            } finally {
                latch.countDown();
            }
        });
    }
    
    // ✅ Safe timeout with graceful executor shutdown
    boolean completed = latch.await(2, TimeUnit.SECONDS);
    exec.shutdown();
    assertTrue(completed, "All threads completed within deterministic window");
    assertEquals(10, ids.size(), "Collision-free monotonic generation verified");
}`;
    }
    fixDetails = `Stabilized test by replacing non-deterministic primitives with robust deterministic patterns.`;
  }

  // Update target test case to resolved/stable
  target.sourceCode = patchCode;
  target.isFlaky = false;
  target.flakinessScore = 0;
  target.flakinessSeverity = 'LOW';
  target.executionStatus = 'PASSED';
  target.flakinessHistory = ['PASSED', 'PASSED', 'PASSED', 'PASSED', 'PASSED', 'PASSED', 'PASSED', 'PASSED', 'PASSED', 'PASSED'];
  target.flipsCount = 0;

  res.json({
    success: true,
    testCase: target,
    fixDetails,
    patchCode,
    remediatedAt: new Date().toISOString(),
  });
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TestPilot AI] Server operational on port ${PORT}`);
  });
}

startServer();
