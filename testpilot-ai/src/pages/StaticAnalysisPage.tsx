import React, { useState } from 'react';
import { CodeFinding, CodeClass } from '../types';
import { CyclomaticComplexityView } from '../components/CyclomaticComplexityView';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  GitBranch,
  FileCheck,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StaticAnalysisPageProps {
  findings: CodeFinding[];
  classes?: CodeClass[];
  onTriggerAnalysis: () => void;
  isAnalyzing: boolean;
  onSelectMethodForTest?: (className: string, methodName: string, codeSnippet: string) => void;
  onNavigate?: (tab: any) => void;
}

export const StaticAnalysisPage: React.FC<StaticAnalysisPageProps> = ({
  findings,
  classes = [],
  onTriggerAnalysis,
  isAnalyzing,
  onSelectMethodForTest,
  onNavigate,
}) => {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'COMPLEXITY' | 'RULES' | 'UNIFIED'>('COMPLEXITY');
  const [selectedTool, setSelectedTool] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);

  const tools = ['ALL', 'PMD', 'CHECKSTYLE', 'SPOTBUGS', 'JACOCO'];
  const severities = ['ALL', 'BLOCKER', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const filteredFindings = findings.filter((f) => {
    if (selectedTool !== 'ALL' && f.tool !== selectedTool) return false;
    if (selectedSeverity !== 'ALL' && f.severity !== selectedSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.rule.toLowerCase().includes(q) ||
        f.message.toLowerCase().includes(q) ||
        f.file.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'BLOCKER':
      case 'CRITICAL':
        return 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30';
      case 'HIGH':
        return 'bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/30';
      case 'MEDIUM':
        return 'bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/30';
      default:
        return 'bg-[#21262D] text-[#8B949E] border-[#30363D]';
    }
  };

  return (
    <div className="space-y-6 pb-12" id="static-analysis-engine-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-[#58A6FF]" />
            <span>Deterministic Static Analysis & Cyclomatic Complexity Engine</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Zero-hallucination McCabe AST complexity metrics, basis test paths, and PMD / Checkstyle / SpotBugs / JaCoCo static verification
          </p>
        </div>

        <button
          onClick={onTriggerAnalysis}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg border border-[#3FB950]/30 shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <ShieldAlert className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Running Static Scanners...' : 'Re-run Static Rule Suite'}</span>
        </button>
      </div>

      {/* Analysis View Mode Switcher */}
      <div className="flex items-center space-x-1 p-1 bg-[#161B22] border border-[#30363D] rounded-lg text-xs font-mono">
        <button
          onClick={() => setActiveAnalysisTab('COMPLEXITY')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition cursor-pointer font-semibold ${
            activeAnalysisTab === 'COMPLEXITY'
              ? 'bg-[#1F6FEB] text-white shadow-xs'
              : 'text-[#8B949E] hover:text-[#F0F6FC]'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Class Cyclomatic Complexity & AST Analysis</span>
        </button>

        <button
          onClick={() => setActiveAnalysisTab('RULES')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition cursor-pointer font-semibold ${
            activeAnalysisTab === 'RULES'
              ? 'bg-[#1F6FEB] text-white shadow-xs'
              : 'text-[#8B949E] hover:text-[#F0F6FC]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Static Rule Violations ({findings.length})</span>
        </button>

        <button
          onClick={() => setActiveAnalysisTab('UNIFIED')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition cursor-pointer font-semibold ${
            activeAnalysisTab === 'UNIFIED'
              ? 'bg-[#1F6FEB] text-white shadow-xs'
              : 'text-[#8B949E] hover:text-[#F0F6FC]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Unified Static Intelligence</span>
        </button>
      </div>

      {/* 1. Cyclomatic Complexity Engine View */}
      {(activeAnalysisTab === 'COMPLEXITY' || activeAnalysisTab === 'UNIFIED') && (
        <CyclomaticComplexityView
          classes={classes}
          onSelectMethodForTest={onSelectMethodForTest}
          onNavigate={onNavigate}
        />
      )}

      {/* 2. Static Rules Section */}
      {(activeAnalysisTab === 'RULES' || activeAnalysisTab === 'UNIFIED') && (
        <div className="space-y-6 pt-2">
          {activeAnalysisTab === 'UNIFIED' && (
            <div className="border-t border-[#30363D] pt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#F0F6FC] font-mono flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-[#58A6FF]" />
                <span>Deterministic Static Rule Violations</span>
              </h2>
            </div>
          )}

          {/* Rules Engine Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'PMD 7.0', count: findings.filter((f) => f.tool === 'PMD').length, desc: 'Code smells & anti-patterns' },
              { name: 'Checkstyle 10', count: findings.filter((f) => f.tool === 'CHECKSTYLE').length, desc: 'Naming & convention rules' },
              { name: 'SpotBugs 4.8', count: findings.filter((f) => f.tool === 'SPOTBUGS').length, desc: 'Null pointers & bug hazards' },
              { name: 'JaCoCo 0.8.11', count: findings.filter((f) => f.tool === 'JACOCO').length, desc: 'Uncovered branch gaps' },
            ].map((item) => (
              <div
                key={item.name}
                className="p-3.5 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#F0F6FC]">{item.name}</span>
                  <span className="text-xs font-mono font-bold text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded border border-[#58A6FF]/20">
                    {item.count}
                  </span>
                </div>
                <p className="text-[10px] text-[#8B949E]">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Filter and Search Bar */}
          <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by rule name, message, or file..."
                  className="w-full bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#58A6FF]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-[#8B949E]">Tool:</span>
                <select
                  aria-label="Filter by Tool"
                  value={selectedTool}
                  onChange={(e) => setSelectedTool(e.target.value)}
                  className="bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  {tools.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-[#8B949E]">Severity:</span>
                <select
                  aria-label="Filter by Severity"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  {severities.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Findings Data Table */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-[#111622] border-b border-[#30363D] flex items-center justify-between text-xs font-semibold text-[#8B949E]">
              <span>Static Rule Violations ({filteredFindings.length} items)</span>
              <span className="text-[11px] font-mono text-[#58A6FF]">Deterministic Static Telemetry</span>
            </div>

            <div className="divide-y divide-[#21262D]">
              {filteredFindings.map((finding) => {
                const isExpanded = expandedFindingId === finding.id;
                return (
                  <div key={finding.id} className="p-4 hover:bg-[#1C2128]/60 transition">
                    <div
                      onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                      className="flex items-start justify-between cursor-pointer gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#21262D] text-[#58A6FF] border border-[#30363D]">
                            {finding.tool}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(
                              finding.severity
                            )}`}
                          >
                            {finding.severity}
                          </span>
                          <span className="text-xs font-mono font-bold text-[#F0F6FC]">
                            {finding.rule}
                          </span>
                        </div>

                        <p className="text-xs text-[#C9D1D9] leading-relaxed">{finding.message}</p>

                        <div className="text-[11px] text-[#8B949E] font-mono flex items-center space-x-3">
                          <span>
                            File: <strong className="text-[#F0F6FC]">{finding.file}</strong>:
                            {finding.line}
                          </span>
                          <span>Category: {finding.category}</span>
                        </div>
                      </div>

                      <button className="text-[#8B949E] hover:text-[#F0F6FC] p-1" aria-label="Toggle details">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 p-3.5 rounded-lg bg-[#0B0E14] border border-[#30363D] space-y-2 text-xs">
                        <div className="flex items-center space-x-1.5 text-[#3FB950] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Recommended Remediation / Fix Strategy:</span>
                        </div>
                        <p className="text-[#C9D1D9] leading-relaxed">
                          {finding.remediationSuggestion}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFindings.length === 0 && (
                <div className="p-8 text-center text-xs text-[#8B949E]">
                  No static rule findings matched the selected filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
