import React, { useState } from 'react';
import { CodeClass, CodeMethod } from '../types';
import { CodeViewer } from '../components/CodeViewer';
import {
  Code2,
  Sparkles,
  HelpCircle,
  Shield,
  Layers,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface CodeExplorerPageProps {
  classes: CodeClass[];
  onGenerateTestForMethod: (className: string, methodName: string) => void;
  onExplainMethod: (className: string, methodName: string, snippet: string) => void;
  explanation: { methodName: string; text: string } | null;
  isExplaining: boolean;
}

export const CodeExplorerPage: React.FC<CodeExplorerPageProps> = ({
  classes,
  onGenerateTestForMethod,
  onExplainMethod,
  explanation,
  isExplaining,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?.id || ''
  );
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    classes[0]?.methods[0]?.id || ''
  );

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentMethod =
    currentClass?.methods.find((m) => m.id === selectedMethodId) ||
    currentClass?.methods[0];

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-[#58A6FF]" />
          <span>Java Code Intelligence & AST Explorer</span>
        </h1>
        <p className="text-xs text-[#8B949E] mt-1">
          AST traversal of classes, Spring stereotyping (@Service, @RestController), methods, complexity, and coverage status
        </p>
      </div>

      {/* 3-Panel Layout: Class List | Method List | Method Inspector */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Panel 1: Classes (3 cols) */}
        <div className="md:col-span-3 rounded-lg bg-[#161B22] border border-[#30363D] p-3.5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8B949E] px-1 flex items-center justify-between">
            <span>Classes</span>
            <span className="text-[10px] font-mono text-[#58A6FF]">
              {classes.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {classes.map((c) => {
              const isSelected = c.id === currentClass?.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClassId(c.id);
                    setSelectedMethodId(c.methods[0]?.id || '');
                  }}
                  className={`w-full text-left p-2.5 rounded-md text-xs transition border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F6FEB]/15 border-[#1F6FEB]/40 text-[#F0F6FC]'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold">{c.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        c.springRole === 'SERVICE'
                          ? 'bg-[#58A6FF]/20 text-[#58A6FF]'
                          : c.springRole === 'CONTROLLER'
                          ? 'bg-[#BC8CFF]/20 text-[#BC8CFF]'
                          : 'bg-[#21262D] text-[#8B949E]'
                      }`}
                    >
                      {c.springRole}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8B949E] font-mono truncate mt-0.5">
                    {c.packageName}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#8B949E] mt-1.5 font-mono">
                    <span>{c.methods.length} methods</span>
                    <span
                      className={
                        c.coveragePercentage >= 50
                          ? 'text-[#3FB950]'
                          : 'text-[#E3B341]'
                      }
                    >
                      {c.coveragePercentage}% cov
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Methods List (4 cols) */}
        <div className="md:col-span-4 rounded-lg bg-[#161B22] border border-[#30363D] p-3.5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8B949E] px-1 flex items-center justify-between">
            <span>Methods in {currentClass?.name}</span>
            <span className="text-[10px] font-mono text-[#58A6FF]">
              {currentClass?.methods.length || 0}
            </span>
          </div>

          <div className="space-y-1.5">
            {currentClass?.methods.map((m) => {
              const isSelected = m.id === currentMethod?.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethodId(m.id)}
                  className={`w-full text-left p-2.5 rounded-md text-xs transition border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F6FEB]/15 border-[#1F6FEB]/40 text-[#F0F6FC]'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono font-bold text-[#F0F6FC]">
                      {m.name}()
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        m.priorityLevel === 'CRITICAL'
                          ? 'bg-[#F85149]/20 text-[#F85149]'
                          : m.priorityLevel === 'HIGH'
                          ? 'bg-[#D29922]/20 text-[#E3B341]'
                          : 'bg-[#21262D] text-[#8B949E]'
                      }`}
                    >
                      {m.priorityLevel}
                    </span>
                  </div>

                  <p className="text-[10px] text-[#8B949E] font-mono truncate">
                    {m.signature}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#8B949E] mt-1.5 font-mono">
                    <span>CC: {m.cyclomaticComplexity}</span>
                    <span className={m.hasExistingTest ? 'text-[#3FB950]' : 'text-[#F85149]'}>
                      {m.hasExistingTest ? '✓ Tested' : '✗ Untested'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 3: Method Detail & Actions (5 cols) */}
        <div className="md:col-span-5 space-y-3.5">
          {currentMethod ? (
            <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#30363D]">
                <div>
                  <h2 className="text-sm font-mono font-bold text-[#F0F6FC]">
                    {currentClass?.name}.{currentMethod.name}()
                  </h2>
                  <p className="text-[11px] text-[#8B949E] font-mono">
                    Lines {currentMethod.startLine}–{currentMethod.endLine}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() =>
                      onExplainMethod(
                        currentClass.name,
                        currentMethod.name,
                        currentMethod.codeSnippet
                      )
                    }
                    disabled={isExplaining}
                    className="p-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold flex items-center space-x-1 transition border border-[#30363D] cursor-pointer"
                    title="Explain with AI"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#58A6FF]" />
                    <span>Explain</span>
                  </button>

                  <button
                    onClick={() =>
                      onGenerateTestForMethod(currentClass.name, currentMethod.name)
                    }
                    className="px-2.5 py-1.5 rounded-md bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Test</span>
                  </button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 rounded bg-[#0B0E14] border border-[#30363D]">
                  <p className="text-[9px] text-[#8B949E] uppercase">Complexity</p>
                  <p className="text-sm font-bold text-[#F0F6FC]">
                    {currentMethod.cyclomaticComplexity}
                  </p>
                </div>
                <div className="p-2 rounded bg-[#0B0E14] border border-[#30363D]">
                  <p className="text-[9px] text-[#8B949E] uppercase">Status</p>
                  <p
                    className={`text-[10px] font-bold mt-0.5 ${
                      currentMethod.hasExistingTest ? 'text-[#3FB950]' : 'text-[#F85149]'
                    }`}
                  >
                    {currentMethod.hasExistingTest ? 'COVERED' : 'GAP'}
                  </p>
                </div>
                <div className="p-2 rounded bg-[#0B0E14] border border-[#30363D]">
                  <p className="text-[9px] text-[#8B949E] uppercase">Priority</p>
                  <p className="text-sm font-bold text-[#E3B341]">
                    {currentMethod.priorityScore}/100
                  </p>
                </div>
              </div>

              {/* Method Snippet Viewer */}
              <CodeViewer
                code={currentMethod.codeSnippet}
                language="java"
                title={`${currentClass?.name}.${currentMethod.name}() Implementation`}
                maxHeight="max-h-64"
              />

              {/* AI Explanation Box if present */}
              {explanation && explanation.methodName === currentMethod.name && (
                <div className="p-3.5 rounded-lg bg-[#0B0E14] border border-[#30363D] space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[#58A6FF] font-bold text-xs font-mono">
                    <Zap className="w-3.5 h-3.5 text-[#58A6FF]" />
                    <span>AI Code Architecture & QA Explanation</span>
                  </div>
                  <div className="text-xs text-[#C9D1D9] leading-relaxed whitespace-pre-wrap">
                    {explanation.text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-[#8B949E] text-xs rounded-lg bg-[#161B22] border border-[#30363D]">
              Select a method from the list to inspect code and generate tests.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
