import React, { useState, useMemo } from 'react';
import { CodeClass, ComplexityRiskLevel, ClassComplexityMetric, MethodComplexityMetric } from '../types';
import {
  deriveProjectComplexity,
  analyzeClassComplexity,
  calculateCyclomaticComplexity,
  getRiskBadgeClasses,
} from '../utils/complexityCalculator';
import {
  GitBranch,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  Code2,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldCheck,
  Zap,
  Info,
  Play,
  RotateCcw,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface CyclomaticComplexityViewProps {
  classes: CodeClass[];
  onSelectMethodForTest?: (className: string, methodName: string, codeSnippet: string) => void;
  onNavigate?: (tab: any) => void;
}

export const CyclomaticComplexityView: React.FC<CyclomaticComplexityViewProps> = ({
  classes,
  onSelectMethodForTest,
  onNavigate,
}) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'TOTAL_DESC' | 'AVG_DESC' | 'LOC_DESC' | 'RISK_DESC'>('TOTAL_DESC');
  const [expandedClassIds, setExpandedClassIds] = useState<Set<string>>(
    new Set(classes.length > 0 ? [classes[0].id] : [])
  );
  const [selectedMethodForDetail, setSelectedMethodForDetail] = useState<MethodComplexityMetric | null>(null);

  // Playground state for interactive AST testing
  const [playgroundCode, setPlaygroundCode] = useState<string>(
    `public double calculateDiscount(double price, int customerType) {
    if (price < 0) throw new IllegalArgumentException("Price cannot be negative");
    if (price == 0.0) return 0.0;
    double discountRate;
    switch (customerType) {
        case 1: discountRate = (price > 500.0) ? 0.05 : 0.0; break;
        case 2: discountRate = (price > 1000.0) ? 0.15 : 0.10; break;
        case 3: discountRate = 0.20; break;
        case 4: discountRate = (price > 5000.0) ? 0.30 : 0.25; break;
        default: throw new IllegalArgumentException("Unsupported customer tier: " + customerType);
    }
    return BigDecimal.valueOf(price * discountRate).setScale(2, RoundingMode.HALF_UP).doubleValue();
}`
  );
  const [playgroundTargetName, setPlaygroundTargetName] = useState<string>('calculateDiscount');

  // Derive project complexity metrics
  const projectSummary = useMemo(() => {
    return deriveProjectComplexity(classes);
  }, [classes]);

  // Live calculation for playground
  const livePlaygroundResult = useMemo(() => {
    return calculateCyclomaticComplexity(playgroundCode);
  }, [playgroundCode]);

  // Toggle class expansion
  const toggleClassExpand = (classId: string) => {
    setExpandedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) {
        next.delete(classId);
      } else {
        next.add(classId);
      }
      return next;
    });
  };

  // Filter and sort classes
  const filteredClasses = useMemo(() => {
    let list = [...projectSummary.classes];

    if (selectedRiskFilter !== 'ALL') {
      if (selectedRiskFilter === 'HOTSPOTS') {
        list = list.filter((c) => c.hotspotsCount > 0);
      } else {
        list = list.filter((c) => c.riskLevel === selectedRiskFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.className.toLowerCase().includes(q) ||
          c.packageName.toLowerCase().includes(q) ||
          c.springRole.toLowerCase().includes(q) ||
          c.methods.some((m) => m.name.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'AVG_DESC':
          return b.avgMethodComplexity - a.avgMethodComplexity;
        case 'LOC_DESC':
          return b.linesOfCode - a.linesOfCode;
        case 'RISK_DESC': {
          const riskWeight: Record<ComplexityRiskLevel, number> = {
            CRITICAL: 4,
            HIGH: 3,
            MODERATE: 2,
            LOW: 1,
          };
          return riskWeight[b.riskLevel] - riskWeight[a.riskLevel] || b.totalComplexity - a.totalComplexity;
        }
        case 'TOTAL_DESC':
        default:
          return b.totalComplexity - a.totalComplexity;
      }
    });

    return list;
  }, [projectSummary, selectedRiskFilter, searchQuery, sortBy]);

  const totalMethodsCount = useMemo(() => {
    return projectSummary.classes.reduce((acc, c) => acc + c.methods.length, 0) || 1;
  }, [projectSummary]);

  return (
    <div className="space-y-6" id="cyclomatic-complexity-engine-view">
      {/* Top Metrics Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Total Project Complexity */}
        <div
          id="stat-total-complexity"
          className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 flex flex-col justify-between hover:border-[#58A6FF]/40 transition shadow-xs"
        >
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#C9D1D9] flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span>Project Complexity V(G)</span>
            </span>
            <span className="text-[10px] font-mono bg-[#1F6FEB]/15 text-[#58A6FF] px-1.5 py-0.5 rounded border border-[#1F6FEB]/30 font-semibold">
              McCabe AST
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-[#F0F6FC]">
              {projectSummary.totalProjectComplexity}
            </span>
            <span className="text-xs text-[#8B949E] font-mono">basis paths</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#30363D]/70 text-[11px] text-[#8B949E] font-mono flex items-center justify-between">
            <span>Avg / Class: <strong className="text-[#F0F6FC]">{projectSummary.avgClassComplexity}</strong></span>
            <span>Avg / Method: <strong className="text-[#F0F6FC]">{projectSummary.avgMethodComplexity}</strong></span>
          </div>
        </div>

        {/* 2. Highest Complexity Hotspot */}
        <div
          id="stat-complexity-hotspot"
          className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 flex flex-col justify-between hover:border-[#F85149]/40 transition shadow-xs"
        >
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#C9D1D9] flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-[#F85149]" />
              <span>Top Complexity Hotspot</span>
            </span>
            <span className="text-[10px] font-mono bg-[#F85149]/15 text-[#F85149] px-1.5 py-0.5 rounded border border-[#F85149]/30 font-semibold">
              High Risk
            </span>
          </div>
          <div className="mt-2">
            <div className="text-base font-bold font-mono text-[#F0F6FC] truncate" title={projectSummary.highestComplexityClass}>
              {projectSummary.highestComplexityClass}
            </div>
            <p className="text-[11px] text-[#8B949E] font-mono mt-0.5 truncate" title={projectSummary.highestComplexityMethod}>
              Method: {projectSummary.highestComplexityMethod}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-[#30363D]/70 text-[11px] text-[#8B949E] font-mono flex items-center justify-between">
            <span>Critical Hotspots:</span>
            <span className="text-[#F85149] font-bold">
              {projectSummary.riskDistribution.criticalCount + projectSummary.riskDistribution.highCount} methods
            </span>
          </div>
        </div>

        {/* 3. Basis Path Coverage Requirement */}
        <div
          id="stat-basis-paths"
          className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 flex flex-col justify-between hover:border-[#3FB950]/40 transition shadow-xs"
        >
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#C9D1D9] flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3FB950]" />
              <span>Min Tests For 100% Branch</span>
            </span>
            <span className="text-[10px] font-mono bg-[#238636]/20 text-[#3FB950] px-1.5 py-0.5 rounded border border-[#238636]/30 font-semibold">
              Target
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-[#3FB950]">
              {projectSummary.totalBasisPaths}
            </span>
            <span className="text-xs text-[#8B949E] font-mono">linearly independent paths</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#30363D]/70 text-[11px] text-[#8B949E] font-mono flex items-center justify-between">
            <span>Decision nodes detected:</span>
            <span className="text-[#F0F6FC] font-semibold">
              {projectSummary.totalBasisPaths - projectSummary.classes.reduce((acc, c) => acc + c.methods.length, 0)}
            </span>
          </div>
        </div>

        {/* 4. Maintainability Index & Density */}
        <div
          id="stat-maintainability"
          className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 flex flex-col justify-between hover:border-[#D29922]/40 transition shadow-xs"
        >
          <div className="flex items-center justify-between text-[#8B949E]">
            <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#C9D1D9] flex items-center space-x-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#E3B341]" />
              <span>Maintainability Index</span>
            </span>
            <span className="text-[10px] font-mono bg-[#D29922]/15 text-[#E3B341] px-1.5 py-0.5 rounded border border-[#D29922]/30 font-semibold">
              Grade B+
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-[#F0F6FC]">
              81.4
            </span>
            <span className="text-xs text-[#8B949E] font-mono">/ 100 (Good)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#30363D]/70 text-[11px] text-[#8B949E] font-mono flex items-center justify-between">
            <span>Complexity Density:</span>
            <span className="text-[#C9D1D9] font-semibold">18.4 / 100 LOC</span>
          </div>
        </div>
      </div>

      {/* Complexity Distribution Spectrum Bar */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold font-mono text-[#F0F6FC] uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#58A6FF]" />
              <span>Method Cyclomatic Complexity Spectrum Distribution</span>
            </h3>
            <p className="text-[11px] text-[#8B949E]">
              Classification of methods into McCabe risk tiers and basis path testing demands
            </p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-[#8B949E]">
            <span>Total Methods: <strong className="text-[#F0F6FC]">{totalMethodsCount}</strong></span>
          </div>
        </div>

        {/* Visual Multi-segment Distribution Bar */}
        <div className="w-full bg-[#0B0E14] h-3 rounded-full overflow-hidden flex border border-[#30363D]">
          {projectSummary.riskDistribution.lowCount > 0 && (
            <div
              className="bg-[#3FB950] h-full transition-all"
              style={{ width: `${(projectSummary.riskDistribution.lowCount / totalMethodsCount) * 100}%` }}
              title={`Low Risk (V(G) 1-4): ${projectSummary.riskDistribution.lowCount} methods`}
            />
          )}
          {projectSummary.riskDistribution.moderateCount > 0 && (
            <div
              className="bg-[#58A6FF] h-full transition-all"
              style={{ width: `${(projectSummary.riskDistribution.moderateCount / totalMethodsCount) * 100}%` }}
              title={`Moderate Risk (V(G) 5-7): ${projectSummary.riskDistribution.moderateCount} methods`}
            />
          )}
          {projectSummary.riskDistribution.highCount > 0 && (
            <div
              className="bg-[#D29922] h-full transition-all"
              style={{ width: `${(projectSummary.riskDistribution.highCount / totalMethodsCount) * 100}%` }}
              title={`High Risk (V(G) 8-10): ${projectSummary.riskDistribution.highCount} methods`}
            />
          )}
          {projectSummary.riskDistribution.criticalCount > 0 && (
            <div
              className="bg-[#F85149] h-full transition-all"
              style={{ width: `${(projectSummary.riskDistribution.criticalCount / totalMethodsCount) * 100}%` }}
              title={`Critical Risk (V(G) > 10): ${projectSummary.riskDistribution.criticalCount} methods`}
            />
          )}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="flex items-center space-x-2 text-xs font-mono p-2 rounded bg-[#0B0E14] border border-[#30363D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3FB950]" />
            <div className="flex-1 flex justify-between">
              <span className="text-[#8B949E]">Low (1-4)</span>
              <span className="text-[#3FB950] font-bold">{projectSummary.riskDistribution.lowCount} methods</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono p-2 rounded bg-[#0B0E14] border border-[#30363D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#58A6FF]" />
            <div className="flex-1 flex justify-between">
              <span className="text-[#8B949E]">Moderate (5-7)</span>
              <span className="text-[#58A6FF] font-bold">{projectSummary.riskDistribution.moderateCount} methods</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono p-2 rounded bg-[#0B0E14] border border-[#30363D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D29922]" />
            <div className="flex-1 flex justify-between">
              <span className="text-[#8B949E]">High (8-10)</span>
              <span className="text-[#E3B341] font-bold">{projectSummary.riskDistribution.highCount} methods</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono p-2 rounded bg-[#0B0E14] border border-[#30363D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F85149]" />
            <div className="flex-1 flex justify-between">
              <span className="text-[#8B949E]">Critical (&gt;10)</span>
              <span className="text-[#F85149] font-bold">{projectSummary.riskDistribution.criticalCount} methods</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class Scoreboard & Method Complexity Drilldown */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden shadow-sm space-y-0">
        {/* Controls Header */}
        <div className="p-4 bg-[#111622] border-b border-[#30363D] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] font-mono flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-[#58A6FF]" />
              <span>Class-by-Class Cyclomatic Complexity Scoreboard</span>
            </h3>
            <p className="text-[11px] text-[#8B949E] mt-0.5">
              Weighted Methods per Class (WMC), decision point counts, and branch testing recommendations
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search class or method..."
                className="bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-md pl-8 pr-2.5 py-1 focus:outline-none focus:border-[#58A6FF] w-44"
              />
            </div>

            {/* Risk Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#8B949E]" />
              <select
                aria-label="Filter by Risk"
                value={selectedRiskFilter}
                onChange={(e) => setSelectedRiskFilter(e.target.value)}
                className="bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-md px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HOTSPOTS">Hotspots Only (&ge;6)</option>
                <option value="CRITICAL">Critical Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="MODERATE">Moderate Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8B949E]" />
              <select
                aria-label="Sort Classes"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-md px-2 py-1 focus:outline-none cursor-pointer"
              >
                <option value="TOTAL_DESC">Highest Total V(G)</option>
                <option value="AVG_DESC">Highest Avg / Method</option>
                <option value="RISK_DESC">Highest Risk Tier</option>
                <option value="LOC_DESC">Highest LOC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className="divide-y divide-[#21262D]">
          {filteredClasses.map((cls) => {
            const isExpanded = expandedClassIds.has(cls.classId);

            return (
              <div key={cls.classId} className="hover:bg-[#1C2128]/40 transition">
                {/* Class Main Row */}
                <div
                  onClick={() => toggleClassExpand(cls.classId)}
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 rounded-md bg-[#0B0E14] border border-[#30363D] text-[#58A6FF] mt-0.5">
                      <Code2 className="w-4 h-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-sm font-mono font-bold text-[#F0F6FC]">
                          {cls.className}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
                          {cls.springRole}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getRiskBadgeClasses(cls.riskLevel)}`}>
                          {cls.riskLevel} RISK
                        </span>
                        <span className="text-[10px] font-mono text-[#8B949E]">
                          Grade: <strong className="text-[#F0F6FC]">{cls.maintainabilityRating}</strong>
                        </span>
                      </div>

                      <p className="text-xs text-[#8B949E] font-mono">
                        {cls.packageName} &bull; {cls.linesOfCode} LOC &bull; {cls.methods.length} methods
                      </p>
                    </div>
                  </div>

                  {/* Class Metrics Summary Badges */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right font-mono">
                      <div className="text-xs text-[#8B949E]">Class V(G)</div>
                      <div className="text-lg font-bold text-[#F0F6FC] flex items-center justify-end space-x-1">
                        <span>{cls.totalComplexity}</span>
                        {cls.hotspotsCount > 0 && (
                          <span className="text-[10px] text-[#F85149] bg-[#F85149]/10 px-1 rounded border border-[#F85149]/20" title={`${cls.hotspotsCount} hotspot method(s)`}>
                            {cls.hotspotsCount} 🔥
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono hidden sm:block">
                      <div className="text-xs text-[#8B949E]">Avg / Method</div>
                      <div className="text-base font-bold text-[#C9D1D9]">
                        {cls.avgMethodComplexity}
                      </div>
                    </div>

                    <div className="text-right font-mono hidden md:block">
                      <div className="text-xs text-[#8B949E]">Density</div>
                      <div className="text-base font-bold text-[#C9D1D9]">
                        {cls.complexityDensity}%
                      </div>
                    </div>

                    <button
                      className="p-1 rounded bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#30363D]"
                      aria-label="Toggle Class Details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Method-Level Complexity Breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 bg-[#0D1117] border-t border-[#21262D]/80">
                    <div className="rounded-md border border-[#30363D] overflow-hidden bg-[#161B22]">
                      <div className="px-3.5 py-2 bg-[#111622] border-b border-[#30363D] flex items-center justify-between text-xs font-mono text-[#8B949E]">
                        <span>Method Decision Nodes & McCabe Basis Path Breakdown</span>
                        <span>{cls.methods.length} methods analyzed</span>
                      </div>

                      <div className="divide-y divide-[#21262D]">
                        {cls.methods.map((method) => {
                          const dp = method.decisionPoints;
                          return (
                            <div
                              key={method.methodId}
                              className="p-3 hover:bg-[#1C2128]/50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className="text-xs font-mono font-bold text-[#F0F6FC]">
                                    {method.name}()
                                  </span>
                                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${getRiskBadgeClasses(method.riskLevel)}`}>
                                    V(G) = {method.cyclomaticComplexity}
                                  </span>
                                  <span
                                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                      method.hasExistingTest
                                        ? 'bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30'
                                        : 'bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/30'
                                    }`}
                                  >
                                    {method.hasExistingTest ? `${method.coveragePercentage}% Covered` : '0% Gapped'}
                                  </span>
                                </div>

                                <div className="text-[11px] font-mono text-[#8B949E] truncate">
                                  {method.signature}
                                </div>

                                {/* Decision Points Chips Breakdown */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                                  {dp.ifCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#C9D1D9] border border-[#30363D]">
                                      {dp.ifCount} if / else if
                                    </span>
                                  )}
                                  {dp.caseCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#C9D1D9] border border-[#30363D]">
                                      {dp.caseCount} switch case(s)
                                    </span>
                                  )}
                                  {dp.loopCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#C9D1D9] border border-[#30363D]">
                                      {dp.loopCount} loop(s)
                                    </span>
                                  )}
                                  {dp.logicalOpsCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#58A6FF] border border-[#30363D]">
                                      {dp.logicalOpsCount} logic ops (&&, ||)
                                    </span>
                                  )}
                                  {dp.ternaryCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#E3B341] border border-[#30363D]">
                                      {dp.ternaryCount} ternary (?)
                                    </span>
                                  )}
                                  {dp.throwCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-[#21262D] text-[#F85149] border border-[#30363D]">
                                      {dp.throwCount} throw(s)
                                    </span>
                                  )}
                                  <span className="text-[#8B949E] ml-1">
                                    &bull; Min <strong className="text-[#3FB950]">{method.minTestsForCoverage}</strong> JUnit test cases for full branch coverage
                                  </span>
                                </div>
                              </div>

                              {/* Method Actions */}
                              <div className="flex items-center space-x-2 self-start lg:self-center">
                                <button
                                  onClick={() => {
                                    setPlaygroundCode(method.codeSnippet);
                                    setPlaygroundTargetName(method.name);
                                    const el = document.getElementById('interactive-ast-playground');
                                    el?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] hover:text-[#F0F6FC] text-xs font-semibold rounded border border-[#30363D] transition flex items-center space-x-1 cursor-pointer"
                                  title="Inspect Control Flow in Playground"
                                >
                                  <Sliders className="w-3 h-3 text-[#8B949E]" />
                                  <span>Inspect AST</span>
                                </button>

                                <button
                                  onClick={() => {
                                    if (onSelectMethodForTest) {
                                      onSelectMethodForTest(cls.className, method.name, method.codeSnippet);
                                    } else if (onNavigate) {
                                      onNavigate('test-generation');
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-[#1F6FEB] hover:bg-[#388BFD] text-white text-xs font-semibold rounded transition flex items-center space-x-1 cursor-pointer shadow-xs"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>Generate Tests ({method.minTestsForCoverage} paths)</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredClasses.length === 0 && (
            <div className="p-8 text-center text-xs text-[#8B949E]">
              No classes matched the selected complexity risk filters.
            </div>
          )}
        </div>
      </div>

      {/* Interactive AST Cyclomatic Complexity Calculator Playground */}
      <div
        id="interactive-ast-playground"
        className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#F0F6FC] font-mono flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#E3B341]" />
              <span>Real-Time AST Cyclomatic Complexity & Decision Node Calculator</span>
            </h3>
            <p className="text-xs text-[#8B949E]">
              Test any Java method snippet or custom logic to calculate McCabe V(G) score, decision points, and basis test paths
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setPlaygroundCode(`public String resolveUserRole(int accountLevel, boolean isInternalEmployee) {
    if (isInternalEmployee) {
        return accountLevel >= 5 ? "SUPER_ADMIN" : "STAFF_OPERATOR";
    }
    return switch (accountLevel) {
        case 1 -> "STANDARD_USER";
        case 2 -> "PREMIUM_USER";
        case 3 -> "ENTERPRISE_USER";
        default -> "GUEST";
    };
}`);
                setPlaygroundTargetName('resolveUserRole');
              }}
              className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold rounded border border-[#30363D] cursor-pointer"
            >
              Load UserService
            </button>
            <button
              onClick={() => {
                setPlaygroundCode(`public boolean validateIban(String iban) {
    if (iban == null) return false;
    String clean = iban.replaceAll("\\\\s+", "").toUpperCase();
    if (clean.length() < 15 || clean.length() > 34) return false;
    return clean.matches("^[A-Z]{2}[0-9]{2}[A-Z0-9]+$");
}`);
                setPlaygroundTargetName('validateIban');
              }}
              className="px-2.5 py-1 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] text-xs font-semibold rounded border border-[#30363D] cursor-pointer"
            >
              Load PaymentService
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Code Input Area */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#8B949E] font-mono">
              <span>Java Method Source Code Snippet</span>
              <span>Live AST Evaluation</span>
            </div>
            <textarea
              value={playgroundCode}
              onChange={(e) => setPlaygroundCode(e.target.value)}
              rows={11}
              className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] font-mono text-xs p-3 rounded-lg focus:outline-none focus:border-[#58A6FF] leading-relaxed resize-y"
              placeholder="Paste Java method or class code to evaluate Cyclomatic Complexity..."
            />
          </div>

          {/* Real-Time Complexity Diagnostics Panel */}
          <div className="lg:col-span-5 rounded-lg bg-[#0B0E14] border border-[#30363D] p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-[#30363D] pb-2.5">
                <span className="text-xs font-mono font-bold text-[#8B949E]">AST Complexity Result</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getRiskBadgeClasses(livePlaygroundResult.riskLevel)}`}>
                  {livePlaygroundResult.riskLevel} RISK
                </span>
              </div>

              {/* Big Score Display */}
              <div className="my-3 flex items-center justify-between bg-[#161B22] p-3 rounded-md border border-[#30363D]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#8B949E] block">Cyclomatic Score V(G)</span>
                  <span className="text-3xl font-extrabold font-mono text-[#F0F6FC]">
                    {livePlaygroundResult.score}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-[#8B949E] block">Required Basis Paths</span>
                  <span className="text-xl font-bold text-[#3FB950]">
                    {livePlaygroundResult.minTestsForCoverage} Tests
                  </span>
                </div>
              </div>

              {/* Detailed Decision Points Breakdown */}
              <div className="space-y-1.5 text-xs font-mono">
                <span className="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">Detected Decision Nodes:</span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="flex justify-between p-1.5 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#8B949E]">if / else if:</span>
                    <span className="font-bold text-[#F0F6FC]">{livePlaygroundResult.decisionPoints.ifCount}</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#8B949E]">switch / cases:</span>
                    <span className="font-bold text-[#F0F6FC]">{livePlaygroundResult.decisionPoints.caseCount}</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#8B949E]">loops (for/while):</span>
                    <span className="font-bold text-[#F0F6FC]">{livePlaygroundResult.decisionPoints.loopCount}</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#8B949E]">logical ops (&&/||):</span>
                    <span className="font-bold text-[#58A6FF]">{livePlaygroundResult.decisionPoints.logicalOpsCount}</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#8B949E]">ternary (?):</span>
                    <span className="font-bold text-[#E3B341]">{livePlaygroundResult.decisionPoints.ternaryCount}</span>
                  </div>
                  <div className="flex justify-between p-1.5 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#8B949E]">throws / catches:</span>
                    <span className="font-bold text-[#F85149]">{livePlaygroundResult.decisionPoints.throwCount + livePlaygroundResult.decisionPoints.catchCount}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-3 space-y-1">
                <span className="text-[10px] text-[#8B949E] font-mono uppercase font-bold">QA Testing Strategy:</span>
                <ul className="space-y-1 text-[11px] text-[#C9D1D9] font-mono">
                  {livePlaygroundResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-[#3FB950] font-bold">&bull;</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                if (onSelectMethodForTest) {
                  onSelectMethodForTest('CustomSnippet', playgroundTargetName, playgroundCode);
                } else if (onNavigate) {
                  onNavigate('test-generation');
                }
              }}
              className="w-full py-2 rounded-md bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate JUnit 5 Suite for this Snippet ({livePlaygroundResult.minTestsForCoverage} Paths)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
