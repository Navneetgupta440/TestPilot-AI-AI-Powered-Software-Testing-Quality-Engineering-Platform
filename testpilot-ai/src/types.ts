export type UserRole = 'ADMIN' | 'DEVELOPER' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl: string;
  defaultBranch: string;
  currentBranch: string;
  language: string;
  buildSystem: 'MAVEN' | 'GRADLE';
  framework: 'SPRING_BOOT' | 'MICRONAUT' | 'QUARKUS' | 'STANDARD_JAVA';
  lastAnalysisDate?: string;
  qualityScore?: number;
  coveragePercentage?: number;
  totalClasses: number;
  totalMethods: number;
  totalTests: number;
  status: 'IDLE' | 'ANALYZING' | 'GENERATING_TESTS' | 'EXECUTING_TESTS' | 'READY';
  createdAt: string;
}

export interface CodeMethod {
  id: string;
  name: string;
  signature: string;
  returnType: string;
  parameters: { name: string; type: string }[];
  visibility: 'PUBLIC' | 'PROTECTED' | 'PRIVATE' | 'PACKAGE_PRIVATE';
  startLine: number;
  endLine: number;
  cyclomaticComplexity: number;
  isCovered: boolean;
  coveragePercentage: number;
  hasExistingTest: boolean;
  priorityScore: number; // 0-100 calculated
  priorityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  annotations: string[];
  codeSnippet: string;
  docComment?: string;
}

export interface CodeClass {
  id: string;
  name: string;
  packageName: string;
  filePath: string;
  type: 'CLASS' | 'INTERFACE' | 'ENUM' | 'RECORD';
  springRole: 'CONTROLLER' | 'SERVICE' | 'REPOSITORY' | 'COMPONENT' | 'CONFIGURATION' | 'ENTITY' | 'DTO' | 'NONE';
  methods: CodeMethod[];
  dependencies: string[];
  annotations: string[];
  linesOfCode: number;
  complexity: number;
  coveragePercentage: number;
  content?: string;
}

export type SeverityLevel = 'BLOCKER' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type FindingCategory = 'CODE_SMELL' | 'POTENTIAL_BUG' | 'SECURITY_VULNERABILITY' | 'STYLE_VIOLATION' | 'PERFORMANCE_ISSUE' | 'COVERAGE_GAP';

export type ComplexityRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface DecisionPointsBreakdown {
  ifCount: number;
  loopCount: number;
  caseCount: number;
  catchCount: number;
  logicalOpsCount: number;
  ternaryCount: number;
  throwCount: number;
  totalDecisions: number;
}

export interface MethodComplexityMetric {
  methodId: string;
  name: string;
  signature: string;
  cyclomaticComplexity: number;
  riskLevel: ComplexityRiskLevel;
  decisionPoints: DecisionPointsBreakdown;
  minTestsForCoverage: number;
  hasExistingTest: boolean;
  coveragePercentage: number;
  codeSnippet: string;
}

export interface ClassComplexityMetric {
  classId: string;
  className: string;
  packageName: string;
  filePath: string;
  springRole: string;
  linesOfCode: number;
  totalComplexity: number; // WMC (Weighted Methods per Class)
  avgMethodComplexity: number;
  maxMethodComplexity: number;
  complexityDensity: number; // complexity per 100 LOC
  riskLevel: ComplexityRiskLevel;
  maintainabilityRating: 'A' | 'B' | 'C' | 'D' | 'F';
  methods: MethodComplexityMetric[];
  hotspotsCount: number;
  untestedBranchesCount: number;
}

export interface ProjectComplexitySummary {
  projectId: string;
  totalProjectComplexity: number;
  avgClassComplexity: number;
  avgMethodComplexity: number;
  highestComplexityClass: string;
  highestComplexityMethod: string;
  totalBasisPaths: number;
  riskDistribution: {
    lowCount: number;
    moderateCount: number;
    highCount: number;
    criticalCount: number;
  };
  classes: ClassComplexityMetric[];
}

export interface CodeFinding {
  id: string;
  tool: 'PMD' | 'CHECKSTYLE' | 'SPOTBUGS' | 'JACOCO' | 'TESTPILOT_ANALYZER';
  severity: SeverityLevel;
  category: FindingCategory;
  rule: string;
  message: string;
  file: string;
  line: number;
  column?: number;
  remediationSuggestion: string;
}

export interface ApiEndpoint {
  id: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  controllerClass: string;
  handlerMethod: string;
  requestDto?: string;
  responseDto?: string;
  pathVariables?: string[];
  queryParams?: string[];
  requestBodySample?: string;
  responseBodySample?: string;
  requiresAuth: boolean;
  statusCodes: number[];
  generatedTestsCount: number;
}

