import React, { useState } from 'react';
import { ApiEndpoint } from '../types';
import { CodeViewer } from '../components/CodeViewer';
import {
  Globe2,
  Sparkles,
  PlayCircle,
  CheckCircle2,
  Send,
  Code2,
  ShieldCheck,
  Server,
} from 'lucide-react';

interface ApiTestingPageProps {
  endpoints: ApiEndpoint[];
  onGenerateRestAssured: (endpointId: string) => Promise<string>;
  onExecuteEndpointTest: (
    endpointId: string,
    mockPayload?: any
  ) => Promise<{ status: number; durationMs: number; responseBody: any }>;
}

export const ApiTestingPage: React.FC<ApiTestingPageProps> = ({
  endpoints,
  onGenerateRestAssured,
  onExecuteEndpointTest,
}) => {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(
    endpoints[0]?.id || ''
  );
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<{
    status: number;
    durationMs: number;
    responseBody: any;
  } | null>(null);

  const activeEndpoint =
    endpoints.find((e) => e.id === selectedEndpointId) || endpoints[0];

  const handleGenerate = async () => {
    if (!activeEndpoint) return;
    setIsGenerating(true);
    try {
      const code = await onGenerateRestAssured(activeEndpoint.id);
      setGeneratedCode(code);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExecute = async () => {
    if (!activeEndpoint) return;
    setIsExecuting(true);
    try {
      const res = await onExecuteEndpointTest(activeEndpoint.id);
      setExecutionResult(res);
    } finally {
      setIsExecuting(false);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/30';
      case 'POST':
        return 'bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30';
      case 'PUT':
      case 'PATCH':
        return 'bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/30';
      case 'DELETE':
        return 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30';
      default:
        return 'bg-[#21262D] text-[#8B949E] border-[#30363D]';
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <Globe2 className="w-5 h-5 text-[#58A6FF]" />
            <span>REST API Testing & MockMvc / REST Assured Generator</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Detect Spring @RestController endpoints, validate DTO schemas, and generate REST Assured test suites
          </p>
        </div>

        <button
          onClick={handleExecute}
          disabled={isExecuting || !activeEndpoint}
          className="flex items-center space-x-1.5 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-md border border-[#3FB950]/30 shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Send className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Sending Request...' : 'Send Live HTTP Probe'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Endpoint List (4 cols) */}
        <div className="lg:col-span-4 rounded-lg bg-[#161B22] border border-[#30363D] p-3.5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#8B949E] px-1 flex items-center justify-between">
            <span>Spring REST Endpoints</span>
            <span className="text-[10px] font-mono text-[#58A6FF]">
              {endpoints.length} routes
            </span>
          </div>

          <div className="space-y-1.5">
            {endpoints.map((ep) => {
              const isSelected = ep.id === activeEndpoint?.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    setSelectedEndpointId(ep.id);
                    setGeneratedCode('');
                    setExecutionResult(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-md text-xs transition border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F6FEB]/15 border-[#1F6FEB]/40 text-[#F0F6FC]'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center space-x-2 font-mono font-bold">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded border ${getMethodBadge(
                        ep.method
                      )}`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-[#F0F6FC] truncate">{ep.path}</span>
                  </div>

                  <p className="text-[10px] text-[#8B949E] font-mono truncate mt-1">
                    {ep.controllerClass}.{ep.handlerMethod}()
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Endpoint Test Studio (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeEndpoint ? (
            <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#30363D]">
                <div className="flex items-center space-x-2 font-mono">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-bold border ${getMethodBadge(
                      activeEndpoint.method
                    )}`}
                  >
                    {activeEndpoint.method}
                  </span>
                  <span className="text-sm font-bold text-[#F0F6FC]">
                    {activeEndpoint.path}
                  </span>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-1.5 bg-[#1F6FEB] hover:bg-[#388BFD] disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-md shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isGenerating
                      ? 'Generating REST Assured...'
                      : 'Generate REST Assured Test'}
                  </span>
                </button>
              </div>

              {/* Endpoint Meta Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
                <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D]">
                  <p className="text-[9px] text-[#8B949E] uppercase">Controller</p>
                  <p className="text-xs font-bold text-[#F0F6FC] truncate">
                    {activeEndpoint.controllerClass}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D]">
                  <p className="text-[9px] text-[#8B949E] uppercase">Auth Required</p>
                  <p className="text-xs font-bold text-[#3FB950]">
                    {activeEndpoint.authRequired ? 'ROLE_USER (JWT)' : 'PUBLIC'}
                  </p>
                </div>
                <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D]">
                  <p className="text-[9px] text-[#8B949E] uppercase">Expected Status</p>
                  <p className="text-xs font-bold text-[#58A6FF]">
                    {activeEndpoint.expectedStatus} OK
                  </p>
                </div>
              </div>

              {/* Request / Response Live HTTP Probe Console */}
              {executionResult && (
                <div className="p-3.5 rounded-lg bg-[#0B0E14] border border-[#30363D] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1.5 text-[#3FB950] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>HTTP Probe Response ({executionResult.status} OK)</span>
                    </span>
                    <span className="text-[10px] text-[#8B949E]">
                      Latency: {executionResult.durationMs}ms
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#07090E] border border-[#30363D] text-[11px] text-[#C9D1D9] overflow-x-auto whitespace-pre">
                    {JSON.stringify(executionResult.responseBody, null, 2)}
                  </div>
                </div>
              )}

              {/* REST Assured Generated Code */}
              {generatedCode ? (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#8B949E] flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#58A6FF]" />
                    <span>REST Assured / MockMvc Test Specification</span>
                  </h3>
                  <CodeViewer
                    code={generatedCode}
                    language="java"
                    title={`${activeEndpoint.method} ${activeEndpoint.path} Integration Test`}
                    maxHeight="max-h-72"
                  />
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#8B949E] rounded bg-[#0B0E14] border border-[#30363D]">
                  Click "Generate REST Assured Test" to synthesize complete HTTP integration assertions with JWT headers and JSON schema validation.
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-[#8B949E] text-xs rounded-lg bg-[#161B22] border border-[#30363D]">
              Select a REST endpoint from the left panel to test or generate suites.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
