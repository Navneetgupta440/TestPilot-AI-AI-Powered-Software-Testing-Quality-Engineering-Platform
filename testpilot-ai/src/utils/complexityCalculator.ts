import {
  CodeClass,
  CodeMethod,
  ClassComplexityMetric,
  MethodComplexityMetric,
  ComplexityRiskLevel,
  DecisionPointsBreakdown,
  ProjectComplexitySummary,
} from '../types';

/**
 * Strips comments and string literals from Java code to prevent false positive pattern matches.
 */
function sanitizeJavaCode(code: string): string {
  if (!code) return '';
  // Remove block comments /* ... */
  let clean = code.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // Remove single line comments // ...
  clean = clean.replace(/\/\/.*$/gm, ' ');
  // Remove string and char literals "..." or '.'
  clean = clean.replace(/"(?:\\.|[^"\\])*"/g, '""');
  clean = clean.replace(/'(?:\\.|[^'\\])*'/g, "''");
  return clean;
}

/**
 * Calculates McCabe's Cyclomatic Complexity V(G) = 1 + Decision Points
 * for a snippet of Java method code.
 */
export function calculateCyclomaticComplexity(codeSnippet: string): {
  score: number;
  riskLevel: ComplexityRiskLevel;
  decisionPoints: DecisionPointsBreakdown;
  minTestsForCoverage: number;
  recommendations: string[];
} {
  const clean = sanitizeJavaCode(codeSnippet);

  // Match decision points
  const ifMatches = clean.match(/\bif\s*\(/g) || [];
  const forMatches = clean.match(/\bfor\s*\(/g) || [];
  const whileMatches = clean.match(/\bwhile\s*\(/g) || [];
  const doMatches = clean.match(/\bdo\s*\{/g) || [];
  const caseMatches = clean.match(/\bcase\b[^:]*:/g) || [];
  const catchMatches = clean.match(/\bcatch\s*\(/g) || [];
  const ternaryMatches = clean.match(/\?/g) || [];
  const andMatches = clean.match(/&&/g) || [];
  const orMatches = clean.match(/\|\|/g) || [];
  const throwMatches = clean.match(/\bthrow\s+new\b/g) || [];

  const ifCount = ifMatches.length;
  const loopCount = forMatches.length + whileMatches.length + doMatches.length;
  const caseCount = caseMatches.length;
  const catchCount = catchMatches.length;
  const logicalOpsCount = andMatches.length + orMatches.length;
  const ternaryCount = ternaryMatches.length;
  const throwCount = throwMatches.length;

  const totalDecisions = ifCount + loopCount + caseCount + catchCount + logicalOpsCount + ternaryCount + throwCount;
  const score = Math.max(1, 1 + totalDecisions);

  let riskLevel: ComplexityRiskLevel = 'LOW';
  if (score > 10) riskLevel = 'CRITICAL';
  else if (score >= 8) riskLevel = 'HIGH';
  else if (score >= 5) riskLevel = 'MODERATE';

  const recommendations: string[] = [];
  if (score > 10) {
    recommendations.push('Critical complexity: Refactor method by extracting sub-routines or applying Strategy Pattern.');
    recommendations.push(`Requires at least ${score} parameterized JUnit test cases for complete basis path coverage.`);
  } else if (score >= 8) {
    recommendations.push('High cyclomatic complexity: Use @ParameterizedTest with @CsvSource to test all boundary condition matrices.');
    if (logicalOpsCount > 2) {
      recommendations.push('Multiple compound logical conditions detected: Add dedicated boolean short-circuit tests.');
    }
  } else if (score >= 5) {
    recommendations.push('Moderate complexity: Ensure both true/false evaluation branches have explicit assertions.');
  } else {
    recommendations.push('Low complexity: Simple execution flow, 1-2 unit test assertions required.');
  }

  if (throwCount > 0) {
    recommendations.push(`Contains ${throwCount} explicit exception throw path(s): Add assertThrows() test cases.`);
  }

  return {
    score,
    riskLevel,
    decisionPoints: {
      ifCount,
      loopCount,
      caseCount,
      catchCount,
      logicalOpsCount,
      ternaryCount,
      throwCount,
      totalDecisions,
    },
    minTestsForCoverage: score,
    recommendations,
  };
}

/**
 * Evaluates a single CodeMethod to derive its detailed MethodComplexityMetric.
 */
export function analyzeMethodComplexity(method: CodeMethod): MethodComplexityMetric {
  const calc = calculateCyclomaticComplexity(method.codeSnippet || '');
  // If the method already has precomputed cyclomaticComplexity from AST, blend or prefer higher fidelity
  const finalScore = method.cyclomaticComplexity > 0 ? method.cyclomaticComplexity : calc.score;

  let riskLevel: ComplexityRiskLevel = 'LOW';
  if (finalScore > 10) riskLevel = 'CRITICAL';
  else if (finalScore >= 8) riskLevel = 'HIGH';
  else if (finalScore >= 5) riskLevel = 'MODERATE';

  return {
    methodId: method.id,
    name: method.name,
    signature: method.signature,
    cyclomaticComplexity: finalScore,
    riskLevel,
    decisionPoints: calc.decisionPoints,
    minTestsForCoverage: finalScore,
    hasExistingTest: method.hasExistingTest || method.coveragePercentage > 0,
    coveragePercentage: method.coveragePercentage || 0,
    codeSnippet: method.codeSnippet || `public void ${method.name}() {}`,
  };
}

/**
 * Calculates comprehensive cyclomatic complexity metrics for a CodeClass.
 */
export function analyzeClassComplexity(cls: CodeClass): ClassComplexityMetric {
  const methods = (cls.methods || []).map(analyzeMethodComplexity);
  const totalComplexity = methods.reduce((acc, m) => acc + m.cyclomaticComplexity, 0) || cls.complexity || 1;
  const avgMethodComplexity = methods.length > 0 ? Number((totalComplexity / methods.length).toFixed(1)) : totalComplexity;
  const maxMethodComplexity = methods.length > 0 ? Math.max(...methods.map((m) => m.cyclomaticComplexity)) : totalComplexity;

  const loc = Math.max(1, cls.linesOfCode || 20);
  const complexityDensity = Number(((totalComplexity / loc) * 100).toFixed(1));

  let riskLevel: ComplexityRiskLevel = 'LOW';
  if (totalComplexity > 25 || maxMethodComplexity > 10) riskLevel = 'CRITICAL';
  else if (totalComplexity >= 15 || maxMethodComplexity >= 8) riskLevel = 'HIGH';
  else if (totalComplexity >= 8 || maxMethodComplexity >= 5) riskLevel = 'MODERATE';

  // Maintainability Rating (derived from Halstead Volume / McCabe Cyclomatic Complexity / LOC)
  let maintainabilityRating: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  if (totalComplexity > 25 || complexityDensity > 35) maintainabilityRating = 'F';
  else if (totalComplexity > 18 || complexityDensity > 25) maintainabilityRating = 'D';
  else if (totalComplexity > 12 || complexityDensity > 18) maintainabilityRating = 'C';
  else if (totalComplexity > 6 || complexityDensity > 12) maintainabilityRating = 'B';

  const hotspotsCount = methods.filter((m) => m.cyclomaticComplexity >= 6).length;
  const untestedBranchesCount = methods
    .filter((m) => !m.hasExistingTest || m.coveragePercentage < 50)
    .reduce((acc, m) => acc + m.cyclomaticComplexity, 0);

  return {
    classId: cls.id,
    className: cls.name,
    packageName: cls.packageName || 'com.testpilot.sample',
    filePath: cls.filePath || `${cls.name}.java`,
    springRole: cls.springRole || 'SERVICE',
    linesOfCode: cls.linesOfCode || 30,
    totalComplexity,
    avgMethodComplexity,
    maxMethodComplexity,
    complexityDensity,
    riskLevel,
    maintainabilityRating,
    methods,
    hotspotsCount,
    untestedBranchesCount,
  };
}

/**
 * Computes project-wide Cyclomatic Complexity statistics.
 */
export function deriveProjectComplexity(
  classes: CodeClass[],
  projectId: string = 'proj-sample-spring'
): ProjectComplexitySummary {
  const analyzedClasses = classes.map(analyzeClassComplexity);
  const totalProjectComplexity = analyzedClasses.reduce((acc, c) => acc + c.totalComplexity, 0);
  const totalMethods = analyzedClasses.reduce((acc, c) => acc + c.methods.length, 0) || 1;
  const avgClassComplexity =
    analyzedClasses.length > 0 ? Number((totalProjectComplexity / analyzedClasses.length).toFixed(1)) : 0;
  const avgMethodComplexity = Number((totalProjectComplexity / totalMethods).toFixed(1));

  let highestComplexityClass = 'None';
  let maxClassComp = -1;
  let highestComplexityMethod = 'None';
  let maxMethodComp = -1;

  for (const c of analyzedClasses) {
    if (c.totalComplexity > maxClassComp) {
      maxClassComp = c.totalComplexity;
      highestComplexityClass = `${c.className} (${c.totalComplexity})`;
    }
    for (const m of c.methods) {
      if (m.cyclomaticComplexity > maxMethodComp) {
        maxMethodComp = m.cyclomaticComplexity;
        highestComplexityMethod = `${c.className}.${m.name}() (${m.cyclomaticComplexity})`;
      }
    }
  }

  const allMethods = analyzedClasses.flatMap((c) => c.methods);
  const lowCount = allMethods.filter((m) => m.riskLevel === 'LOW').length;
  const moderateCount = allMethods.filter((m) => m.riskLevel === 'MODERATE').length;
  const highCount = allMethods.filter((m) => m.riskLevel === 'HIGH').length;
  const criticalCount = allMethods.filter((m) => m.riskLevel === 'CRITICAL').length;

  return {
    projectId,
    totalProjectComplexity,
    avgClassComplexity,
    avgMethodComplexity,
    highestComplexityClass,
    highestComplexityMethod,
    totalBasisPaths: totalProjectComplexity,
    riskDistribution: {
      lowCount,
      moderateCount,
      highCount,
      criticalCount,
    },
    classes: analyzedClasses,
  };
}

export function getRiskBadgeClasses(risk: ComplexityRiskLevel): string {
  switch (risk) {
    case 'CRITICAL':
      return 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30';
    case 'HIGH':
      return 'bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/30';
    case 'MODERATE':
      return 'bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/30';
    case 'LOW':
    default:
      return 'bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30';
  }
}