export interface TestCase {
  id: string;
  projectId: string;
  targetClass: string;
  targetMethod: string;
  testClassName: string;
  testMethodName: string;
  testType: 'UNIT_JUNIT5' | 'MOCKITO' | 'SPRING_BOOT_TEST' | 'REST_ASSURED_API';
  scenarioDescription: string;
  sourceCode: string;
  validationStatus: 'VALID' | 'SYNTAX_ERROR' | 'COMPILATION_ERROR' | 'UNVALIDATED';
  executionStatus: 'NOT_RUN' | 'PASSED' | 'FAILED' | 'ERROR' | 'SKIPPED';
  durationMs?: number;
  failureMessage?: string;
  stackTrace?: string;
  retryCount: number;
  createdAt: string;
  tags?: string[];
  testSuite?: string;
  // Flakiness Detector fields
  isFlaky?: boolean;
  flakinessScore?: number; // 0 - 100%
  flakinessSeverity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  flakinessCause?: string;
  flakinessDescription?: string;
  recommendedFix?: string;
  isQuarantined?: boolean;
  flipsCount?: number;
  totalMonitoredRuns?: number;
  flakinessHistory?: ('PASSED' | 'FAILED')[];
}

export type FlakinessSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type FlakinessCause =
  | 'ASYNC_RACE_CONDITION'
  | 'TIME_OR_CLOCK_DRIFT'
  | 'UNSEEDED_RANDOM_OR_UUID'
  | 'SHARED_STATIC_STATE'
  | 'ORDER_DEPENDENCY'
  | 'NETWORK_OR_PORT_CONFLICT';

export interface FlakinessHistoryRun {
  runId: string;
  runIndex: number;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  durationMs: number;
  timestamp: string;
  commitHash: string;
}

export interface FlakyTestItem {
  testCaseId: string;
  testClassName: string;
  testMethodName: string;
  targetClass: string;
  targetMethod: string;
  flakinessScore: number; // 0-100%
  severity: FlakinessSeverity;
  flipsCount: number;
  totalMonitoredRuns: number;
  passedRunsCount: number;
  failedRunsCount: number;
  suspectedCause: FlakinessCause;
  causeTitle: string;
  causeDescription: string;
  recommendedFix: string;
  suggestedPatchCode?: string;
  isQuarantined: boolean;
  history: FlakinessHistoryRun[];
  lastFlakedAt: string;
}

export interface FlakinessDetectorSummary {
  monitoredCommit: string;
  totalMonitoredTests: number;
  flakyTestsCount: number;
  quarantinedCount: number;
  averageFlakinessScore: number;
  stabilityHealthScore: number; // 0-100%
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  flakyTests: FlakyTestItem[];
  recentStressRunsCount: number;
}

export interface TestRun {
  id: string;
  projectId: string;
  triggerType: 'MANUAL' | 'AUTOMATED_CI' | 'REPAIR_LOOP' | 'CI_WEBHOOK' | 'AI_AUTOREPAIR';
  totalTests: number;
  passedCount: number;
  failedCount: number;
  errorCount: number;
  skippedCount: number;
  durationMs: number;
  executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' | 'LOCAL_RUNTIME';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  results: TestResultItem[];
  logs: string[];
}

export interface TestResultItem {
  id: string;
  testCaseId: string;
  testName: string;
  className: string;
  status: 'PASSED' | 'FAILED' | 'ERROR';
  durationMs: number;
  tags?: string[];
  testType?: string;
  testSuite?: string;
  failureMessage?: string;
  stackTrace?: string;
  improvedTestCode?: string;
  rootCauseAnalysis?: string;
}

