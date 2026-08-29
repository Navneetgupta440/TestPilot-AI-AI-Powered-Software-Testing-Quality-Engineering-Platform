import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { TestRun, TestCase, CodeClass } from '../types';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter,
  BarChart2,
  Tag,
  Search,
  ChevronDown,
  X,
  Check,
  Shield,
  Code2,
  Boxes,
  Zap,
  Activity,
  Calculator,
  Compass,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  category: 'ALL' | 'SUITE' | 'TAG' | 'FRAMEWORK';
  subtext?: string;
  badge?: string;
  color?: string;
  ratio: number; // proportional ratio of test cases in this bucket
  failRateMultiplier?: number;
}

interface TestPassTrendChartProps {
  testRuns: TestRun[];
  testCases?: TestCase[];
  classes?: CodeClass[];
  onNavigate?: (tab: string) => void;
  onExecuteRun?: () => void;
  initialFilterId?: string;
  onFilterChange?: (filter: FilterOption) => void;
}

export type ChartViewMode = 'PASSING_ONLY' | 'PASS_VS_FAIL' | 'PASS_RATE_PCT' | 'FAILURE_FORECAST';

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  correlation: number;
  formulaStr: string;
  trendDirection: 'IMPROVING' | 'DEGRADING' | 'STABLE';
  predictedNextFailureRate: number;
  predictedNextFailedCount: number;
  predictedNextPassRate: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceText: string;
  ratePerRunDelta: number;
}

/**
 * Calculates Ordinary Least Squares (OLS) Linear Regression: y = m*x + b
 */
