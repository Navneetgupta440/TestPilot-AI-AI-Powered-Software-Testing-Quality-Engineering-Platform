import React, { useState, useMemo } from 'react';
import { Project, CodeClass, CodeFinding } from '../types';
import { AI_SUGGESTED_PROMPTS, AiPrompt, PromptCategory } from '../data/aiPromptsData';
import {
  Bot,
  Send,
  Sparkles,
  Layers,
  FileCode,
  CheckCircle2,
  Terminal,
  Search,
  BookOpen,
  Copy,
  Check,
  Tag,
  Flame,
  Filter,
  ArrowRight,
  Code,
  Shield,
  Zap,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AiAssistantPageProps {
  project: Project;
  classes: CodeClass[];
  findings: CodeFinding[];
  onSendMessage: (msg: string) => Promise<string>;
  onShowToast?: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  project,
  classes,
  findings,
  onSendMessage,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I am your TestPilot RAG Assistant. I have indexed **${classes.length} Java classes**, **${findings.length} static analysis findings**, and active Spring Boot annotations for **${project.name}**.\n\nYou can explore our library of **50+ enterprise AI testing prompts** or ask me directly to:
• Synthesize parameterized JUnit 5 boundary matrices
• Generate Mockito 5 strict stubs and verify zero-interaction invariants
• Analyze OWASP security vulnerabilities (SQLi, XSS, JWT validation)
• Audit cyclomatic complexity and patch failing tests automatically`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Prompts Library Filter & Search State
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('ALL');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const categories: string[] = [
    'ALL',
    'Unit Testing',
    'Security & Vulnerability',
    'Mocking & Stubs',
    'REST API & Integration',
    'Performance & Concurrency',
    'Mutation & Boundary',
    'Spring Boot & Testcontainers',
    'Failure Diagnosis & Repair',
    'Clean Code & Refactoring',
    'CI/CD & Quality Gates',
  ];

  const filteredPrompts = useMemo(() => {
    return AI_SUGGESTED_PROMPTS.filter((p) => {
      const matchesCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesComplexity =
        selectedComplexity === 'ALL' || p.complexity === selectedComplexity;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.frameworks && p.frameworks.some((f) => f.toLowerCase().includes(q)));

      return matchesCategory && matchesComplexity && matchesSearch;
    });
  }, [searchQuery, selectedCategory, selectedComplexity]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) {
      setInputText('');
    }
    setIsSending(true);

    try {
      const reply = await onSendMessage(userMsg.text);
      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: 'Failed to communicate with AI model. Please check the network connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleSelectPrompt = (promptText: string, autoRun = false) => {
    setInputText(promptText);
    if (autoRun) {
      handleSend(promptText);
      setIsPromptLibraryOpen(false);
    } else {
      if (onShowToast) onShowToast('Prompt loaded into chat input');
    }
  };

  const handleCopyPrompt = (prompt: AiPrompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopiedPromptId(prompt.id);
    if (onShowToast) onShowToast(`Copied prompt: "${prompt.title}"`);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  // Curated quick starter prompts for the sidebar
  const quickSidebarPrompts = [
    AI_SUGGESTED_PROMPTS[0], // High-Complexity Method Boundary Matrix
    AI_SUGGESTED_PROMPTS[6], // SQL Injection & JPQL Fuzzing
    AI_SUGGESTED_PROMPTS[12], // Strict Mockito 5 Verification
    AI_SUGGESTED_PROMPTS[18], // End-to-End REST Assured Contract
    AI_SUGGESTED_PROMPTS[30], // Testcontainers PostgreSQL
    AI_SUGGESTED_PROMPTS[35], // Stack Trace Root-Cause Synthesis
  ];

  return (
    <div className="space-y-6 pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#F0F6FC] tracking-tight flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#58A6FF]" />
            <span>RAG-Grounded AI Software Testing Assistant</span>
          </h1>
          <p className="text-xs text-[#8B949E] mt-1">
            Context-aware AI copilot grounded directly in project AST, dependencies, and 50+ enterprise test prompts
          </p>
        </div>

        {/* 50+ Prompts Library Toggle Button */}
        <button
          id="open-prompts-library-btn"
          onClick={() => setIsPromptLibraryOpen((prev) => !prev)}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer shadow-sm ${
            isPromptLibraryOpen
              ? 'bg-[#1F6FEB] text-white border-[#388BFD]'
              : 'bg-[#161B22] hover:bg-[#21262D] text-[#58A6FF] border-[#30363D]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#E3B341]" />
          <span>
            {isPromptLibraryOpen ? 'Hide Prompt Library' : 'Browse 50+ AI Prompts'}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0B0E14] text-[#C9D1D9] border border-[#30363D]">
            {AI_SUGGESTED_PROMPTS.length}
          </span>
        </button>
      </div>

      {/* Expandable 50+ Suggested Prompts Hub */}
      {isPromptLibraryOpen && (
        <div className="rounded-xl bg-[#161B22] border border-[#58A6FF]/40 p-5 space-y-4 shadow-xl transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#30363D]">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 rounded-lg bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#F0F6FC]">
                  Enterprise AI Prompt Library ({AI_SUGGESTED_PROMPTS.length} Curated Prompts)
                </h2>
                <p className="text-xs text-[#8B949E]">
                  Engineered prompts for OpenAI / Gemini test generation, security auditing, and failure diagnosis
                </p>
              </div>
            </div>

            {/* Complexity Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-[#8B949E] font-mono">Complexity:</span>
              <select
                value={selectedComplexity}
                onChange={(e) => setSelectedComplexity(e.target.value)}
                className="bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#58A6FF]"
              >
                <option value="ALL">All Complexities</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Search Bar & Category Filter Pills */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8B949E] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search across 50+ prompts by keyword, tag (e.g., JUnit 5, JWT, Mockito, SQLi, Testcontainers)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-lg pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-[#58A6FF]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-[#8B949E] hover:text-[#C9D1D9]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Categories Scroll */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1F6FEB] text-white font-bold'
                      : 'bg-[#0B0E14] hover:bg-[#21262D] text-[#8B949E] hover:text-[#C9D1D9] border border-[#30363D]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Prompts Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredPrompts.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-xs text-[#8B949E]">
                No prompts matching "{searchQuery}" in category "{selectedCategory}".
              </div>
            ) : (
              filteredPrompts.map((p) => {
                const isCopied = copiedPromptId === p.id;
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-lg bg-[#0B0E14] border border-[#30363D] hover:border-[#58A6FF]/50 transition flex flex-col justify-between space-y-2 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#58A6FF] px-1.5 py-0.2 rounded bg-[#1F6FEB]/10 border border-[#1F6FEB]/20">
                          {p.category}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            p.complexity === 'Expert'
                              ? 'bg-[#F85149]/15 text-[#F85149] border border-[#F85149]/30'
                              : p.complexity === 'Advanced'
                              ? 'bg-[#E3B341]/15 text-[#E3B341] border border-[#E3B341]/30'
                              : 'bg-[#238636]/15 text-[#3FB950] border border-[#3FB950]/30'
                          }`}
                        >
                          {p.complexity}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-[#F0F6FC] leading-snug group-hover:text-[#58A6FF] transition">
                        {p.title}
                      </h3>

                      <p className="text-[11px] text-[#8B949E] line-clamp-2">
                        {p.description}
                      </p>

                      <div className="p-2 rounded bg-[#161B22] border border-[#30363D] text-[11px] text-[#C9D1D9] font-sans leading-relaxed line-clamp-3">
                        "{p.prompt}"
                      </div>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-[#30363D]/60">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9px] font-mono text-[#8B949E] bg-[#161B22] px-1.5 py-0.2 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          onClick={() => handleCopyPrompt(p)}
                          className="flex items-center space-x-1 text-[11px] text-[#8B949E] hover:text-[#C9D1D9] transition cursor-pointer"
                          title="Copy prompt text"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-[#3FB950]" />
                              <span className="text-[#3FB950]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleSelectPrompt(p.prompt, false)}
                            className="px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[11px] text-[#C9D1D9] font-medium transition cursor-pointer"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleSelectPrompt(p.prompt, true)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#1F6FEB] hover:bg-[#388BFD] text-[11px] font-bold text-white transition cursor-pointer shadow-sm"
                          >
                            <span>Run</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Main Grid: RAG Context Panel + Chat Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RAG Context Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8B949E]">
              <span className="flex items-center space-x-1.5 text-[#F0F6FC]">
                <Layers className="w-4 h-4 text-[#58A6FF]" />
                <span>Active RAG Vector Index</span>
              </span>
              <span className="text-[10px] font-mono text-[#3FB950] bg-[#3FB950]/10 px-2 py-0.5 rounded border border-[#3FB950]/20">
                Synced
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#F0F6FC]">
                  <span>Project Metadata</span>
                  <span className="text-[#58A6FF]">{project.framework}</span>
                </div>
                <p className="text-[10px] text-[#8B949E]">
                  Target: {project.name} ({project.buildSystem})
                </p>
              </div>

              <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#F0F6FC]">
                  <span>AST Classes Indexed</span>
                  <span className="text-[#58A6FF]">{classes.length} classes</span>
                </div>
                <div className="text-[10px] text-[#8B949E] font-mono space-y-0.5 max-h-28 overflow-y-auto">
                  {classes.map((c) => (
                    <div key={c.id} className="flex justify-between">
                      <span>• {c.name}</span>
                      <span className="text-[#58A6FF]">{c.springRole}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0B0E14] border border-[#30363D] space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#F0F6FC]">
                  <span>Static Violations</span>
                  <span className="text-[#E3B341]">{findings.length} findings</span>
                </div>
                <p className="text-[10px] text-[#8B949E]">
                  Fed into prompt context to enforce zero regressions
                </p>
              </div>
            </div>
          </div>

          {/* Quick Starter Prompts */}
          <div className="rounded-lg bg-[#161B22] border border-[#30363D] p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              <span>Suggested Quick Prompts</span>
              <button
                onClick={() => setIsPromptLibraryOpen(true)}
                className="text-[10px] text-[#58A6FF] hover:underline cursor-pointer lowercase"
              >
                see all {AI_SUGGESTED_PROMPTS.length} &rarr;
              </button>
            </div>
            <div className="space-y-1.5">
              {quickSidebarPrompts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPrompt(p.prompt, false)}
                  className="w-full text-left p-2.5 rounded bg-[#0B0E14] hover:bg-[#1C2128] border border-[#30363D] hover:border-[#58A6FF]/40 text-xs text-[#C9D1D9] transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#58A6FF] font-mono mb-1">
                    <span>{p.category}</span>
                    <span className="text-[#8B949E] group-hover:text-[#F0F6FC]">
                      {p.complexity}
                    </span>
                  </div>
                  <p className="line-clamp-2 leading-relaxed text-[11px]">
                    "{p.title}: {p.prompt}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Studio (8 cols) */}
        <div className="lg:col-span-8 rounded-lg bg-[#161B22] border border-[#30363D] flex flex-col h-[640px] overflow-hidden shadow-sm">
          {/* Studio Topbar */}
          <div className="px-4 py-3 bg-[#111622] border-b border-[#30363D] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#58A6FF]" />
              <span className="text-xs font-bold text-[#F0F6FC]">
                TestPilot AI Dialogue Engine
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-[#3FB950] bg-[#3FB950]/10 px-2 py-0.5 rounded border border-[#3FB950]/20">
                50+ Suggested Prompts Ready
              </span>
              <span className="text-[10px] font-mono text-[#58A6FF] bg-[#58A6FF]/10 px-2 py-0.5 rounded border border-[#58A6FF]/20">
                Gemini 3.7 Flash
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center space-x-2 text-[10px] text-[#8B949E] mb-1 font-mono">
                  <span>{m.sender === 'user' ? 'Developer' : 'TestPilot AI'}</span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-lg text-xs leading-relaxed max-w-2xl border ${
                    m.sender === 'user'
                      ? 'bg-[#1F6FEB]/20 border-[#1F6FEB]/40 text-[#F0F6FC]'
                      : 'bg-[#0B0E14] border-[#30363D] text-[#C9D1D9] whitespace-pre-wrap font-sans'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex flex-col items-start space-y-1">
                <span className="text-[10px] text-[#8B949E] font-mono">
                  TestPilot AI is thinking...
                </span>
                <div className="p-3.5 rounded-lg bg-[#0B0E14] border border-[#30363D] text-xs text-[#58A6FF] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 animate-spin text-[#58A6FF]" />
                  <span>Synthesizing repository AST knowledge & test advice...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-[#111622] border-t border-[#30363D] flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about test gaps, Spring Boot mocking, or select from 50+ prompts above..."
              className="flex-1 bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#58A6FF]"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="px-4 py-2.5 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white font-semibold text-xs rounded-lg flex items-center space-x-1.5 border border-[#3FB950]/30 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
