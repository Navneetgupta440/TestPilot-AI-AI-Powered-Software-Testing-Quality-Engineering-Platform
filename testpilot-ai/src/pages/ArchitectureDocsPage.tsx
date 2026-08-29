import React from 'react';
import { BookOpen, Layers, Cpu, ShieldCheck, Terminal, GitBranch, Database } from 'lucide-react';
import { TestPilotHeroBadge } from '../components/TestPilotLogo';

export const ArchitectureDocsPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Brand Hero Artwork Card */}
      <TestPilotHeroBadge />

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-[#58A6FF]" />
          <span>TestPilot AI System Architecture & Engineering Specs</span>
        </h1>
        <p className="text-xs text-[#8B949E] mt-1">
          Technical specifications for AST extraction, RAG prompt engineering, sandbox container isolation, and quality metrics
        </p>
      </div>

      {/* Architecture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#F0F6FC]">
            <Layers className="w-4 h-4 text-[#58A6FF]" />
            <span>1. Java AST Parser & Static Rule Engine</span>
          </div>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Parses Java 8-21 source files into abstract syntax trees. Stereotypes Spring annotations (@RestController, @Service, @Repository), computes cyclomatic complexity, and extracts method parameter signatures.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#F0F6FC]">
            <Cpu className="w-4 h-4 text-[#3FB950]" />
            <span>2. Project-Aware RAG Pipeline</span>
          </div>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Extracts DTO definitions, entity relationships, and Spring context into semantic chunks. Injects targeted context into Gemini 3.7 Flash for zero-hallucination test generation with executable assertions.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#161B22] border border-[#30363D] space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#F0F6FC]">
            <ShieldCheck className="w-4 h-4 text-[#E3B341]" />
            <span>3. Isolated Sandbox Container Execution</span>
          </div>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Executes generated test suites inside ephemeral Docker containers with disabled network access, 1024MB RAM caps, 30-second timeouts, and Surefire JUnit 5 XML telemetry ingestion.
          </p>
        </div>
      </div>

      {/* RAG Prompting & Auto-Repair Specs */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-4">
        <h2 className="text-sm font-bold text-[#F0F6FC] flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#58A6FF]" />
          <span>Iterative Failure Auto-Repair Workflow</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-[#0B0E14] border border-[#30363D] space-y-1">
            <span className="font-mono font-bold text-[#58A6FF]">Phase 1: Generation</span>
            <p className="text-[#8B949E]">
              Gemini 3.7 Flash synthesizes JUnit 5 tests covering boundary scenarios, negative inputs, and exceptions.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0B0E14] border border-[#30363D] space-y-1">
            <span className="font-mono font-bold text-[#E3B341]">Phase 2: Execution</span>
            <p className="text-[#8B949E]">
              Maven Surefire runs in isolated runner container; logs and assertion stack traces are captured.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0B0E14] border border-[#30363D] space-y-1">
            <span className="font-mono font-bold text-[#F85149]">Phase 3: Diagnosis</span>
            <p className="text-[#8B949E]">
              AI parses failure stack trace, locates root cause line, and distinguishes test bug vs. app bug.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0B0E14] border border-[#30363D] space-y-1">
            <span className="font-mono font-bold text-[#3FB950]">Phase 4: Synthesis</span>
            <p className="text-[#8B949E]">
              Generates clean patched test code and verifies again in the execution container.
            </p>
          </div>
        </div>
      </div>

      {/* Quality Score Formulation */}
      <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-5 space-y-3">
        <h2 className="text-sm font-bold text-[#F0F6FC]">
          Composite Quality Score Formulation
        </h2>
        <div className="p-3 rounded-lg bg-[#0B0E14] border border-[#30363D] font-mono text-xs text-[#C9D1D9] leading-relaxed">
          <code>
            QualityScore = (CoverageScore × 0.30) + (StaticAnalysisScore × 0.20) + (PassRateScore × 0.20) + (ComplexityScore × 0.10) + (SecurityScore × 0.10) + (TestQualityScore × 0.10)
          </code>
        </div>
      </div>
    </div>
  );
};
