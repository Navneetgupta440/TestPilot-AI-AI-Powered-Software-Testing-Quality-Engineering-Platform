import React, { useState } from 'react';
import { TestRun, TestCase } from '../types';
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Terminal,
  ShieldCheck,
  RotateCcw,
  Clock,
  Wrench,
  ChevronDown,
  ChevronUp,
  Flame,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';

interface TestExecutionPageProps {
  testRuns: TestRun[];
  testCases: TestCase[];
  onExecuteSuite: () => void;
  isRunning: boolean;
  onOpenRepair: (testCase: TestCase) => void;
}

export const TestExecutionPage: React.FC<TestExecutionPageProps> = ({
  testRuns,
  testCases,
  onExecuteSuite,
  isRunning,
  onOpenRepair,
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string>(
    testRuns[0]?.id || ''
  );
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);

  const activeRun =
    testRuns.find((r) => r.id === selectedRunId) || testRuns[0];

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <PlayCircle className="w-5 h-5 text-[#3FB950]" />
            <span>Sandbox Test Runner & Container Telemetry</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Execute JUnit 5 test suites inside isolated Docker sandbox containers with Maven Surefire reports
          </p>
        </div>

        <button
          onClick={onExecuteSuite}
          disabled={isRunning}
          className="flex items-center space-x-1.5 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-md border border-[#3FB950]/30 shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <PlayCircle
            className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`}
          />
          <span>{isRunning ? 'Running Surefire Container...' : 'Execute Test Suite'}</span>
        </button>
      </div>

      {/* Sandbox Isolation Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-[#58A6FF]" />
          <div>
            <p className="text-xs font-mono font-bold text-[#F0F6FC]">
              Isolated Runner
            </p>
            <p className="text-[10px] text-[#8B949E]">
              Memory cap: 1024MB • Ephemeral fs
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center space-x-2.5">
          <Clock className="w-4 h-4 text-[#E3B341]" />
          <div>
            <p className="text-xs font-mono font-bold text-[#F0F6FC]">
              Execution Timeout
            </p>
            <p className="text-[10px] text-[#8B949E]">
              Hard limit: 30s per class
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] flex items-center space-x-2.5">
          <Terminal className="w-4 h-4 text-[#3FB950]" />
          <div>
            <p className="text-xs font-mono font-bold text-[#F0F6FC]">
              Maven Surefire XML
            </p>
            <p className="text-[10px] text-[#8B949E]">
              Automated stack trace ingestion
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Run History List | Active Run Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Run History (4 cols) */}
        <div className="lg:col-span-4 rounded-lg bg-[#161B22] border border-[#30363D] p-3.5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8B949E] px-1 flex items-center justify-between">
            <span>Execution Runs</span>
            <span className="text-[10px] font-mono text-[#58A6FF]">
              {testRuns.length} runs
            </span>
          </div>

          <div className="space-y-1.5">
            {testRuns.map((run) => {
              const isSelected = run.id === activeRun?.id;
              return (
                <button
                  key={run.id}
                  onClick={() => setSelectedRunId(run.id)}
                  className={`w-full text-left p-2.5 rounded-md text-xs transition border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F6FEB]/15 border-[#1F6FEB]/40 text-[#F0F6FC]'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold mb-1">
                    <span>{run.triggerSource}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded ${
                        run.status === 'SUCCESS'
                          ? 'bg-[#3FB950]/20 text-[#3FB950]'
                          : 'bg-[#F85149]/20 text-[#F85149]'
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono">
                    <span>
                      ✓ {run.passedCount} passed • ✗ {run.failedCount} failed
                    </span>
                    <span>{run.durationMs}ms</span>
                  </div>
                  <p className="text-[9px] text-[#8B949E] mt-1 font-mono">
                    {new Date(run.startedAt).toLocaleTimeString()}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Run Inspection (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeRun ? (
            <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-4">
              {/* Top summary metrics */}
              <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
                <div>
                  <h2 className="text-sm font-mono font-bold text-[#F0F6FC]">
                    Execution Run: {activeRun.id}
                  </h2>
                  <p className="text-[11px] text-[#8B949E] font-mono">
                    Triggered: {new Date(activeRun.startedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2 font-mono">
                  <span className="text-xs text-[#3FB950] font-bold bg-[#3FB950]/10 px-2 py-1 rounded border border-[#3FB950]/20">
                    ✓ {activeRun.passedCount} PASSED
                  </span>
                  {activeRun.failedCount > 0 && (
                    <span className="text-xs text-[#F85149] font-bold bg-[#F85149]/10 px-2 py-1 rounded border border-[#F85149]/20">
                      ✗ {activeRun.failedCount} FAILED
                    </span>
                  )}
                </div>
              </div>

              {/* Individual Test Results List */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                  Test Case Results & Stack Traces
                </h3>

                <div className="space-y-1.5">
                  {activeRun.results.map((res) => {
                    const isExpanded = expandedResultId === res.testCaseId;
                    const matchingTestCase = testCases.find(
                      (tc) => tc.id === res.testCaseId
                    );

                    return (
                      <div
                        key={res.testCaseId}
                        className="rounded-md bg-[#0B0E14] border border-[#30363D] overflow-hidden"
                      >
                        <div
                          onClick={() =>
                            setExpandedResultId(isExpanded ? null : res.testCaseId)
                          }
                          className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-[#161B22] transition"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {res.status === 'PASSED' ? (
                              <CheckCircle2 className="w-4 h-4 text-[#3FB950] shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#F85149] shrink-0" />
                            )}
                            <span className="text-xs font-mono font-bold text-[#F0F6FC]">
                              {res.testName}
                            </span>

                            {/* Flakiness Tag */}
                            {matchingTestCase?.isFlaky && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E3B341]/15 text-[#E3B341] border border-[#E3B341]/30 flex items-center space-x-1">
                                <Flame className="w-3 h-3 text-[#E3B341]" />
                                <span>FLAKY ({matchingTestCase.flakinessScore}%)</span>
                              </span>
                            )}

                            {/* Quarantined Tag */}
                            {matchingTestCase?.isQuarantined && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#A371F7]/15 text-[#D2A8FF] border border-[#A371F7]/30 flex items-center space-x-1">
                                <ShieldAlert className="w-3 h-3" />
                                <span>QUARANTINED</span>
                              </span>
                            )}

                            <span className="text-[10px] font-mono text-[#8B949E]">
                              ({res.durationMs}ms)
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {(res.status === 'FAILED' || matchingTestCase?.isFlaky) && matchingTestCase && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenRepair(matchingTestCase);
                                }}
                                className="px-2 py-0.5 rounded bg-[#D29922]/20 hover:bg-[#D29922]/30 text-[#E3B341] border border-[#D29922]/40 text-[10px] font-semibold flex items-center space-x-1 transition cursor-pointer"
                              >
                                <Wrench className="w-3 h-3" />
                                <span>{matchingTestCase.isFlaky ? 'AI Stabilize' : 'Auto-Repair'}</span>
                              </button>
                            )}
                            <button className="text-[#8B949E] hover:text-[#F0F6FC]">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Failure Details */}
                        {isExpanded && (
                          <div className="p-3 border-t border-[#30363D] bg-[#07090E] space-y-2 text-xs font-mono">
                            {res.errorMessage && (
                              <div className="text-[#F85149] font-bold">
                                Error: {res.errorMessage}
                              </div>
                            )}
                            {res.stackTrace && (
                              <div className="p-2.5 rounded bg-[#0B0E14] text-[#8B949E] text-[11px] overflow-x-auto whitespace-pre leading-relaxed border border-[#30363D]">
                                {res.stackTrace}
                              </div>
                            )}
                            {res.status === 'PASSED' && (
                              <div className="text-[#3FB950] text-[11px]">
                                All assertions satisfied successfully in Surefire sandbox.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Console Logs */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] flex items-center space-x-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#58A6FF]" />
                  <span>Maven Surefire Sandbox Raw Logs</span>
                </h3>
                <div className="p-3 rounded-md bg-[#0B0E14] border border-[#30363D] font-mono text-[11px] text-[#C9D1D9] h-40 overflow-y-auto space-y-1">
                  {activeRun.logs.map((log, idx) => (
                    <div key={idx} className="leading-tight">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#8B949E] text-xs rounded-lg bg-[#161B22] border border-[#30363D]">
              No test run selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
