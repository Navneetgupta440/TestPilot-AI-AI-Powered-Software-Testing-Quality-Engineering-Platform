# TestPilot AI — REST API Specification (Phase 1)

Base URL: `/api/v1`

---

## 1. Authentication & System Health

### `GET /api/v1/health`
- **Description**: Actuator and system health check.
- **Response `200 OK`**:
```json
{
  "status": "UP",
  "version": "1.0.0",
  "components": {
    "database": "UP",
    "aiProvider": "UP (Gemini 3.7 Flash)",
    "executionSandbox": "UP (Docker Isolated)",
    "vectorDb": "UP"
  }
}
```

### `POST /api/v1/auth/login`
- **Request**:
```json
{
  "email": "developer@testpilot.ai",
  "password": "Password123!"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "u-101",
    "email": "developer@testpilot.ai",
    "name": "Alex Mercer",
    "role": "DEVELOPER"
  }
}
```

---

## 2. Project Management

### `GET /api/v1/projects`
- **Description**: Retrieves all configured projects for the authenticated user.

### `POST /api/v1/projects`
- **Request**:
```json
{
  "name": "sample-spring-app",
  "description": "Payment and User Management Microservice",
  "repositoryUrl": "https://github.com/testpilot/sample-spring-app",
  "defaultBranch": "main"
}
```

---

## 3. Repository Analysis & Intelligence

### `POST /api/v1/projects/{id}/analysis`
- **Description**: Triggers AST source analysis, static code rules, and test gap scoring.
- **Response `200 OK`**:
```json
{
  "analysisId": "an-801",
  "status": "COMPLETED",
  "classesDiscovered": 4,
  "methodsDiscovered": 8,
  "endpointsDiscovered": 3,
  "codeFindingsCount": 6,
  "overallCoverage": 38.5,
  "qualityScore": 74.2
}
```

---

## 4. AI Test Generation & Repair

### `POST /api/v1/projects/{id}/tests/generate`
- **Request**:
```json
{
  "className": "PaymentService",
  "methodName": "calculateDiscount",
  "testType": "UNIT_JUNIT5",
  "focusScenarios": ["Boundary", "Negative", "Tier4_Platinum", "InvalidTierException"]
}
```
- **Response `200 OK`**:
```json
{
  "testCaseId": "tc-901",
  "testClassName": "PaymentServiceTest",
  "testMethodName": "shouldThrowExceptionForNegativePriceAndUnsupportedTier",
  "generatedCode": "@Test\nvoid shouldThrowForNegativePrice() {\n    assertThrows(IllegalArgumentException.class, () -> paymentService.calculateDiscount(-10.0, 1));\n}",
  "validationStatus": "VALID"
}
```

---

## 5. Test Execution & Sandbox

### `POST /api/v1/test-runs`
- **Request**:
```json
{
  "projectId": "p-1",
  "testCaseIds": ["tc-901", "tc-902"],
  "environment": "DOCKER_ISOLATED_SANDBOX"
}
```
- **Response `200 OK`**:
```json
{
  "runId": "run-401",
  "totalTests": 2,
  "passedCount": 2,
  "failedCount": 0,
  "durationMs": 1420,
  "status": "COMPLETED",
  "logs": [
    "[INFO] Initializing sandbox container...",
    "[INFO] Compiling generated tests with JUnit 5 engine...",
    "[INFO] Tests run: 2, Failures: 0, Errors: 0, Time elapsed: 0.82 s"
  ]
}
```

---

## 6. AI Failure Analysis & Auto-Repair

### `POST /api/v1/ai/analyze-failure`
- **Request**:
```json
{
  "testCaseId": "tc-901",
  "stackTrace": "org.opentest4j.AssertionFailedError: expected: <30.0> but was: <0.0>",
  "sourceCode": "public double calculateDiscount(double price, int customerType) { ... }"
}
```
- **Response `200 OK`**:
```json
{
  "rootCause": "Missing boundary handling for customerType tier 1 where price exactly equals 500.0",
  "suggestedPatch": "Update condition from price > 500 to price >= 500 or adjust assertion threshold",
  "improvedTestCode": "@Test\nvoid shouldHandleBoundaryPriceCorrectly() {\n    assertEquals(0.0, paymentService.calculateDiscount(500.0, 1));\n    assertEquals(25.0, paymentService.calculateDiscount(500.01, 1), 0.01);\n}"
}
```

---

## 7. Quality Reports

### `GET /api/v1/projects/{id}/reports/quality`
- **Response `200 OK`**:
```json
{
  "overallScore": 82.5,
  "grade": "A",
  "metrics": {
    "testCoverageScore": 75.0,
    "staticAnalysisScore": 88.0,
    "testPassRateScore": 100.0,
    "codeComplexityScore": 85.0,
    "securityFindingsScore": 92.0,
    "testQualityScore": 90.0
  },
  "recommendations": [
    "Add test coverage for UserService.validatePasswordStrength edge cases",
    "Fix PMD rule violation in PaymentController line 38 (unchecked exception handling)"
  ]
}
```
