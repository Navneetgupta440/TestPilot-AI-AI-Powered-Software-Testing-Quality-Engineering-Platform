import React, { useState, useEffect } from 'react';
import { apiService } from './services/apiService';
import {
  Project,
  CodeClass,
  CodeFinding,
  TestCase,
  TestRun,
  ApiEndpoint,
  QualityReport,
  UserPreferences,
  DEFAULT_USER_PREFERENCES,
} from './types';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CodeExplorerPage } from './pages/CodeExplorerPage';
import { TestGenerationPage } from './pages/TestGenerationPage';
import { TestExecutionPage } from './pages/TestExecutionPage';
import { FailureRepairPage } from './pages/FailureRepairPage';
import { ApiTestingPage } from './pages/ApiTestingPage';
import { StaticAnalysisPage } from './pages/StaticAnalysisPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { QualityReportsPage } from './pages/QualityReportsPage';
import { ArchitectureDocsPage } from './pages/ArchitectureDocsPage';
import { DeveloperDetailsPage } from './pages/DeveloperDetailsPage';
import { NewProjectModal } from './components/NewProjectModal';
import { UserPreferencesModal } from './components/UserPreferencesModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const PREFERENCES_STORAGE_KEY = 'testpilot_user_preferences_v1';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [classes, setClasses] = useState<CodeClass[]>([]);
  const [findings, setFindings] = useState<CodeFinding[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);

  // User Preferences State
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse local preferences:', e);
    }
    return DEFAULT_USER_PREFERENCES;
  });

  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  const [selectedTestCaseForRepair, setSelectedTestCaseForRepair] =
    useState<TestCase | null>(null);
  const [explanation, setExplanation] = useState<{
    methodName: string;
    text: string;
  } | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] =
    useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut Cmd+, or Ctrl+, to open preferences modal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsPreferencesModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Initial Load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [pList, remotePrefs] = await Promise.all([
        apiService.getProjects(),
        apiService.getPreferences().catch(() => null),
      ]);

      if (remotePrefs && typeof remotePrefs === 'object') {
        setUserPreferences((prev) => ({
          ...prev,
          ...remotePrefs,
          autoRepair: {
            ...prev.autoRepair,
            ...(remotePrefs.autoRepair || {}),
          },
        }));
      }

      setProjects(pList);
      if (pList.length > 0) {
        const active = pList[0];
        setActiveProject(active);
        await loadProjectData(active.id);
      }
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  };

  const handleSavePreferences = async (newPrefs: UserPreferences) => {
    setUserPreferences(newPrefs);
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPrefs));
      await apiService.savePreferences(newPrefs);
      showToast(
        `Saved AI auto-repair policy (Depth ${newPrefs.autoRepair.allowedMutationDepth}, ${newPrefs.autoRepair.targetFrameworks.length} frameworks)`
      );
    } catch (err) {
      console.warn('Preferences saved locally, backend sync warning:', err);
      showToast('Preferences applied successfully');
    }
  };

  const loadProjectData = async (projectId: string) => {
    try {
      const [cData, fData, tData, rData, epData, qData] = await Promise.all([
        apiService.getClasses(projectId),
        apiService.getFindings(projectId),
        apiService.getTestCases(projectId),
        apiService.getTestRuns(projectId),
        apiService.getApiEndpoints(projectId),
        apiService.getQualityReport(projectId),
      ]);

      setClasses(cData);
      setFindings(fData);
      setTestCases(tData);
      setTestRuns(rData);
      setApiEndpoints(epData);
      setQualityReport(qData);
    } catch (err) {
      console.error('Failed to load project details', err);
    }
  };

  const handleSelectProject = async (p: Project) => {
    setActiveProject(p);
    await loadProjectData(p.id);
    showToast(`Switched repository context to ${p.name}`, 'info');
  };

  const handleTriggerAnalysis = async () => {
    if (!activeProject) return;
    setIsAnalyzing(true);
    try {
      await apiService.triggerAnalysis(activeProject.id);
      await loadProjectData(activeProject.id);
      showToast('AST code analysis & static rules scanned successfully!');
    } catch (err) {
      showToast('Error during AST analysis', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTest = async (payload: {
    className: string;
    methodName: string;
    testType: string;
    focusScenarios: string[];
    customPrompt?: string;
  }) => {
    if (!activeProject) return;
    setIsGenerating(true);
    try {
      const newTest = await apiService.generateTestCase({
        projectId: activeProject.id,
        ...payload,
      });
      setTestCases((prev) => [newTest, ...prev]);
      showToast(`Generated JUnit 5 test: ${newTest.testClassName}.${newTest.testMethodName}()`);
      setCurrentTab('test-generation');
    } catch (err) {
      showToast('Failed to generate test case', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecuteTestRun = async (testIds?: string[]) => {
    if (!activeProject) return;
    setIsRunningTests(true);
    try {
      const run = await apiService.runTestSuite(activeProject.id, testIds);
      setTestRuns((prev) => [run, ...prev]);
      // refresh testCases status
      const updatedTests = await apiService.getTestCases(activeProject.id);
      setTestCases(updatedTests);
      showToast(`Sandbox run finished: ${run.passedCount} passed, ${run.failedCount} failed`);
      setCurrentTab('test-execution');
    } catch (err) {
      showToast('Error executing tests in sandbox', 'error');
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleAutoRepair = async (
    testCaseId: string,
    customInstruction?: string,
    overrideRepairPrefs?: Partial<UserPreferences['autoRepair']>
  ) => {
    setIsRepairing(true);
    try {
      const effectivePrefs = {
        ...userPreferences.autoRepair,
        ...(overrideRepairPrefs || {}),
      };

      const res = await apiService.autoRepairTestCase(
        testCaseId,
        customInstruction,
        effectivePrefs
      );
      if (activeProject) {
        const updatedTests = await apiService.getTestCases(activeProject.id);
        setTestCases(updatedTests);
      }
      if (userPreferences.notifications.toastOnAutoRepair) {
        showToast(`AI self-repair loop verified patch at Mutation Depth ${effectivePrefs.allowedMutationDepth}!`);
      }
      return res;
    } catch (err) {
      showToast('Auto-repair failed', 'error');
      throw err;
    } finally {
      setIsRepairing(false);
    }
  };

  const handleExplainMethod = async (className: string, methodName: string, snippet: string) => {
    setIsExplaining(true);
    try {
      const text = await apiService.explainMethod(className, methodName, snippet);
      setExplanation({ methodName, text });
      showToast('AI explanation generated');
    } catch (err) {
      showToast('Failed to explain method', 'error');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleGenerateRestAssured = async (endpointId: string): Promise<string> => {
    const res = await apiService.generateRestAssuredTest(endpointId);
    showToast('Synthesized REST Assured test suite');
    return res.code;
  };

  const handleExecuteEndpointTest = async (endpointId: string, mockPayload?: any) => {
    const res = await apiService.executeApiEndpoint(endpointId, mockPayload);
    showToast(`Live HTTP probe returned status ${res.status}`);
    return res;
  };

  const handleSendMessageToAi = async (msg: string): Promise<string> => {
    const res = await apiService.askAiAssistant(activeProject?.id || 'p1', msg);
    return res.reply;
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    const newP = await apiService.createProject(data);
    setProjects((prev) => [...prev, newP]);
    setActiveProject(newP);
    await loadProjectData(newP.id);
    showToast(`Connected repository: ${newP.name}`);
  };

  const untestedCount = classes.reduce(
    (acc, c) => acc + c.methods.filter((m) => !m.hasExistingTest).length,
    0
  );

  return (
    <div
      id="testpilot-root"
      className="h-screen w-screen flex flex-col bg-[#0B0E14] text-[#C9D1D9] font-sans overflow-hidden antialiased select-none"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 bg-[#161B22] border border-[#30363D] text-[#F0F6FC] px-4 py-2.5 rounded-lg shadow-2xl text-xs font-mono animate-fade-in">
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-[#F85149]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#3FB950]" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        projects={projects}
        activeProject={activeProject}
        onSelectProject={handleSelectProject}
        onTriggerAnalysis={handleTriggerAnalysis}
        isAnalyzing={isAnalyzing}
        onOpenNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenPreferences={() => setIsPreferencesModalOpen(true)}
        onOpenDeveloperProfile={() => setCurrentTab('developer')}
        mutationDepth={userPreferences.autoRepair.allowedMutationDepth}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          untestedGapsCount={untestedCount}
          findingsCount={findings.length}
          activeTestRunsCount={testRuns.length}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0B0E14]">
          {activeProject ? (
            <>
              {currentTab === 'dashboard' && (
                <DashboardPage
                  project={activeProject}
                  classes={classes}
                  findings={findings}
                  testCases={testCases}
                  testRuns={testRuns}
                  latestRun={testRuns[0] || null}
                  onNavigate={setCurrentTab}
                  onQuickGenerate={() => setCurrentTab('test-generation')}
                  onQuickRun={() => handleExecuteTestRun()}
                  onTestCasesUpdated={() => loadProjectData(activeProject.id)}
                  onOpenRepair={(tc) => {
                    setSelectedTestCaseForRepair(tc);
                    setCurrentTab('failure-repair');
                  }}
                />
              )}

              {currentTab === 'explorer' && (
                <CodeExplorerPage
                  classes={classes}
                  onGenerateTestForMethod={(className, methodName) => {
                    handleGenerateTest({
                      className,
                      methodName,
                      testType: 'UNIT_JUNIT5',
                      focusScenarios: ['Boundary Values', 'Null & Negative Inputs'],
                    });
                  }}
                  onExplainMethod={handleExplainMethod}
                  explanation={explanation}
                  isExplaining={isExplaining}
                />
              )}

              {currentTab === 'test-generation' && (
                <TestGenerationPage
                  classes={classes}
                  testCases={testCases}
                  onGenerateTest={handleGenerateTest}
                  isGenerating={isGenerating}
                  onExecuteTestRun={handleExecuteTestRun}
                  onOpenRepair={(tc) => {
                    setSelectedTestCaseForRepair(tc);
                    setCurrentTab('failure-repair');
                  }}
                />
              )}

              {currentTab === 'test-execution' && (
                <TestExecutionPage
                  testRuns={testRuns}
                  testCases={testCases}
                  onExecuteSuite={() => handleExecuteTestRun()}
                  isRunning={isRunningTests}
                  onOpenRepair={(tc) => {
                    setSelectedTestCaseForRepair(tc);
                    setCurrentTab('failure-repair');
                  }}
                />
              )}

              {currentTab === 'failure-repair' && (
                <FailureRepairPage
                  testCases={testCases}
                  selectedTestCase={selectedTestCaseForRepair}
                  onSelectTestCase={setSelectedTestCaseForRepair}
                  onAutoRepair={handleAutoRepair}
                  isRepairing={isRepairing}
                  onExecuteTestRun={handleExecuteTestRun}
                  preferences={userPreferences}
                  onOpenPreferences={() => setIsPreferencesModalOpen(true)}
                />
              )}

              {currentTab === 'api-testing' && (
                <ApiTestingPage
                  endpoints={apiEndpoints}
                  onGenerateRestAssured={handleGenerateRestAssured}
                  onExecuteEndpointTest={handleExecuteEndpointTest}
                />
              )}

              {currentTab === 'static-analysis' && (
                <StaticAnalysisPage
                  findings={findings}
                  classes={classes}
                  onTriggerAnalysis={handleTriggerAnalysis}
                  isAnalyzing={isAnalyzing}
                  onSelectMethodForTest={(className, methodName) => {
                    handleGenerateTest({
                      className,
                      methodName,
                      testType: 'UNIT_JUNIT5',
                      focusScenarios: ['Basis Path Testing', 'Boundary Values', 'Cyclomatic Branch Coverage'],
                    });
                  }}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === 'ai-assistant' && (
                <AiAssistantPage
                  project={activeProject}
                  classes={classes}
                  findings={findings}
                  onSendMessage={handleSendMessageToAi}
                  onShowToast={showToast}
                />
              )}

              {currentTab === 'quality-reports' && (
                <QualityReportsPage
                  report={qualityReport}
                  onRefreshReport={async () => {
                    const r = await apiService.getQualityReport(activeProject.id);
                    setQualityReport(r);
                    showToast('Quality metrics updated');
                  }}
                />
              )}

              {currentTab === 'docs' && <ArchitectureDocsPage />}

              {currentTab === 'developer' && (
                <DeveloperDetailsPage onShowToast={showToast} />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-[#8B949E]">
              Connecting to TestPilot AI workspace...
            </div>
          )}
        </main>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      {/* User Preferences Modal */}
      <UserPreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        preferences={userPreferences}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}

export default App;
