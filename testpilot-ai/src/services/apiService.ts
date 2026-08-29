import {
  Project,
  CodeClass,
  ApiEndpoint,
  CodeFinding,
  TestCase,
  TestRun,
  QualityReport,
  UserPreferences,
} from '../types';

const API_BASE = '/api/v1';

export const apiService = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getPreferences(): Promise<UserPreferences> {
    const res = await fetch(`${API_BASE}/preferences`);
    return res.json();
  },

  async savePreferences(preferences: UserPreferences): Promise<UserPreferences> {
    const res = await fetch(`${API_BASE}/preferences`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
    return res.json();
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getClasses(projectId: string): Promise<CodeClass[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/classes`);
    return res.json();
  },

  async getEndpoints(projectId: string): Promise<ApiEndpoint[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/endpoints`);
    return res.json();
  },

  async getApiEndpoints(projectId: string): Promise<ApiEndpoint[]> {
    return this.getEndpoints(projectId);
  },

  async getFindings(projectId: string): Promise<CodeFinding[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/findings`);
    return res.json();
  },

  async getTests(projectId: string): Promise<TestCase[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tests`);
    return res.json();
  },

  async getTestCases(projectId: string): Promise<TestCase[]> {
    return this.getTests(projectId);
  },

  async generateTest(
    projectId: string,
    payload: {
      className: string;
      methodName: string;
      testType?: string;
      focusScenarios?: string[];
      customPrompt?: string;
    }
  ): Promise<TestCase> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tests/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async generateTestCase(payload: {
    projectId: string;
    className: string;
    methodName: string;
    testType?: string;
    focusScenarios?: string[];
    customPrompt?: string;
  }): Promise<TestCase> {
    const { projectId, ...rest } = payload;
    return this.generateTest(projectId, rest);
  },

  async executeTests(
    projectId: string,
    testCaseIds?: string[]
  ): Promise<TestRun> {
    const res = await fetch(`${API_BASE}/test-runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, testCaseIds }),
    });
    return res.json();
  },

  async runTestSuite(projectId: string, testCaseIds?: string[]): Promise<TestRun> {
    return this.executeTests(projectId, testCaseIds);
  },

  async getTestRuns(projectId: string): Promise<TestRun[]> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/test-runs`);
    return res.json();
  },

  async analyzeFailure(payload: {
    testCaseId: string;
    failureMessage: string;
    stackTrace: string;
    sourceCode: string;
  }) {
    const res = await fetch(`${API_BASE}/ai/analyze-failure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async autoRepairTestCase(
    testCaseId: string,
    customInstruction?: string,
    preferences?: Partial<UserPreferences['autoRepair']>
  ) {
    const res = await fetch(`${API_BASE}/ai/repair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCaseId, customInstruction, preferences }),
    });
    return res.json();
  },

  async explainCode(payload: {
    className: string;
    methodName: string;
    codeSnippet: string;
  }) {
    const res = await fetch(`${API_BASE}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async explainMethod(className: string, methodName: string, codeSnippet: string): Promise<string> {
    const res = await this.explainCode({ className, methodName, codeSnippet });
    return res.explanation || res.text || 'Explanation generated successfully.';
  },

  async sendChat(projectId: string, message: string) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, message }),
    });
    return res.json();
  },

  async askAiAssistant(projectId: string, message: string): Promise<{ reply: string }> {
    const res = await this.sendChat(projectId, message);
    return { reply: res.reply || res.response || 'Analysis complete.' };
  },

  async generateApiTest(projectId: string, endpointId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/api-tests/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpointId }),
    });
    return res.json();
  },

  async generateRestAssuredTest(endpointId: string): Promise<{ code: string }> {
    const res = await this.generateApiTest('p1', endpointId);
    return { code: res.testCode || res.code || '// REST Assured Generated Spec' };
  },

  async executeApiTest(projectId: string, endpointId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/api-tests/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpointId }),
    });
    return res.json();
  },

  async executeApiEndpoint(endpointId: string, mockPayload?: any) {
    const res = await this.executeApiTest('p1', endpointId);
    return res;
  },

  async getQualityReport(projectId: string): Promise<QualityReport> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/reports/quality`);
    return res.json();
  },

  async getProjectComplexity(projectId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/complexity`);
    return res.json();
  },

  async calculateCodeComplexity(codeSnippet: string) {
    const res = await fetch(`${API_BASE}/analysis/calculate-complexity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeSnippet }),
    });
    return res.json();
  },

  async triggerAnalysis(projectId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/analysis`, {
      method: 'POST',
    });
    return res.json();
  },

  // Flakiness Detector Service Methods
  async getFlakinessReport(projectId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/flakiness`);
    return res.json();
  },

  async runFlakinessStressTest(projectId: string, iterations = 10) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/flakiness/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iterations }),
    });
    return res.json();
  },

  async toggleQuarantine(projectId: string, testCaseId: string, isQuarantined: boolean) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/flakiness/quarantine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCaseId, isQuarantined }),
    });
    return res.json();
  },

  async fixFlakyTest(projectId: string, testCaseId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/flakiness/fix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testCaseId }),
    });
    return res.json();
  },
};

