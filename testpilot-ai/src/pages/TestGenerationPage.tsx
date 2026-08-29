import React, { useState } from 'react';
import { CodeClass, TestCase } from '../types';
import { CodeViewer } from '../components/CodeViewer';
import {
  Sparkles,
  CheckCircle,
  PlayCircle,
  Wrench,
  Layers,
  Settings2,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Flame,
  ShieldAlert,
} from 'lucide-react';

interface TestGenerationPageProps {
  classes: CodeClass[];
  testCases: TestCase[];
  onGenerateTest: (payload: {
    className: string;
    methodName: string;
    testType: string;
    focusScenarios: string[];
    customPrompt?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  onExecuteTestRun: (testIds?: string[]) => void;
  onOpenRepair: (testCase: TestCase) => void;
}

export const TestGenerationPage: React.FC<TestGenerationPageProps> = ({
  classes,
  testCases,
  onGenerateTest,
  isGenerating,
  onExecuteTestRun,
  onOpenRepair,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    classes[0]?.name || 'PaymentService'
  );
  const [selectedMethod, setSelectedMethod] = useState<string>(
    classes[0]?.methods[0]?.name || 'calculateDiscount'
  );
  const [testType, setTestType] = useState<string>('UNIT_JUNIT5');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([
    'Boundary Values',
    'Null & Negative Inputs',
    'Exception Paths',
  ]);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const scenarioOptions = [
    'Boundary Values',
    'Null & Negative Inputs',
    'Exception Paths',
    'Business Rules / Tiers',
    'Concurrency / Thread Safety',
    'Mock Dependencies',
  ];

  const toggleScenario = (s: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const currentClassObj = classes.find((c) => c.name === selectedClass);
  const methods = currentClassObj?.methods || [];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateTest({
      className: selectedClass,
      methodName: selectedMethod,
      testType,
      focusScenarios: selectedScenarios,
      customPrompt,
    });
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#58A6FF]" />
            <span>AI Test Generation & Gap Elimination</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Generate production-grade JUnit 5 and Mockito test suites with project-aware RAG context
          </p>
        </div>

        <button
          onClick={() => onExecuteTestRun()}
          className="flex items-center space-x-1.5 bg-[#238636] hover:bg-[#2EA043] text-white text-xs font-semibold px-3.5 py-2 rounded-md border border-[#3FB950]/30 shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Execute All Generated Tests</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Generator Form (5 cols) */}
        <div className="lg:col-span-5 rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-[#58A6FF]" />
              <span>Configure AI Test Request</span>
            </h2>
            <span className="text-[10px] font-mono text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded border border-[#58A6FF]/20">
              Gemini 3.7 Flash
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3 text-xs">
            {/* Target Class */}
            <div className="space-y-1">
              <label className="text-[#C9D1D9] font-semibold">Target Class</label>
              <select
                aria-label="Target Class"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  const cls = classes.find((c) => c.name === e.target.value);
                  if (cls?.methods[0]) setSelectedMethod(cls.methods[0].name);
                }}
                className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-md p-2 font-mono text-xs focus:outline-none focus:border-[#58A6FF]"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.springRole}) - {c.methods.length} methods
                  </option>
                ))}
              </select>
            </div>

            {/* Target Method */}
            <div className="space-y-1">
              <label className="text-[#C9D1D9] font-semibold">Target Method</label>
              <select
                aria-label="Target Method"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-md p-2 font-mono text-xs focus:outline-none focus:border-[#58A6FF]"
              >
                {methods.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}() [Priority: {m.priorityLevel}, CC: {m.cyclomaticComplexity}]
                  </option>
                ))}
              </select>
            </div>

            {/* Framework / Test Type */}
            <div className="space-y-1">
              <label className="text-[#C9D1D9] font-semibold">Test Framework Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTestType('UNIT_JUNIT5')}
                  className={`p-2 rounded-md border text-center font-mono font-medium transition cursor-pointer ${
                    testType === 'UNIT_JUNIT5'
                      ? 'bg-[#1F6FEB]/20 border-[#58A6FF] text-[#58A6FF]'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#8B949E] hover:border-[#8B949E]'
                  }`}
                >
                  JUnit 5 Unit Test
                </button>
                <button
                  type="button"
                  onClick={() => setTestType('MOCKITO')}
                  className={`p-2 rounded-md border text-center font-mono font-medium transition cursor-pointer ${
                    testType === 'MOCKITO'
                      ? 'bg-[#1F6FEB]/20 border-[#58A6FF] text-[#58A6FF]'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#8B949E] hover:border-[#8B949E]'
                  }`}
                >
                  Mockito Mocked Test
                </button>
              </div>
            </div>

            {/* Scenario Checklist */}
            <div className="space-y-1.5">
              <label className="text-[#C9D1D9] font-semibold">
                Select Focus Edge-Case Scenarios
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {scenarioOptions.map((scenario) => {
                  const isChecked = selectedScenarios.includes(scenario);
                  return (
                    <button
                      type="button"
                      key={scenario}
                      onClick={() => toggleScenario(scenario)}
                      className={`p-1.5 rounded-md border text-left flex items-center space-x-1.5 text-[11px] transition cursor-pointer ${
                        isChecked
                          ? 'bg-[#1F6FEB]/15 border-[#1F6FEB]/50 text-[#F0F6FC]'
                          : 'bg-[#0B0E14] border-[#30363D] text-[#8B949E] hover:border-[#8B949E]'
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded flex items-center justify-center text-[9px] font-bold ${
                          isChecked ? 'bg-[#58A6FF] text-black' : 'bg-[#21262D] text-transparent'
                        }`}
                      >
                        ✓
                      </div>
                      <span className="truncate">{scenario}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="space-y-1">
              <label className="text-[#C9D1D9] font-semibold">
                Additional Instructions (Optional)
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Verify BigDecimal scale and 2FA fraud threshold..."
                className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-md p-2 text-xs focus:outline-none focus:border-[#58A6FF]"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 bg-[#1F6FEB] hover:bg-[#388BFD] disabled:opacity-50 text-white font-bold text-xs rounded-md shadow-sm flex items-center justify-center space-x-1.5 transition active:scale-98 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing with Gemini 3.7...' : 'Generate Tests with RAG'}</span>
            </button>
          </form>
        </div>

        {/* Right: Generated Test List & Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
              Generated Test Suite ({testCases.length} tests)
            </h2>
            <span className="text-xs text-[#8B949E] font-mono">
              Valid JUnit 5 Assertions
            </span>
          </div>

          <div className="space-y-3">
            {testCases.map((tc) => (
              <div
                key={tc.id}
                className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-2.5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#30363D]">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[#F0F6FC] text-xs">
                        {tc.testClassName}.{tc.testMethodName}()
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          tc.executionStatus === 'PASSED'
                            ? 'bg-[#3FB950]/20 text-[#3FB950]'
                            : tc.executionStatus === 'FAILED'
                            ? 'bg-[#F85149]/20 text-[#F85149]'
                            : 'bg-[#21262D] text-[#8B949E]'
                        }`}
                      >
                        {tc.executionStatus}
                      </span>

                      {/* Flaky Badge */}
                      {tc.isFlaky && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E3B341]/15 text-[#E3B341] border border-[#E3B341]/30 flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-[#E3B341]" />
                          <span>FLAKY ({tc.flakinessScore}%)</span>
                        </span>
                      )}

                      {/* Quarantined Badge */}
                      {tc.isQuarantined && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#A371F7]/15 text-[#D2A8FF] border border-[#A371F7]/30 flex items-center space-x-1">
                          <ShieldAlert className="w-3 h-3" />
                          <span>QUARANTINED</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8B949E]">
                      {tc.scenarioDescription}
                    </p>
                    {tc.isFlaky && tc.flakinessDescription && (
                      <p className="text-[10px] text-[#E3B341] font-mono">
                        ⚠️ Suspected: {tc.flakinessDescription}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {(tc.executionStatus === 'FAILED' || tc.isFlaky) && (
                      <button
                        onClick={() => onOpenRepair(tc)}
                        className="px-2 py-1 rounded bg-[#D29922]/20 text-[#E3B341] hover:bg-[#D29922]/30 text-xs font-semibold flex items-center space-x-1 transition border border-[#D29922]/40 cursor-pointer"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>{tc.isFlaky ? 'AI Stabilize' : 'Repair'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => onExecuteTestRun([tc.id])}
                      className="px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold flex items-center space-x-1 transition border border-[#30363D] cursor-pointer"
                    >
                      <PlayCircle className="w-3 h-3 text-[#58A6FF]" />
                      <span>Run</span>
                    </button>
                  </div>
                </div>

                <CodeViewer
                  code={tc.sourceCode}
                  language="java"
                  title={`${tc.testClassName} - ${tc.targetMethod}()`}
                  maxHeight="max-h-52"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