function calculateLinearRegression(
  points: { x: number; y: number }[]
): LinearRegressionResult {
  const n = points.length;
  if (n < 2) {
    const val = points[0]?.y ?? 0;
    return {
      slope: 0,
      intercept: val,
      rSquared: 0,
      correlation: 0,
      formulaStr: `y = ${val.toFixed(2)}`,
      trendDirection: 'STABLE',
      predictedNextFailureRate: val,
      predictedNextFailedCount: 0,
      predictedNextPassRate: 100 - val,
      riskLevel: 'LOW',
      confidenceText: 'Insufficient historical samples (N < 2)',
      ratePerRunDelta: 0,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Pearson correlation r & R² coefficient of determination
  const numeratorR = n * sumXY - sumX * sumY;
  const denomR = Math.sqrt(
    Math.max(0.000001, (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  );
  const correlation = denomR !== 0 ? numeratorR / denomR : 0;
  const rSquared = Math.max(0, Math.min(1, correlation * correlation));

  const nextX = n + 1;
  const nextRawY = slope * nextX + intercept;
  const predictedNextFailureRate = Math.max(0, Math.min(100, parseFloat(nextRawY.toFixed(1))));
  const predictedNextPassRate = parseFloat((100 - predictedNextFailureRate).toFixed(1));

  // If slope is negative, failure rate is decreasing (code stability is improving)
  const trendDirection: 'IMPROVING' | 'DEGRADING' | 'STABLE' =
    slope < -0.15 ? 'IMPROVING' : slope > 0.15 ? 'DEGRADING' : 'STABLE';

  const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
    predictedNextFailureRate > 15
      ? 'HIGH'
      : predictedNextFailureRate > 5
      ? 'MEDIUM'
      : 'LOW';

  const confidenceText =
    rSquared >= 0.75
      ? 'High Regression Reliability (R² ≥ 0.75)'
      : rSquared >= 0.45
      ? 'Moderate Regression Reliability (R² ≥ 0.45)'
      : 'Low Correlation / High Historical Variance';

  const sign = intercept >= 0 ? '+' : '-';
  const formulaStr = `y = ${slope.toFixed(2)}x ${sign} ${Math.abs(intercept).toFixed(2)}`;

  return {
    slope,
    intercept,
    rSquared,
    correlation,
    formulaStr,
    trendDirection,
    predictedNextFailureRate,
    predictedNextFailedCount: parseFloat(Math.max(0, nextRawY / 10).toFixed(1)),
    predictedNextPassRate,
    riskLevel,
    confidenceText,
    ratePerRunDelta: parseFloat(slope.toFixed(2)),
  };
}

const AVAILABLE_FILTERS: FilterOption[] = [
  {
    id: 'all',
    label: 'All Test Suites & Tags',
    category: 'ALL',
    subtext: 'Global aggregated suite execution',
    badge: '22 Tests',
    ratio: 1.0,
  },
  // Test Suites (Classes)
  {
    id: 'suite-payment-service',
    label: 'PaymentServiceTest',
    category: 'SUITE',
    subtext: 'PaymentService • Discount & Gateway logic',
    badge: '8 Tests',
    ratio: 0.36,
    color: '#58A6FF',
  },
  {
    id: 'suite-user-service',
    label: 'UserServiceTest',
    category: 'SUITE',
    subtext: 'UserService • Roles, Auth & Password strength',
    badge: '8 Tests',
    ratio: 0.36,
    color: '#A371F7',
    failRateMultiplier: 1.3,
  },
  {
    id: 'suite-payment-controller',
    label: 'PaymentControllerTest',
    category: 'SUITE',
    subtext: 'PaymentController • REST API & HTTP validation',
    badge: '6 Tests',
    ratio: 0.28,
    color: '#3FB950',
  },
  {
    id: 'suite-all-services',
    label: 'All Service Layer Suites',
    category: 'SUITE',
    subtext: 'PaymentServiceTest + UserServiceTest',
    badge: '16 Tests',
    ratio: 0.72,
    color: '#58A6FF',
  },
  {
    id: 'suite-all-controllers',
    label: 'All Controller Layer Suites',
    category: 'SUITE',
    subtext: 'PaymentControllerTest',
    badge: '6 Tests',
    ratio: 0.28,
    color: '#3FB950',
  },
  // Tags
  {
    id: 'tag-unit',
    label: '@Tag("unit")',
    category: 'TAG',
    subtext: 'Fast isolated unit tests (no Spring context)',
    badge: '12 Tests',
    ratio: 0.55,
    color: '#3FB950',
  },
  {
    id: 'tag-integration',
    label: '@Tag("integration")',
    category: 'TAG',
    subtext: 'Spring Boot context & MockMvc tests',
    badge: '7 Tests',
    ratio: 0.32,
    color: '#58A6FF',
  },
  {
    id: 'tag-security',
    label: '@Tag("security")',
    category: 'TAG',
    subtext: '2FA verification, password entropy, anti-fraud',
    badge: '6 Tests',
    ratio: 0.27,
    color: '#F85149',
    failRateMultiplier: 1.5,
  },
  {
    id: 'tag-boundary-analysis',
    label: '@Tag("boundary-analysis")',
    category: 'TAG',
    subtext: 'Min/max amounts, empty strings, tier edges',
    badge: '7 Tests',
    ratio: 0.32,
    color: '#D2A8FF',
  },
  {
    id: 'tag-basis-path',
    label: '@Tag("basis-path")',
    category: 'TAG',
    subtext: 'McCabe cyclomatic complexity branch paths',
    badge: '9 Tests',
    ratio: 0.41,
    color: '#58A6FF',
  },
  {
    id: 'tag-smoke',
    label: '@Tag("smoke")',
    category: 'TAG',
    subtext: 'Fast CI gate smoke tests',
    badge: '5 Tests',
    ratio: 0.23,
    color: '#3FB950',
  },
  {
    id: 'tag-regression',
    label: '@Tag("regression")',
    category: 'TAG',
    subtext: 'Full business regression safety suite',
    badge: '14 Tests',
    ratio: 0.64,
    color: '#8B949E',
  },
  // Test Types / Frameworks
  {
    id: 'framework-junit5',
    label: 'JUnit 5 (@Test)',
    category: 'FRAMEWORK',
    subtext: 'Pure JUnit Jupiter assertion suite',
    badge: '13 Tests',
    ratio: 0.59,
    color: '#3FB950',
  },
  {
    id: 'framework-mockito',
    label: 'Mockito Mocks (@MockBean)',
    category: 'FRAMEWORK',
    subtext: 'Isolated mocks and stubbed collaborators',
    badge: '6 Tests',
    ratio: 0.27,
    color: '#58A6FF',
  },
  {
    id: 'framework-springboot',
    label: 'SpringBootTest (@SpringBootTest)',
    category: 'FRAMEWORK',
    subtext: 'Full application context integration tests',
    badge: '5 Tests',
    ratio: 0.23,
    color: '#A371F7',
  },
  {
    id: 'framework-restassured',
    label: 'REST Assured (API Specs)',
    category: 'FRAMEWORK',
    subtext: 'Contract & HTTP response assertions',
    badge: '4 Tests',
    ratio: 0.18,
    color: '#D2A8FF',
  },
];

export const TestPassTrendChart: React.FC<TestPassTrendChartProps> = ({
  testRuns,
  testCases = [],
  classes = [],
  onNavigate,
  onExecuteRun,
  initialFilterId = 'all',
  onFilterChange,
}) => {
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('PASSING_ONLY');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedFilterId, setSelectedFilterId] = useState<string>(initialFilterId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState<'ALL' | 'SUITE' | 'TAG' | 'FRAMEWORK'>('ALL');
  const [showForecastOverlay, setShowForecastOverlay] = useState(true);
  const [forecastHorizon, setForecastHorizon] = useState<number>(3); // Project 1, 2, or 3 runs ahead

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFilter = useMemo(() => {
    return AVAILABLE_FILTERS.find((f) => f.id === selectedFilterId) || AVAILABLE_FILTERS[0];
  }, [selectedFilterId]);

  const handleSelectFilter = (filter: FilterOption) => {
    setSelectedFilterId(filter.id);
    setIsDropdownOpen(false);
    onFilterChange?.(filter);
  };

  // Filtered list of options for the dropdown
  const filteredDropdownOptions = useMemo(() => {
    return AVAILABLE_FILTERS.filter((opt) => {
      const matchesSearch =
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (opt.subtext && opt.subtext.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        categoryTab === 'ALL' || opt.category === categoryTab || opt.category === 'ALL';
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryTab]);

  // Take the last 10 test runs in chronological order (oldest to newest) and apply filter
  const historicalRunsData = useMemo(() => {
    const recent = testRuns.slice(0, 10).reverse();

    const baseRuns =
      recent.length > 0
        ? recent
        : [
            {
              id: 'run-1',
              passedCount: 10,
              failedCount: 5,
              totalTests: 15,
              errorCount: 0,
              durationMs: 620,
              triggerType: 'MANUAL' as const,
              startedAt: '2026-08-27T10:00:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-2',
              passedCount: 11,
              failedCount: 4,
              totalTests: 15,
              errorCount: 0,
              durationMs: 580,
              triggerType: 'MANUAL' as const,
              startedAt: '2026-08-27T14:30:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-3',
              passedCount: 13,
              failedCount: 3,
              totalTests: 16,
              errorCount: 0,
              durationMs: 540,
              triggerType: 'MANUAL' as const,
              startedAt: '2026-08-27T18:00:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-4',
              passedCount: 12,
              failedCount: 4,
              totalTests: 16,
              errorCount: 0,
              durationMs: 560,
              triggerType: 'CI_WEBHOOK' as const,
              startedAt: '2026-08-27T22:10:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-5',
              passedCount: 14,
              failedCount: 3,
              totalTests: 17,
              errorCount: 0,
              durationMs: 510,
              triggerType: 'MANUAL' as const,
              startedAt: '2026-08-28T06:50:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-6',
              passedCount: 15,
              failedCount: 3,
              totalTests: 18,
              errorCount: 0,
              durationMs: 490,
              triggerType: 'MANUAL' as const,
              startedAt: '2026-08-28T09:15:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-7',
              passedCount: 17,
              failedCount: 2,
              totalTests: 19,
              errorCount: 0,
              durationMs: 460,
              triggerType: 'CI_WEBHOOK' as const,
              startedAt: '2026-08-28T11:30:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-8',
              passedCount: 18,
              failedCount: 2,
              totalTests: 20,
              errorCount: 0,
              durationMs: 440,
              triggerType: 'AI_AUTOREPAIR' as const,
              startedAt: '2026-08-28T14:05:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-9',
              passedCount: 20,
              failedCount: 1,
              totalTests: 21,
              errorCount: 0,
              durationMs: 410,
              triggerType: 'MANUAL' as const,
              startedAt: '2026-08-28T16:20:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
            {
              id: 'run-10',
              passedCount: 21,
              failedCount: 1,
              totalTests: 22,
              errorCount: 0,
              durationMs: 385,
              triggerType: 'CI_WEBHOOK' as const,
              startedAt: '2026-08-28T18:45:00Z',
              results: [],
              logs: [],
              projectId: '',
              executionEnvironment: 'DOCKER_ISOLATED_SANDBOX' as const,
              status: 'COMPLETED' as const,
            },
          ];

    const isAll = activeFilter.category === 'ALL';
    const ratio = activeFilter.ratio || 1.0;
    const failMultiplier = activeFilter.failRateMultiplier || 1.0;

    return baseRuns.map((run, index) => {
      const rawTotal =
        run.totalTests || run.passedCount + run.failedCount + (run.errorCount || 0) || 1;
      const rawPassed = run.passedCount;
      const rawFailed = run.failedCount;

      let passed: number;
      let failed: number;
      let total: number;

      if (isAll) {
        passed = rawPassed;
        failed = rawFailed;
        total = rawTotal;
      } else {
        total = Math.max(1, Math.round(rawTotal * ratio));
        const adjustedFail = Math.min(
          total,
          Math.max(0, Math.round(rawFailed * ratio * failMultiplier))
        );
        passed = Math.max(0, total - adjustedFail);
        failed = adjustedFail;
      }

      const passRate = Math.round((passed / Math.max(1, total)) * 100);
      const failRate = parseFloat(((failed / Math.max(1, total)) * 100).toFixed(1));
      const shortTime = run.startedAt
        ? new Date(run.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `T-${10 - index}`;

      return {
        runNumber: index + 1,
        label: `Run #${index + 1}`,
        runId: run.id,
        passed,
        failed,
        errorCount: 0,
        total,
        passRate,
        failRate,
        durationMs: isAll
          ? run.durationMs || 0
          : Math.round((run.durationMs || 0) * (0.3 + ratio * 0.7)),
        trigger: run.triggerType || 'MANUAL',
        time: shortTime,
        status: run.status,
        isForecast: false,
      };
    });
  }, [testRuns, activeFilter]);

  // Linear Regression on Historical Failure Rates: x = runNumber (1..10), y = failRate (%)
  const failureRegression = useMemo(() => {
    const points = historicalRunsData.map((d) => ({
      x: d.runNumber,
      y: d.failRate,
    }));
    return calculateLinearRegression(points);
  }, [historicalRunsData]);

  // Linear Regression on Historical Failure Counts: x = runNumber, y = failed
  const failedCountRegression = useMemo(() => {
    const points = historicalRunsData.map((d) => ({
      x: d.runNumber,
      y: d.failed,
    }));
    return calculateLinearRegression(points);
  }, [historicalRunsData]);

  // Complete Chart Data: Historical Points + Fitted Regression + Projected Future Runs
  const chartData = useMemo(() => {
    const n = historicalRunsData.length;
    const lastHistorical = historicalRunsData[n - 1] || {
      total: 22,
      passed: 21,
      failed: 1,
      failRate: 4.5,
      passRate: 95.5,
      durationMs: 385,
    };

    // 1. Process historical items and overlay fitted OLS regression line
    const formattedHistorical = historicalRunsData.map((d) => {
      const regressedFailRate = Math.max(
        0,
        Math.min(100, parseFloat((failureRegression.slope * d.runNumber + failureRegression.intercept).toFixed(1)))
      );
      const regressedFailed = Math.max(
        0,
        parseFloat((failedCountRegression.slope * d.runNumber + failedCountRegression.intercept).toFixed(1))
      );
      const regressedPassRate = parseFloat((100 - regressedFailRate).toFixed(1));

      return {
        ...d,
        regressedFailRate,
        regressedFailed,
        regressedPassRate,
        predictedFailRate: regressedFailRate,
        predictedPassRate: regressedPassRate,
        predictedFailed: regressedFailed,
        forecastLine: regressedFailRate, // continuous line across all points
      };
    });

    // If user has forecast overlay enabled, add future projected runs (e.g. Run #11, Run #12, Run #13)
    const futureRuns = [];
    if (showForecastOverlay && forecastHorizon > 0) {
      for (let i = 1; i <= forecastHorizon; i++) {
        const futureRunNumber = n + i;
        const predFailRate = Math.max(
          0,
          Math.min(
            100,
            parseFloat(
              (
                failureRegression.slope * futureRunNumber +
                failureRegression.intercept
              ).toFixed(1)
            )
          )
        );
        const predPassRate = parseFloat((100 - predFailRate).toFixed(1));
        const predFailedCount = Math.max(
          0,
          parseFloat(
            (
              failedCountRegression.slope * futureRunNumber +
              failedCountRegression.intercept
            ).toFixed(1)
          )
        );
        const estTotal = lastHistorical.total;
        const estPassed = Math.max(0, Math.round(estTotal - predFailedCount));

        futureRuns.push({
          runNumber: futureRunNumber,
          label: `Run #${futureRunNumber} (Est)`,
          runId: `forecast-${futureRunNumber}`,
          passed: undefined, // undefined so solid actual line stops cleanly at run 10
          failed: undefined,
          errorCount: 0,
          total: estTotal,
          passRate: undefined,
          failRate: undefined,
          durationMs: Math.max(200, Math.round(lastHistorical.durationMs * 0.95)),
          trigger: 'PREDICTIVE_OLS',
          time: `Est +${i}`,
          status: 'ESTIMATED' as const,
          isForecast: true,
          predictedFailRate: predFailRate,
          predictedPassRate: predPassRate,
          predictedFailed: predFailedCount,
          predictedPassed: estPassed,
          forecastLine: predFailRate,
          regressedFailRate: predFailRate,
          regressedPassRate: predPassRate,
          regressedFailed: predFailedCount,
        });
      }
    }

    return [...formattedHistorical, ...futureRuns];
  }, [
    historicalRunsData,
    failureRegression,
    failedCountRegression,
    showForecastOverlay,
    forecastHorizon,
  ]);

  // Derived Trend Metrics across historical runs
  const trendStats = useMemo(() => {
    if (historicalRunsData.length === 0) {
      return {
        currentPassing: 0,
        startPassing: 0,
        netDelta: 0,
        pctDelta: 0,
        isPositive: true,
        avgPassing: '0',
        maxPassing: 0,
        avgPassRate: 0,
        latestPassRate: 0,
        latestFailRate: 0,
        avgDuration: 0,
      };
    }

    const first = historicalRunsData[0];
    const last = historicalRunsData[historicalRunsData.length - 1];
    const netDelta = last.passed - first.passed;
    const pctDelta = first.passed > 0 ? Math.round((netDelta / first.passed) * 100) : 100;
    const totalPassedSum = historicalRunsData.reduce((acc, d) => acc + d.passed, 0);
    const avgPassing = (totalPassedSum / historicalRunsData.length).toFixed(1);
    const maxPassing = Math.max(...historicalRunsData.map((d) => d.passed));
    const avgPassRate = Math.round(
      historicalRunsData.reduce((acc, d) => acc + d.passRate, 0) / historicalRunsData.length
    );
    const avgDuration = Math.round(
      historicalRunsData.reduce((acc, d) => acc + d.durationMs, 0) / historicalRunsData.length
    );

    return {
      currentPassing: last.passed,
      startPassing: first.passed,
      netDelta,
      pctDelta,
      isPositive: netDelta >= 0,
      avgPassing,
      maxPassing,
      avgPassRate,
      latestPassRate: last.passRate,
      latestFailRate: last.failRate,
      avgDuration,
    };
  }, [historicalRunsData]);

  // Selected run details if user clicked or hovered
  const activeSelectedRun = useMemo(() => {
    if (!selectedRunId) return historicalRunsData[historicalRunsData.length - 1];
    return chartData.find((d) => d.runId === selectedRunId) || historicalRunsData[historicalRunsData.length - 1];
  }, [selectedRunId, chartData, historicalRunsData]);

  // Quick filter presets shown as chips below header
  const quickFilterPresets = [
    { id: 'all', label: 'All Suites' },
    { id: 'suite-payment-service', label: 'PaymentServiceTest' },
    { id: 'suite-user-service', label: 'UserServiceTest' },
    { id: 'suite-payment-controller', label: 'PaymentControllerTest' },
    { id: 'tag-unit', label: '@unit' },
    { id: 'tag-security', label: '@security' },
    { id: 'tag-integration', label: '@integration' },
    { id: 'tag-boundary-analysis', label: '@boundary' },
  ];

  // Custom Tooltip with Predictive Regression details
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isForecasting = data.isForecast;

      return (
        <div className="bg-[#161B22]/95 backdrop-blur-md border border-[#30363D] p-3 rounded-lg shadow-xl text-xs font-mono space-y-2 z-50 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-1.5">
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-[#F0F6FC]">{label}</span>
                {isForecasting && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E3B341]/20 text-[#E3B341] border border-[#E3B341]/40 font-bold flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Predictive OLS</span>
                  </span>
                )}
              </div>
              {activeFilter.category !== 'ALL' && (
                <div className="text-[10px] text-[#58A6FF] truncate max-w-[150px]">
                  {activeFilter.label}
                </div>
              )}
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border ${
                isForecasting
                  ? 'bg-[#E3B341]/15 text-[#E3B341] border-[#E3B341]/30'
                  : 'bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/20'
              }`}
            >
              {isForecasting ? 'FORECAST' : data.trigger}
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            {isForecasting ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E] flex items-center space-x-1">
                    <Calculator className="w-3 h-3 text-[#E3B341]" />
                    <span>Est. Failure Rate:</span>
                  </span>
                  <span className="font-bold text-[#E3B341]">{data.predictedFailRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E] flex items-center space-x-1">
                    <XCircle className="w-3 h-3 text-[#F85149]" />
                    <span>Est. Failures:</span>
                  </span>
                  <span className="font-bold text-[#F85149]">~{data.predictedFailed} tests</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E] flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-[#3FB950]" />
                    <span>Est. Passing:</span>
                  </span>
                  <span className="font-bold text-[#3FB950]">{data.predictedPassed} tests</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E]">Est. Pass Rate:</span>
                  <span className="font-bold text-[#58A6FF]">{data.predictedPassRate}%</span>
                </div>
                <div className="p-1.5 rounded bg-[#0B0E14] border border-[#30363D] text-[10px] text-[#8B949E]">
                  Formula: <span className="text-[#E3B341] font-semibold">{failureRegression.formulaStr}</span> (R² = {failureRegression.rSquared.toFixed(2)})
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E] flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-[#3FB950]" />
                    <span>Passing Tests:</span>
                  </span>
                  <span className="font-bold text-[#3FB950]">{data.passed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E] flex items-center space-x-1">
                    <XCircle className="w-3 h-3 text-[#F85149]" />
                    <span>Failed Tests:</span>
                  </span>
                  <span className="font-bold text-[#F85149]">{data.failed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E] flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 text-[#E3B341]" />
                    <span>Failure Rate:</span>
                  </span>
                  <span className="font-bold text-[#E3B341]">{data.failRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E] flex items-center space-x-1">
                    <Calculator className="w-3 h-3 text-[#8B949E]" />
                    <span>Regression Fit:</span>
                  </span>
                  <span className="font-mono text-[#D2A8FF]">{data.regressedFailRate}% fail</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#30363D]/60">
                  <span className="text-[#8B949E]">Pass Rate:</span>
                  <span className="font-bold text-[#58A6FF]">{data.passRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8B949E] flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-[#8B949E]" />
                    <span>Duration:</span>
                  </span>
                  <span className="text-[#8B949E]">{data.durationMs}ms</span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="test-pass-trend-card" className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 shadow-sm space-y-4">
      {/* Header & Main Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#30363D] pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center space-x-1.5">
              <BarChart2 className="w-4 h-4 text-[#3FB950]" />
              <span>Test Pass & Predictive Failure Forecast Trend</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3FB950]/15 text-[#3FB950] border border-[#3FB950]/30 font-semibold">
              Live Recharts
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3B341]/15 text-[#E3B341] border border-[#E3B341]/30 font-semibold flex items-center space-x-1">
              <Calculator className="w-2.5 h-2.5" />
              <span>Linear Regression OLS</span>
            </span>
            {activeFilter.category !== 'ALL' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30 font-semibold flex items-center space-x-1">
                <Tag className="w-2.5 h-2.5" />
                <span>Filter: {activeFilter.label}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#8B949E]">
            Historical test results across 10 execution cycles with ordinary least squares (OLS) linear regression forecasting for upcoming CI runs
          </p>
        </div>

        {/* Action Controls: Filter Dropdown + View Mode Tabs */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Custom Dropdown Filter */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="trend-chart-filter-dropdown-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-semibold border transition cursor-pointer ${
                activeFilter.category !== 'ALL'
                  ? 'bg-[#1F6FEB]/15 text-[#58A6FF] border-[#1F6FEB]/50 hover:bg-[#1F6FEB]/25'
                  : 'bg-[#0B0E14] text-[#C9D1D9] border-[#30363D] hover:border-[#58A6FF]/50'
              }`}
            >
              <Filter className={`w-3.5 h-3.5 ${activeFilter.category !== 'ALL' ? 'text-[#58A6FF]' : 'text-[#8B949E]'}`} />
              <span className="font-mono max-w-[140px] truncate">{activeFilter.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8B949E] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Modal */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-[#161B22] border border-[#30363D] shadow-2xl z-50 p-3 space-y-3">
                {/* Search Header */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8B949E]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search test suite, class, or tag..."
                    className="w-full bg-[#0B0E14] border border-[#30363D] rounded-md pl-8 pr-7 py-1.5 text-xs text-[#F0F6FC] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF]"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-[#8B949E] hover:text-[#F0F6FC]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills inside Dropdown */}
                <div className="flex items-center space-x-1 border-b border-[#30363D] pb-2 text-[11px]">
                  {(['ALL', 'SUITE', 'TAG', 'FRAMEWORK'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryTab(cat)}
                      className={`px-2 py-1 rounded font-mono transition cursor-pointer ${
                        categoryTab === cat
                          ? 'bg-[#58A6FF]/20 text-[#58A6FF] font-bold'
                          : 'text-[#8B949E] hover:text-[#C9D1D9]'
                      }`}
                    >
                      {cat === 'ALL' ? 'All' : cat === 'SUITE' ? 'Suites' : cat === 'TAG' ? 'Tags' : 'Types'}
                    </button>
                  ))}
                </div>

                {/* Filter Options List */}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredDropdownOptions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#8B949E]">
                      No test suites or tags matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredDropdownOptions.map((option) => {
                      const isSelected = option.id === selectedFilterId;
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelectFilter(option)}
                          className={`w-full text-left p-2 rounded-md flex items-start justify-between gap-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#1F6FEB]/20 border border-[#1F6FEB]/40 text-[#F0F6FC]'
                              : 'hover:bg-[#21262D] text-[#C9D1D9]'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-1.5">
                              {option.category === 'SUITE' && <Code2 className="w-3.5 h-3.5 text-[#58A6FF] shrink-0" />}
                              {option.category === 'TAG' && <Tag className="w-3.5 h-3.5 text-[#A371F7] shrink-0" />}
                              {option.category === 'FRAMEWORK' && <Zap className="w-3.5 h-3.5 text-[#3FB950] shrink-0" />}
                              {option.category === 'ALL' && <Boxes className="w-3.5 h-3.5 text-[#3FB950] shrink-0" />}
                              <span className="font-mono text-xs font-semibold truncate">{option.label}</span>
                            </div>
                            {option.subtext && (
                              <p className="text-[10px] text-[#8B949E] truncate pl-5">
                                {option.subtext}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0 pt-0.5">
                            {option.badge && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B0E14] text-[#8B949E] border border-[#30363D]">
                                {option.badge}
                              </span>
                            )}
                            {isSelected && <Check className="w-4 h-4 text-[#58A6FF]" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer Reset */}
                {selectedFilterId !== 'all' && (
                  <div className="pt-2 border-t border-[#30363D] flex justify-end">
                    <button
                      onClick={() => handleSelectFilter(AVAILABLE_FILTERS[0])}
                      className="text-xs text-[#58A6FF] hover:underline flex items-center space-x-1 cursor-pointer font-semibold"
                    >
                      <X className="w-3 h-3" />
                      <span>Reset to All Suites & Tags</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View Mode Toggle Controls */}
          <div className="flex items-center space-x-1 bg-[#0B0E14] p-1 rounded-md border border-[#30363D]">
            <button
              onClick={() => setChartViewMode('PASSING_ONLY')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                viewMode === 'PASSING_ONLY'
                  ? 'bg-[#3FB950]/20 text-[#3FB950] border border-[#3FB950]/40'
                  : 'text-[#8B949E] hover:text-[#C9D1D9]'
              }`}
            >
              Passing Curve
            </button>
            <button
              onClick={() => setChartViewMode('PASS_VS_FAIL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                viewMode === 'PASS_VS_FAIL'
                  ? 'bg-[#1F6FEB]/20 text-[#58A6FF] border border-[#1F6FEB]/40'
                  : 'text-[#8B949E] hover:text-[#C9D1D9]'
              }`}
            >
              Pass vs Fail
            </button>
            <button
              onClick={() => setChartViewMode('PASS_RATE_PCT')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                viewMode === 'PASS_RATE_PCT'
                  ? 'bg-[#A371F7]/20 text-[#D2A8FF] border border-[#A371F7]/40'
                  : 'text-[#8B949E] hover:text-[#C9D1D9]'
              }`}
            >
              Pass Rate %
            </button>
            <button
              onClick={() => setChartViewMode('FAILURE_FORECAST')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition cursor-pointer flex items-center space-x-1 ${
                viewMode === 'FAILURE_FORECAST'
                  ? 'bg-[#E3B341]/20 text-[#E3B341] border border-[#E3B341]/40'
                  : 'text-[#8B949E] hover:text-[#E3B341]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#E3B341]" />
              <span>Failure Forecast</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filter Pill Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-[11px] text-[#8B949E] uppercase font-bold shrink-0 mr-1 flex items-center space-x-1">
          <Filter className="w-3 h-3" />
          <span>Quick:</span>
        </span>
        {quickFilterPresets.map((preset) => {
          const isSelected = selectedFilterId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => {
                const opt = AVAILABLE_FILTERS.find((f) => f.id === preset.id);
                if (opt) handleSelectFilter(opt);
              }}
              className={`px-2.5 py-1 rounded-full text-xs transition cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-[#58A6FF]/20 text-[#58A6FF] border-[#58A6FF]/50 font-bold shadow-sm'
                  : 'bg-[#0B0E14] text-[#8B949E] border-[#30363D] hover:text-[#C9D1D9] hover:border-[#8B949E]/50'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Predictive Linear Regression Analytics Summary Card */}
      <div className="rounded-lg bg-[#0B0E14] border border-[#30363D] p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D]/60 pb-2.5">
          <div className="flex items-center space-x-2 flex-wrap">
            <div className="p-1 rounded bg-[#E3B341]/20 text-[#E3B341]">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold font-mono text-[#F0F6FC]">
              OLS Linear Regression Failure Forecast Model
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262D] text-[#D2A8FF] border border-[#30363D]">
              {failureRegression.formulaStr}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B22] text-[#8B949E] border border-[#30363D]">
              R² = {failureRegression.rSquared.toFixed(3)}
            </span>
          </div>

          {/* Forecasting Controls: Horizon + Toggle */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1 bg-[#161B22] px-2 py-1 rounded border border-[#30363D]">
              <span className="text-[10px] text-[#8B949E] uppercase font-mono">Horizon:</span>
              {[1, 2, 3].map((h) => (
                <button
                  key={h}
                  onClick={() => setForecastHorizon(h)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition cursor-pointer ${
                    forecastHorizon === h
                      ? 'bg-[#E3B341]/30 text-[#E3B341] font-bold'
                      : 'text-[#8B949E] hover:text-[#C9D1D9]'
                  }`}
                >
                  +{h}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowForecastOverlay(!showForecastOverlay)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition cursor-pointer border flex items-center space-x-1 ${
                showForecastOverlay
                  ? 'bg-[#E3B341]/20 text-[#E3B341] border-[#E3B341]/40'
                  : 'bg-[#161B22] text-[#8B949E] border-[#30363D]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{showForecastOverlay ? 'Forecast ON' : 'Forecast OFF'}</span>
            </button>
          </div>
        </div>

        {/* Regression Forecast Insights Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]/80">
            <span className="text-[10px] text-[#8B949E] uppercase font-mono block">
              Estimated Next Run (#11) Fail Rate
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-lg font-bold font-mono text-[#E3B341]">
                {failureRegression.predictedNextFailureRate}%
              </span>
              <span className="text-[10px] text-[#8B949E] font-mono">
                (~{failureRegression.predictedNextFailedCount} failed)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]/80">
            <span className="text-[10px] text-[#8B949E] uppercase font-mono block">
              Trend Velocity (Slope m)
            </span>
            <div className="flex items-center space-x-1.5 mt-1">
              {failureRegression.slope < 0 ? (
                <TrendingDown className="w-4 h-4 text-[#3FB950]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-[#F85149]" />
              )}
              <span
                className={`text-lg font-bold font-mono ${
                  failureRegression.slope < 0 ? 'text-[#3FB950]' : 'text-[#F85149]'
                }`}
              >
                {failureRegression.ratePerRunDelta > 0
                  ? `+${failureRegression.ratePerRunDelta}%`
                  : `${failureRegression.ratePerRunDelta}%`}
              </span>
              <span className="text-[10px] text-[#8B949E] font-mono">/ run</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]/80">
            <span className="text-[10px] text-[#8B949E] uppercase font-mono block">
              Predicted Next Pass Rate
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-lg font-bold font-mono text-[#58A6FF]">
                {failureRegression.predictedNextPassRate}%
              </span>
              <span className="text-[10px] text-[#3FB950] font-mono">
                (Merge Gate Safe)
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D]/80">
            <span className="text-[10px] text-[#8B949E] uppercase font-mono block">
              Regression Risk & Goodness of Fit
            </span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border ${
                  failureRegression.riskLevel === 'LOW'
                    ? 'bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30'
                    : failureRegression.riskLevel === 'MEDIUM'
                    ? 'bg-[#E3B341]/15 text-[#E3B341] border-[#E3B341]/30'
                    : 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30'
                }`}
              >
                {failureRegression.riskLevel} RISK
              </span>
              <span className="text-[10px] text-[#8B949E] truncate">
                {failureRegression.confidenceText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Mini-Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D]">
          <span className="text-[10px] text-[#8B949E] uppercase font-mono block">Latest Passing Tests</span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl font-extrabold font-mono text-[#3FB950]">
              {trendStats.currentPassing}
            </span>
            <span className="text-xs text-[#8B949E] font-mono">
              {activeFilter.category === 'ALL' ? 'tests passed' : `tests (${activeFilter.label})`}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D]">
          <span className="text-[10px] text-[#8B949E] uppercase font-mono block">10-Run Pass Growth</span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            {trendStats.isPositive ? (
              <TrendingUp className="w-4 h-4 text-[#3FB950]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#F85149]" />
            )}
            <span
              className={`text-xl font-extrabold font-mono ${
                trendStats.isPositive ? 'text-[#3FB950]' : 'text-[#F85149]'
              }`}
            >
              {trendStats.netDelta >= 0 ? `+${trendStats.netDelta}` : trendStats.netDelta}
            </span>
            <span className="text-[10px] font-mono text-[#8B949E]">
              ({trendStats.pctDelta >= 0 ? `+${trendStats.pctDelta}%` : `${trendStats.pctDelta}%`})
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D]">
          <span className="text-[10px] text-[#8B949E] uppercase font-mono block">10-Run Avg Pass Rate</span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl font-extrabold font-mono text-[#58A6FF]">
              {trendStats.avgPassRate}%
            </span>
            <span className="text-[10px] font-mono text-[#8B949E]">
              (Peak: {trendStats.maxPassing})
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D]">
          <span className="text-[10px] text-[#8B949E] uppercase font-mono block">Avg Sandbox Latency</span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-xl font-extrabold font-mono text-[#C9D1D9]">
              {trendStats.avgDuration}
            </span>
            <span className="text-[10px] font-mono text-[#8B949E]">ms per suite</span>
          </div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="w-full h-80 pt-2 pb-1">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'PASSING_ONLY' ? (
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedRunId(e.activePayload[0].payload.runId);
                }
              }}
            >
              <defs>
                <linearGradient id="passingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3FB950" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3FB950" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#8B949E"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#30363D' }}
                axisLine={{ stroke: '#30363D' }}
              />
              <YAxis
                stroke="#8B949E"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#30363D' }}
                axisLine={{ stroke: '#30363D' }}
                domain={[0, 'dataMax + 2']}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }} />
              <ReferenceLine
                y={parseFloat(trendStats.avgPassing)}
                stroke="#58A6FF"
                strokeDasharray="4 4"
                label={{
                  value: `Avg: ${trendStats.avgPassing}`,
                  fill: '#58A6FF',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontFamily: 'monospace',
                }}
              />
              <Area
                type="monotone"
                dataKey="passed"
                name="Passing Test Cases"
                stroke="none"
                fill="url(#passingGradient)"
              />
              <Line
                type="monotone"
                dataKey="passed"
                name="Historical Passing Tests"
                stroke="#3FB950"
                strokeWidth={3}
                dot={{ r: 4, fill: '#161B22', stroke: '#3FB950', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#3FB950', stroke: '#F0F6FC', strokeWidth: 2 }}
              />
              {showForecastOverlay && (
                <Line
                  type="monotone"
                  dataKey="predictedPassed"
                  name="Forecasted Passing (Linear Regression)"
                  stroke="#E3B341"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#161B22', stroke: '#E3B341', strokeWidth: 2 }}
                />
              )}
            </ComposedChart>
          ) : viewMode === 'PASS_VS_FAIL' ? (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedRunId(e.activePayload[0].payload.runId);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#8B949E"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#30363D' }}
                axisLine={{ stroke: '#30363D' }}
              />
              <YAxis
                stroke="#8B949E"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#30363D' }}
                axisLine={{ stroke: '#30363D' }}
                domain={[0, 'dataMax + 2']}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
              />
              <Line
                type="monotone"
                dataKey="passed"
                name="Passed Tests"
                stroke="#3FB950"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#161B22', stroke: '#3FB950', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#3FB950', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="failed"
                name="Failed Tests"
                stroke="#F85149"
                strokeWidth={2}
                dot={{ r: 3.5, fill: '#161B22', stroke: '#F85149', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#F85149', stroke: '#fff', strokeWidth: 2 }}
              />
              {showForecastOverlay && (
                <Line
                  type="monotone"
                  dataKey="predictedFailed"
                  name="Predicted Failure Trend (Linear Regression)"
                  stroke="#E3B341"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#161B22', stroke: '#E3B341', strokeWidth: 2 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="total"
                name="Total in Scope"
                stroke="#58A6FF"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          ) : viewMode === 'PASS_RATE_PCT' ? (
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedRunId(e.activePayload[0].payload.runId);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#8B949E"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#30363D' }}
                axisLine={{ stroke: '#30363D' }}
              />
              <YAxis
                stroke="#8B949E"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#30363D' }}
                axisLine={{ stroke: '#30363D' }}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
              />
              <ReferenceLine
                y={80}
                stroke="#3FB950"
                strokeDasharray="3 3"
                label={{
                  value: 'CI Gate Threshold: 80%',
                  fill: '#3FB950',
                  fontSize: 10,
                  position: 'insideBottomRight',
                  fontFamily: 'monospace',
                }}
              />
              <Line
                type="monotone"
                dataKey="passRate"
                name="Actual Pass Rate %"
                stroke="#A371F7"
                strokeWidth={3}
                dot={{ r: 4, fill: '#161B22', stroke: '#A371F7', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#A371F7', stroke: '#F0F6FC', strokeWidth: 2 }}
              />
              {showForecastOverlay && (
                <Line
                  type="monotone"
                  dataKey="predictedPassRate"
                  name="Forecasted Pass Rate % (OLS Fit)"
                  stroke="#E3B341"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#161B22', stroke: '#E3B341', strokeWidth: 2 }}
                />
              )}
            </LineChart>
          ) : (
            /* FAILURE_FORECAST Dedicated Mode */
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedRunId(e.activePayload[0].payload.runId);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#8B949E"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#30363D' }}
                axisLine={{ stroke: '#30363D' }}
              />
              <YAxis
                stroke="#8B949E"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#30363D' }}
                axisLine={{ stroke: '#30363D' }}
                domain={[0, 'dataMax + 5']}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
              />
              <ReferenceLine
                y={10}
                stroke="#F85149"
                strokeDasharray="3 3"
                label={{
                  value: 'Max Risk Limit: 10%',
                  fill: '#F85149',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontFamily: 'monospace',
                }}
              />
              <ReferenceLine
                y={5}
                stroke="#3FB950"
                strokeDasharray="3 3"
                label={{
                  value: 'Target Safe Zone: <5%',
                  fill: '#3FB950',
                  fontSize: 10,
                  position: 'insideBottomRight',
                  fontFamily: 'monospace',
                }}
              />
              <Line
                type="monotone"
                dataKey="failRate"
                name="Actual Failure Rate %"
                stroke="#F85149"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#161B22', stroke: '#F85149', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#F85149', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="predictedFailRate"
                name="OLS Linear Regression Failure Forecast (y = mx + b)"
                stroke="#E3B341"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 5, fill: '#161B22', stroke: '#E3B341', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#E3B341', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Interactive Run Inspector Bar */}
      {activeSelectedRun && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md bg-[#0B0E14] border border-[#30363D] gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono font-bold text-[#F0F6FC]">
              {activeSelectedRun.label} ({activeSelectedRun.runId})
            </span>
            {activeSelectedRun.isForecast ? (
              <>
                <span className="text-[11px] font-mono text-[#E3B341] flex items-center space-x-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Est. Failure Rate: {activeSelectedRun.predictedFailRate}%</span>
                </span>
                <span className="text-[11px] font-mono text-[#58A6FF]">
                  Est. Pass: {activeSelectedRun.predictedPassed} / {activeSelectedRun.total} tests
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-mono text-[#3FB950] flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{activeSelectedRun.passed} passed</span>
                </span>
                <span className="text-[11px] font-mono text-[#F85149] flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{activeSelectedRun.failed} failed</span>
                </span>
                <span className="text-[11px] font-mono text-[#E3B341]">
                  {activeSelectedRun.failRate}% fail rate
                </span>
                <span className="text-[11px] font-mono text-[#58A6FF]">
                  {activeSelectedRun.passRate}% pass rate
                </span>
                <span className="text-[11px] font-mono text-[#8B949E] flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeSelectedRun.durationMs}ms</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onExecuteRun && (
              <button
                onClick={onExecuteRun}
                className="px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] font-semibold text-xs border border-[#30363D] flex items-center space-x-1 transition cursor-pointer"
              >
                <PlayCircle className="w-3.5 h-3.5 text-[#3FB950]" />
                <span>Execute Run</span>
              </button>
            )}
            {onNavigate && (
              <button
                onClick={() => onNavigate('test-execution')}
                className="px-2.5 py-1 rounded bg-[#1F6FEB]/20 hover:bg-[#1F6FEB]/30 text-[#58A6FF] font-semibold text-xs border border-[#1F6FEB]/40 flex items-center space-x-1 transition cursor-pointer"
              >
                <span>View Full Run Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
