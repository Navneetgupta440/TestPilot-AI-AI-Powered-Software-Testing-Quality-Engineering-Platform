import React from 'react';
import { Project, CodeClass, CodeFinding, TestCase, TestRun } from '../types';
import { DashboardMetricsSummary } from '../components/DashboardMetricsSummary';
import { TestPassTrendChart } from '../components/TestPassTrendChart';
import { FlakinessDetector } from '../components/FlakinessDetector';
import { TestPilotIcon } from '../components/TestPilotLogo';
import {
  Sparkles,
  PlayCircle,
  AlertTriangle,
  FileCode,
  Gauge,
  CheckCircle2,
  XCircle,
  TrendingUp,
  GitBranch,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  Wrench,
  ShieldAlert,
} from 'lucide-react';

interface DashboardPageProps {
  project: Project;
  classes: CodeClass[];
  findings: CodeFinding[];
  testCases: TestCase[];
  testRuns?: TestRun[];
  latestRun: TestRun | null;
  onNavigate: (tab: any) => void;
  onQuickGenerate: () => void;
  onQuickRun: () => void;
  onTestCasesUpdated?: () => void;
  onOpenRepair?: (testCase: TestCase) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  project,
  classes,
  findings,
  testCases,
  testRuns = [],
  latestRun,
  onNavigate,
  onQuickGenerate,
  onQuickRun,
  onTestCasesUpdated,
  onOpenRepair,
}) => {
  const totalMethods = classes.reduce((acc, c) => acc + c.methods.length, 0);
  const coveredMethods = classes.reduce(
    (acc, c) => acc + c.methods.filter((m) => m.hasExistingTest).length,
    0
  );
  const criticalFindings = findings.filter(
    (f) => f.severity === 'CRITICAL' || f.severity === 'BLOCKER'
  );

  return (
    <div className="space-y-5 pb-10">
      {/* Top Banner / Repository Status Bar */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <TestPilotIcon className="w-12 h-12 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20">
                  {project.framework} • {project.buildSystem}
                </span>
                <span className="text-[11px] text-[#8B949E] font-mono flex items-center space-x-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>{project.currentBranch}</span>
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight">
                {project.name}
              </h1>
              <p className="text-xs text-[#8B949E] max-w-2xl">
                {project.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onQuickGenerate}
              className="flex items-center space-x-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-semibold text-xs px-3.5 py-2 rounded-md shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Generate Tests</span>
            </button>
            <button
              onClick={onQuickRun}
              className="flex items-center space-x-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] font-semibold text-xs px-3.5 py-2 rounded-md border border-[#30363D] transition active:scale-95 cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-[#3FB950]" />
              <span>Run Suite</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Testing & Quality Intelligence Summary Component */}
      <DashboardMetricsSummary
        project={project}
        classes={classes}
        testCases={testCases}
        testRuns={testRuns}
        latestRun={latestRun}
        onNavigate={onNavigate}
        onQuickGenerate={onQuickGenerate}
        onQuickRun={onQuickRun}
      />


      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Quality Score */}
        <div
          onClick={() => onNavigate('quality-reports')}
          className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 hover:border-[#58A6FF]/50 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#8B949E] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Quality Score
            </span>
            <Gauge className="w-4 h-4 text-[#58A6FF]" />
          </div>
          <div className="flex items-baseline space-x-2.5">
            <span className="text-3xl font-extrabold font-mono text-[#F0F6FC]">
              {project.qualityScore || 78.5}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#3FB950] bg-[#3FB950]/10 px-1.5 py-0.2 rounded border border-[#3FB950]/20">
              GRADE A
            </span>
          </div>
          <p className="text-[10px] text-[#8B949E] mt-2 font-mono flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-[#3FB950]" />
            <span>Target: ≥ 80.0 for CI merge</span>
          </p>
        </div>

        {/* Coverage Percentage */}
        <div
          onClick={() => onNavigate('explorer')}
          className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 hover:border-[#3FB950]/50 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#8B949E] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Method Coverage
            </span>
            <Layers className="w-4 h-4 text-[#3FB950]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-[#F0F6FC]">
              {Math.round((coveredMethods / (totalMethods || 1)) * 100)}%
            </span>
            <span className="text-xs font-mono text-[#8B949E]">
              ({coveredMethods}/{totalMethods} methods)
            </span>
          </div>
          <div className="w-full bg-[#0B0E14] h-1.5 rounded-full mt-2.5 overflow-hidden border border-[#30363D]/50">
            <div
              className="bg-[#3FB950] h-full rounded-full"
              style={{
                width: `${(coveredMethods / (totalMethods || 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Static Findings */}
        <div
          onClick={() => onNavigate('static-analysis')}
          className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 hover:border-[#E3B341]/50 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#8B949E] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Static Rule Findings
            </span>
            <AlertTriangle className="w-4 h-4 text-[#E3B341]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-[#F0F6FC]">
              {findings.length}
            </span>
            {criticalFindings.length > 0 && (
              <span className="text-[10px] font-mono font-bold text-[#F85149] bg-[#F85149]/10 px-1.5 py-0.2 rounded border border-[#F85149]/20">
                {criticalFindings.length} Critical
              </span>
            )}
          </div>
          <p className="text-[10px] text-[#8B949E] mt-2 font-mono">
            PMD, SpotBugs, Checkstyle
          </p>
        </div>

        {/* Tests Generated */}
        <div
          onClick={() => onNavigate('test-execution')}
          className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 hover:border-[#58A6FF]/50 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-[#8B949E] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Test Suite
            </span>
            <FileCode className="w-4 h-4 text-[#58A6FF]" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-[#F0F6FC]">
              {testCases.length}
            </span>
            <span className="text-xs font-mono text-[#8B949E]">JUnit 5</span>
          </div>
          <p className="text-[10px] text-[#8B949E] mt-2 font-mono flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-[#58A6FF]" />
            <span>Sandbox Verified</span>
          </p>
        </div>
      </div>

      {/* Flakiness Detector & Intermittent Failure Monitor */}
      <FlakinessDetector
        projectId={project.id}
        testCases={testCases}
        onTestCasesUpdated={onTestCasesUpdated}
        onOpenRepairModal={onOpenRepair}
      />

      {/* Passing Test Cases Historical Trend Line Chart (Last 10 Runs) */}
      <TestPassTrendChart
        testRuns={testRuns}
        testCases={testCases}
        classes={classes}
        onNavigate={onNavigate}
        onExecuteRun={onQuickRun}
      />

      {/* Repository Test Suite Highlight List with Flakiness Indicators */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center space-x-2">
              <span>Repository Test Suite Status</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                {testCases.length} Test Cases
              </span>
            </h2>
            <p className="text-[11px] text-[#8B949E]">
              JUnit 5 & Spring Boot test cases with pass/fail telemetry and flakiness tracking
            </p>
          </div>
          <button
            onClick={() => onNavigate('test-execution')}
            className="text-xs text-[#58A6FF] hover:underline font-semibold flex items-center space-x-1 transition cursor-pointer"
          >
            <span>Open Test Runner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {testCases.map((tc) => (
            <div
              key={tc.id}
              className={`p-3 rounded-lg bg-[#0B0E14] border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                tc.isFlaky
                  ? 'border-[#E3B341]/40 hover:border-[#E3B341]'
                  : tc.executionStatus === 'FAILED'
                  ? 'border-[#F85149]/40 hover:border-[#F85149]'
                  : 'border-[#30363D] hover:border-[#8B949E]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  {tc.executionStatus === 'PASSED' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3FB950] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#F85149] shrink-0" />
                  )}
                  <span className="text-xs font-mono font-bold text-[#F0F6FC]">
                    {tc.testClassName}.{tc.testMethodName}()
                  </span>

                  {/* Flaky Badge */}
                  {tc.isFlaky && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E3B341]/15 text-[#E3B341] border border-[#E3B341]/30 flex items-center space-x-1">
                      <Flame className="w-3 h-3 text-[#E3B341]" />
                      <span>FLAKY ({tc.flakinessScore}% oscillation)</span>
                    </span>
                  )}

                  {/* Quarantined Badge */}
                  {tc.isQuarantined && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#A371F7]/15 text-[#D2A8FF] border border-[#A371F7]/30 flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>QUARANTINED</span>
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-[#8B949E] bg-[#161B22] px-1.5 py-0.2 rounded border border-[#30363D]">
                    {tc.testType}
                  </span>
                </div>

                <p className="text-[11px] text-[#8B949E] font-mono truncate max-w-2xl">
                  {tc.scenarioDescription || `Target: ${tc.targetClass}.${tc.targetMethod}()`}
                </p>

                {tc.isFlaky && tc.flakinessDescription && (
                  <p className="text-[10px] text-[#E3B341] font-mono flex items-center space-x-1">
                    <span>⚠️ Root Cause: {tc.flakinessDescription}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[11px] font-mono text-[#8B949E]">
                  {tc.durationMs ? `${tc.durationMs}ms` : '42ms'}
                </span>

                {(tc.executionStatus === 'FAILED' || tc.isFlaky) && onOpenRepair && (
                  <button
                    onClick={() => onOpenRepair(tc)}
                    className="px-2.5 py-1 rounded bg-[#D29922]/20 hover:bg-[#D29922]/30 text-[#E3B341] border border-[#D29922]/40 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>{tc.isFlaky ? 'AI Stabilize' : 'Auto-Repair'}</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('test-generation')}
                  className="p-1.5 rounded bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D] text-xs transition cursor-pointer"
                  title="View test source"
                >
                  <FileCode className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Two-Column Workflow Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: High Priority Test Gaps */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#30363D] pb-2.5">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                  High-Priority Test Gaps Requiring AI Generation
                </h2>
                <p className="text-[11px] text-[#8B949E]">
                  Ranked by cyclomatic complexity, branch depth, and business impact
                </p>
              </div>
              <button
                onClick={() => onNavigate('test-generation')}
                className="text-xs text-[#58A6FF] hover:underline font-semibold flex items-center space-x-1 transition"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {classes
                .flatMap((c) =>
                  c.methods
                    .filter((m) => !m.hasExistingTest || m.coveragePercentage < 50)
                    .map((m) => ({ ...m, className: c.name, springRole: c.springRole }))
                )
                .slice(0, 4)
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded bg-[#0B0E14] border border-[#30363D] hover:border-[#58A6FF]/40 flex items-center justify-between transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#F0F6FC]">
                          {m.className}.{m.name}()
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                            m.priorityLevel === 'CRITICAL'
                              ? 'bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/20'
                              : 'bg-[#D29922]/15 text-[#E3B341] border border-[#D29922]/20'
                          }`}
                        >
                          {m.priorityLevel} ({m.priorityScore} pts)
                        </span>
                        <span className="text-[10px] font-mono text-[#8B949E]">
                          CC: {m.cyclomaticComplexity}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8B949E] font-mono truncate max-w-lg">
                        {m.signature}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('test-generation')}
                      className="px-2.5 py-1 rounded bg-[#1F6FEB]/20 hover:bg-[#1F6FEB]/30 text-[#58A6FF] border border-[#1F6FEB]/40 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Static Findings Summary */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#30363D] pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                Deterministic Static Analysis Summary
              </h2>
              <button
                onClick={() => onNavigate('static-analysis')}
                className="text-xs text-[#58A6FF] hover:underline font-semibold flex items-center space-x-1 transition"
              >
                <span>Full inspection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {findings.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D] space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#C9D1D9]">
                      [{f.tool}] {f.rule}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        f.severity === 'CRITICAL'
                          ? 'bg-[#F85149]/20 text-[#F85149]'
                          : f.severity === 'HIGH'
                          ? 'bg-[#D29922]/20 text-[#E3B341]'
                          : 'bg-[#21262D] text-[#8B949E]'
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] line-clamp-2">
                    {f.message}
                  </p>
                  <p className="text-[10px] text-[#8B949E] font-mono">
                    {f.file}:{f.line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Latest Sandbox Execution */}
        <div className="space-y-4">
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center justify-between">
              <span>Latest Test Run</span>
              <span className="text-[9px] text-[#3FB950] font-mono bg-[#3FB950]/10 px-1.5 py-0.2 rounded border border-[#3FB950]/20">
                SANDBOX
              </span>
            </h2>

            {latestRun ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-[#0B0E14] border border-[#30363D]">
                    <p className="text-[9px] text-[#8B949E] uppercase font-mono">Passed</p>
                    <p className="text-base font-bold font-mono text-[#3FB950]">
                      {latestRun.passedCount}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-[#0B0E14] border border-[#30363D]">
                    <p className="text-[9px] text-[#8B949E] uppercase font-mono">Failed</p>
                    <p className="text-base font-bold font-mono text-[#F85149]">
                      {latestRun.failedCount}
                    </p>
                  </div>
                  <div className="p-2 rounded bg-[#0B0E14] border border-[#30363D]">
                    <p className="text-[9px] text-[#8B949E] uppercase font-mono">Duration</p>
                    <p className="text-base font-bold font-mono text-[#C9D1D9]">
                      {latestRun.durationMs}ms
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#0B0E14] font-mono text-[10px] text-[#8B949E] space-y-1 max-h-32 overflow-y-auto border border-[#30363D]">
                  {latestRun.logs.slice(-4).map((log, idx) => (
                    <div key={idx} className="truncate">
                      {log}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate('test-execution')}
                  className="w-full py-1.5 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold rounded border border-[#30363D] transition cursor-pointer"
                >
                  View Full Test Logs
                </button>
              </div>
            ) : (
              <p className="text-xs text-[#8B949E]">No test runs executed yet.</p>
            )}
          </div>

          {/* Quick RAG Assistant Prompt Card */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-2.5">
            <div className="flex items-center space-x-2 text-[#58A6FF]">
              <Sparkles className="w-4 h-4 text-[#58A6FF]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                RAG QA Copilot
              </h2>
            </div>
            <p className="text-xs text-[#8B949E] leading-relaxed">
              Ask questions about edge cases in PaymentService, generate REST Assured mock scenarios, or explain complex branches.
            </p>
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="w-full py-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-xs font-semibold rounded shadow-sm transition cursor-pointer"
            >
              Open AI Copilot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