export interface QualityReport {
  id: string;
  projectId: string;
  generatedAt: string;
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  weights: {
    testCoverage: number; // e.g. 30
    staticAnalysis: number; // e.g. 20
    testPassRate: number; // e.g. 20
    codeComplexity: number; // e.g. 10
    securityFindings: number; // e.g. 10
    testQuality: number; // e.g. 10
  };
  metrics: {
    testCoverageScore: number;
    staticAnalysisScore: number;
    testPassRateScore: number;
    codeComplexityScore: number;
    securityFindingsScore: number;
    testQualityScore: number;
  };
  coverageSummary: {
    lineCoverage: number;
    branchCoverage: number;
    methodCoverage: number;
    classCoverage: number;
    totalLines: number;
    coveredLines: number;
  };
  findingsSummary: {
    blockerCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  recommendations: string[];
}

export interface RAGDocument {
  id: string;
  filePath: string;
  packageName: string;
  className: string;
  chunkType: 'CLASS_DEFINITION' | 'METHOD_IMPLEMENTATION' | 'DTO_SCHEMA' | 'TEST_FIXTURE' | 'SPRING_CONFIG';
  content: string;
  tokenCount: number;
  similarityScore?: number;
}

export interface FailureDiagnosis {
  testCaseId: string;
  failureMessage: string;
  stackTrace: string;
  rootCause: string;
  explanation: string;
  suggestedPatch: string;
  correctedCode: string;
  attemptNumber: number;
}

export interface MttrTrendPoint {
  period: string;
  mttrMinutes: number;
  autoRepairsCount: number;
  manualRepairsCount: number;
  avgResolutionSec: number;
  successRate: number;
}

export interface RealtimeTestingMetrics {
  coverage: {
    overallPercentage: number;
    lineCoverage: number;
    branchCoverage: number;
    methodCoverage: number;
    classCoverage: number;
    untestedCriticalMethodsCount: number;
    trendDelta: number; // e.g. +3.4%
  };
  passFail: {
    totalExecutions: number;
    passRate: number;
    failRate: number;
    errorRate: number;
    flakyRate: number;
    passedCount: number;
    failedCount: number;
    errorCount: number;
    skippedCount: number;
    trend: { runId: string; timestamp: string; passed: number; failed: number; rate: number }[];
  };
  mttr: {
    currentMttrMinutes: number;
    baselineMttrMinutes: number;
    reductionPercentage: number;
    mttdSeconds: number; // Mean time to detect
    autonomousFixRate: number; // e.g. 87.5%
    totalFailuresTreated: number;
    resolvedCount: number;
    inRepairLoopCount: number;
    trends: MttrTrendPoint[];
  };
}

// User Preference & AI Auto-Repair Configuration Types
export type MutationDepth = 1 | 2 | 3 | 4;

export type TargetTestFramework =
  | 'JUNIT_5'
  | 'MOCKITO_5'
  | 'ASSERTJ'
  | 'SPRING_BOOT_TEST'
  | 'REST_ASSURED'
  | 'TESTNG'
  | 'SPOCK_FRAMEWORK'
  | 'ARCHUNIT';

export type AssertionStyle = 'ASSERTJ_FLUENT' | 'JUNIT_ASSERTIONS' | 'HAMCREST_MATCHERS';
export type MockingStrategy = 'MOCKITO_DEFAULT' | 'SPRING_MOCKBEAN' | 'WIREMOCK' | 'TESTCONTAINERS';
export type ReasoningEffort = 'LOW' | 'MEDIUM' | 'HIGH';
export type HumanReviewThreshold = 'NEVER' | 'DEPTH_3_PLUS' | 'ALWAYS';

export interface UserPreferences {
  theme?: 'dark' | 'light' | 'system';
  autoRepair: {
    allowedMutationDepth: MutationDepth; // 1 (Conservative) to 4 (Exhaustive)
    targetFrameworks: TargetTestFramework[]; // active frameworks
    primaryFramework: TargetTestFramework;
    assertionStyle: AssertionStyle;
    mockingStrategy: MockingStrategy;
    maxSelfRepairIterations: number; // 1 to 5
    autoVerifyInSandbox: boolean; // re-run in Docker sandbox automatically
    detectFlakyTests: boolean; // run candidate patch multiple times
    flakinessThreshold: number; // 2 to 5 runs
    reasoningEffort: ReasoningEffort;
    temperature: number; // 0.1 to 1.0
    preserveExistingComments: boolean;
    requireHumanReviewThreshold: HumanReviewThreshold;
    allowProductionCodePatching: boolean; // default false (only patch test code)
    customSystemPromptPrefix: string;
  };
  generation: {
    defaultTestFramework: TargetTestFramework;
    defaultAssertionStyle: AssertionStyle;
    includeParameterizedTests: boolean;
    includeEdgeCasesAndBoundaries: boolean;
    includeCyclomaticBranchCoverage: boolean;
    defaultTimeoutMs: number;
  };
  editor: {
    indentSize: 2 | 4;
    wordWrap: boolean;
    showLineNumbers: boolean;
    autoFormatOnSave: boolean;
  };
  notifications: {
    toastOnAutoRepair: boolean;
    soundOnCompletion: boolean;
  };
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'dark',
  autoRepair: {
    allowedMutationDepth: 2, // Standard
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


