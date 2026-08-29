import React from 'react';
import { QualityReport } from '../types';
import {
  BarChart3,
  Gauge,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Award,
} from 'lucide-react';

interface QualityReportsPageProps {
  report: QualityReport | null;
  onRefreshReport: () => void;
}

export const QualityReportsPage: React.FC<QualityReportsPageProps> = ({
  report,
  onRefreshReport,
}) => {
  if (!report) {
    return (
      <div className="p-12 text-center text-[#8B949E] text-xs rounded-lg bg-[#161B22] border border-[#30363D]">
        Loading quality scorecard telemetry...
      </div>
    );
  }

  const scoreColor =
    report.overallScore >= 80
      ? 'text-[#3FB950] border-[#3FB950]/30 bg-[#3FB950]/10'
      : report.overallScore >= 70
      ? 'text-[#58A6FF] border-[#58A6FF]/30 bg-[#58A6FF]/10'
      : 'text-[#E3B341] border-[#E3B341]/30 bg-[#E3B341]/10';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#58A6FF]" />
            <span>TestPilot Quality Score & Executive Telemetry</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Weighted composite scoring across coverage, static rules, test pass rate, complexity, and security
          </p>
        </div>

        <button
          onClick={onRefreshReport}
          className="flex items-center space-x-2 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] font-semibold text-xs px-4 py-2 rounded-lg border border-[#30363D] transition cursor-pointer self-start sm:self-auto"
        >
          <FileCheck className="w-4 h-4 text-[#58A6FF]" />
          <span>Recalculate Quality Score</span>
        </button>
      </div>

      {/* Main Composite Scorecard Hero */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#E3B341]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8B949E]">
                Composite Production Readiness Index
              </span>
            </div>
            <div className="flex items-baseline space-x-4">
              <span className="text-5xl font-black font-mono text-[#F0F6FC]">
                {report.overallScore}
                <span className="text-xl text-[#8B949E] font-normal">/100</span>
              </span>
              <span className={`text-sm font-bold font-mono px-3 py-1 rounded-lg border ${scoreColor}`}>
                GRADE {report.grade}
              </span>
            </div>
            <p className="text-xs text-[#8B949E]">
              Report generated at: {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>

          {/* Target Status */}
          <div className="p-4 rounded-lg bg-[#0B0E14] border border-[#30363D] space-y-1.5 min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8B949E]">
              <span>CI/CD Gate Threshold</span>
              <span className="text-[#3FB950] font-mono">≥ 80.0</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-[#3FB950]">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {report.overallScore >= 80 ? 'Passed Quality Gate' : 'Below Production Gate'}
              </span>
            </div>
            <p className="text-[10px] text-[#8B949E]">
              Ready for automated PR check & merge deployment.
            </p>
          </div>
        </div>
      </div>

      {/* 6-Dimension Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'Test Coverage',
            weight: report.weights.testCoverage,
            score: report.metrics.testCoverageScore,
            desc: 'Line, branch, and method JaCoCo coverage',
          },
          {
            title: 'Static Analysis',
            weight: report.weights.staticAnalysis,
            score: report.metrics.staticAnalysisScore,
            desc: 'PMD, Checkstyle, SpotBugs compliance',
          },
          {
            title: 'Test Pass Rate',
            weight: report.weights.testPassRate,
            score: report.metrics.testPassRateScore,
            desc: 'Surefire sandbox execution stability',
          },
          {
            title: 'Code Complexity',
            weight: report.weights.codeComplexity,
            score: report.metrics.codeComplexityScore,
            desc: 'Cyclomatic complexity & nesting depth',
          },
          {
            title: 'Security Findings',
            weight: report.weights.securityFindings,
            score: report.metrics.securityFindingsScore,
            desc: 'Vulnerabilities, collision risks & credentials',
          },
          {
            title: 'Test Quality / Assertions',
            weight: report.weights.testQuality,
            score: report.metrics.testQualityScore,
            desc: 'Assertion density & mutation resistance',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F0F6FC]">{item.title}</span>
              <span className="text-[10px] font-mono text-[#8B949E] bg-[#0B0E14] px-2 py-0.5 rounded border border-[#30363D]">
                Weight: {item.weight}%
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#F0F6FC]">
                {item.score}%
              </span>
            </div>

            <div className="w-full bg-[#0B0E14] h-1.5 rounded-full overflow-hidden border border-[#30363D]/50">
              <div
                className="bg-[#58A6FF] h-full rounded-full"
                style={{ width: `${item.score}%` }}
              />
            </div>

            <p className="text-[10px] text-[#8B949E]">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Actionable Engineering Recommendations */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-3">
        <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-[#3FB950]" />
          <span>Priority Recommendations to Elevate Score to 95+</span>
        </h2>

        <div className="space-y-2">
          {report.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#0B0E14] border border-[#30363D] flex items-start space-x-3 text-xs text-[#C9D1D9]"
            >
              <span className="font-mono font-bold text-[#58A6FF] shrink-0">#{idx + 1}</span>
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
