import React, { useState } from 'react';
import { TestCase, CodeFinding, UserPreferences, MutationDepth } from '../types';
import { CodeViewer } from '../components/CodeViewer';
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Sliders,
  Flame,
  Layers,
  Cpu,
  ArrowRight,
} from 'lucide-react';

interface FailureRepairPageProps {
  testCases: TestCase[];
  selectedTestCase: TestCase | null;
  onSelectTestCase: (tc: TestCase) => void;
  onAutoRepair: (
    testCaseId: string,
    customInstruction?: string,
    preferences?: Partial<UserPreferences['autoRepair']>
  ) => Promise<any>;
  isRepairing: boolean;
  onExecuteTestRun: (testIds?: string[]) => void;
  preferences?: UserPreferences;
  onOpenPreferences?: () => void;
}

export const FailureRepairPage: React.FC<FailureRepairPageProps> = ({
  testCases,
  selectedTestCase,
  onSelectTestCase,
  onAutoRepair,
  isRepairing,
  onExecuteTestRun,
  preferences,
  onOpenPreferences,
}) => {
  const [repairResult, setRepairResult] = useState<{
    repairedCode: string;
    explanation: string;
    rootCause?: string;
    diffSummary?: string;
    mutationDepth?: number;
    targetFrameworks?: string[];
    assertionStyle?: string;
    verificationStatus: string;
    sandboxLogs?: string[];
  } | null>(null);

  const [customPrompt, setCustomPrompt] = useState<string>('');

  const failedTests = testCases.filter((tc) => tc.executionStatus === 'FAILED');
  const activeTest = selectedTestCase || failedTests[0] || testCases[0];

  const currentDepth: MutationDepth = preferences?.autoRepair.allowedMutationDepth || 2;
  const currentFrameworks = preferences?.autoRepair.targetFrameworks || ['JUNIT_5', 'MOCKITO_5', 'ASSERTJ'];
  const currentAssertionStyle = preferences?.autoRepair.assertionStyle || 'ASSERTJ_FLUENT';

  const depthDescriptions: Record<number, string> = {
    1: 'Conservative (Assertions & Constants only)',
    2: 'Standard (Assertions, Mocks & Payload logic)',
    3: 'Deep (Fixtures, Multi-Class Mocks & Exception paths)',
    4: 'Exhaustive (Full Architectural Overhaul)',
  };

  const handleRepair = async () => {
    if (!activeTest) return;
    const res = await onAutoRepair(activeTest.id, customPrompt, preferences?.autoRepair);
    setRepairResult(res);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-[#E3B341]" />
            <span>AI Automated Failure Diagnosis & Self-Repair</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Analyze failed assertions and stack traces with RAG, patch test mocks/fixtures according to configured mutation depth, and verify in Docker sandbox.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {onOpenPreferences && (
            <button
              onClick={onOpenPreferences}
              className="flex items-center space-x-1.5 bg-[#161B22] hover:bg-[#21262D] text-[#C9D1D9] hover:text-[#F0F6FC] text-xs font-semibold px-3 py-2 rounded-md border border-[#30363D] shadow-sm transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span>Configure AI Policy</span>
            </button>
          )}

          {activeTest && (
            <button
              onClick={() => onExecuteTestRun([activeTest.id])}
              className="flex items-center space-x-1.5 bg-[#238636] hover:bg-[#2EA043] text-white text-xs font-semibold px-3.5 py-2 rounded-md border border-[#3FB950]/30 shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Re-verify in Sandbox</span>
            </button>
          )}
        </div>
      </div>

      {/* Active AI Policy Summary Strip */}
      <div className="p-3 rounded-lg bg-[#111622] border border-[#30363D] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 font-mono">
          <span className="text-[#8B949E] font-sans font-medium text-[11px]">
            Active Repair Policy:
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#1F6FEB]/15 text-[#58A6FF] border border-[#1F6FEB]/30 text-[10px] font-bold">
            <Flame className="w-3 h-3 text-[#E3B341]" />
            <span>Depth {currentDepth}: {depthDescriptions[currentDepth]}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#21262D] text-[#C9D1D9] border border-[#30363D] text-[10px]">
            Frameworks: {currentFrameworks.map((f) => f.replace('_', ' ')).join(' + ')}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D] text-[10px]">
            Style: {currentAssertionStyle.replace('_', ' ')}
          </span>
        </div>

        {onOpenPreferences && (
          <button
            onClick={onOpenPreferences}
            className="text-[11px] text-[#58A6FF] hover:underline font-mono cursor-pointer flex items-center space-x-1"
          >
            <span>Edit Defaults</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Test Selection (4 cols) */}
        <div className="lg:col-span-4 rounded-lg bg-[#161B22] border border-[#30363D] p-3.5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8B949E] px-1 flex items-center justify-between">
            <span>Tests Needing Repair</span>
            <span className="text-[10px] font-mono text-[#F85149] bg-[#F85149]/10 px-2 py-0.5 rounded border border-[#F85149]/20">
              {failedTests.length} failing
            </span>
          </div>

          <div className="space-y-1.5">
            {testCases.map((tc) => {
              const isSelected = tc.id === activeTest?.id;
              const isFailed = tc.executionStatus === 'FAILED';

              return (
                <button
                  key={tc.id}
                  onClick={() => {
                    onSelectTestCase(tc);
                    setRepairResult(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-md text-xs transition border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F6FEB]/15 border-[#1F6FEB]/40 text-[#F0F6FC]'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span>{tc.testClassName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        isFailed
                          ? 'bg-[#F85149]/20 text-[#F85149]'
                          : 'bg-[#3FB950]/20 text-[#3FB950]'
                      }`}
                    >
                      {tc.executionStatus}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8B949E] font-mono truncate mt-0.5">
                    {tc.testMethodName}()
                  </p>

                  {tc.lastFailureMessage && (
                    <p className="text-[10px] text-[#F85149] truncate mt-1">
                      {tc.lastFailureMessage}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Diagnosis & Repair Studio (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeTest ? (
            <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
                <div>
                  <h2 className="text-sm font-mono font-bold text-[#F0F6FC]">
                    {activeTest.testClassName}.{activeTest.testMethodName}()
                  </h2>
                  <p className="text-[11px] text-[#8B949E]">
                    Target: {activeTest.targetClass}.{activeTest.targetMethod}()
                  </p>
                </div>

                <button
                  id="run-ai-repair-btn"
                  onClick={handleRepair}
                  disabled={isRepairing}
                  className="flex items-center space-x-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-md shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isRepairing
                      ? `Synthesizing (Depth ${currentDepth})...`
                      : 'Run AI Self-Repair Loop'}
                  </span>
                </button>
              </div>

              {/* Failure Context Box */}
              {activeTest.lastFailureMessage && (
                <div className="p-3.5 rounded-lg bg-[#0B0E14] border border-[#F85149]/30 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[#F85149] font-bold text-xs font-mono">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Surefire Sandbox Assertion Failure</span>
                  </div>
                  <p className="text-xs text-[#F85149] font-mono leading-relaxed">
                    {activeTest.lastFailureMessage}
                  </p>
                  {activeTest.lastStackTrace && (
                    <div className="mt-2 p-2.5 rounded bg-[#07090E] border border-[#30363D] text-[10px] font-mono text-[#8B949E] overflow-x-auto whitespace-pre">
                      {activeTest.lastStackTrace}
                    </div>
                  )}
                </div>
              )}

              {/* Repair Custom Prompt */}
              <div className="space-y-1">
                <label className="text-xs text-[#C9D1D9] font-semibold flex items-center justify-between">
                  <span>Custom Repair Hint (Optional)</span>
                  <span className="text-[10px] font-mono text-[#8B949E]">Appended to Policy Directives</span>
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Ensure BigDecimal scale uses ROUND_HALF_UP and mock TransactionRepository..."
                  className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-md p-2 text-xs focus:outline-none focus:border-[#58A6FF]"
                />
              </div>

              {/* Current Code vs Repaired Code */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                  Current Test Code
                </h3>
                <CodeViewer
                  code={activeTest.sourceCode}
                  language="java"
                  title="Current Test Code"
                  maxHeight="max-h-52"
                />
              </div>

              {/* Repaired Output if generated */}
              {repairResult && (
                <div className="space-y-3 pt-3 border-t border-[#30363D]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[#3FB950] font-bold text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>AI Synthesized Patch & Auto-Repair Success</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded border border-[#58A6FF]/20">
                        Mutation Depth {repairResult.mutationDepth || currentDepth}
                      </span>
                      <span className="text-[10px] font-mono text-[#3FB950] bg-[#3FB950]/10 px-2 py-0.5 rounded border border-[#3FB950]/20">
                        Sandbox Verified
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#30363D] text-xs text-[#C9D1D9] space-y-1">
                    <span className="font-bold text-[#58A6FF]">Root Cause Analysis:</span>
                    <p className="text-[11px] text-[#8B949E]">{repairResult.explanation}</p>
                    {repairResult.rootCause && (
                      <p className="text-[11px] text-[#3FB950] mt-1 font-mono">
                        {repairResult.rootCause}
                      </p>
                    )}
                  </div>

                  <CodeViewer
                    code={repairResult.repairedCode}
                    language="java"
                    title={`Repaired & Verified JUnit 5 Test Code (${currentFrameworks.join(' + ')})`}
                    maxHeight="max-h-60"
                  />

                  {/* Sandbox Execution Output Log */}
                  {repairResult.sandboxLogs && repairResult.sandboxLogs.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#07090E] border border-[#30363D] space-y-1 font-mono text-[10px]">
                      <div className="flex items-center space-x-1.5 text-[#8B949E] font-bold pb-1 border-b border-[#30363D]">
                        <Terminal className="w-3.5 h-3.5 text-[#3FB950]" />
                        <span>Docker Sandbox Execution Audit Log</span>
                      </div>
                      <div className="space-y-0.5 pt-1 text-[#8B949E]">
                        {repairResult.sandboxLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className={
                              log.includes('[SUCCESS]')
                                ? 'text-[#3FB950] font-bold'
                                : log.includes('Mutation Depth')
                                ? 'text-[#58A6FF]'
                                : 'text-[#8B949E]'
                            }
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-[#8B949E] text-xs rounded-lg bg-[#161B22] border border-[#30363D]">
              Select a test from the left panel to diagnose and self-repair.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

