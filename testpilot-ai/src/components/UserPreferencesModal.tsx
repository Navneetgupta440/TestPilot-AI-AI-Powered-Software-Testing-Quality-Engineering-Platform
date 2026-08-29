import React, { useState, useEffect } from 'react';
import {
  UserPreferences,
  MutationDepth,
  TargetTestFramework,
  AssertionStyle,
  MockingStrategy,
  ReasoningEffort,
  HumanReviewThreshold,
  DEFAULT_USER_PREFERENCES,
} from '../types';
import {
  X,
  Sliders,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Code2,
  Check,
  RotateCcw,
  Download,
  Upload,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Terminal,
  Settings2,
  Workflow,
  FileCode,
  Bell,
} from 'lucide-react';

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (prefs: UserPreferences) => Promise<void> | void;
}

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<'auto-repair' | 'generation' | 'editor'>('auto-repair');
  const [formData, setFormData] = useState<UserPreferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Sync form data when modal opens or external preferences change
  useEffect(() => {
    if (isOpen) {
      setFormData(preferences);
      setSaveSuccess(false);
      setImportError(null);
    }
  }, [isOpen, preferences]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMutationDepthChange = (depth: MutationDepth) => {
    setFormData((prev) => ({
      ...prev,
      autoRepair: {
        ...prev.autoRepair,
        allowedMutationDepth: depth,
      },
    }));
  };

  const handleFrameworkToggle = (fw: TargetTestFramework) => {
    setFormData((prev) => {
      const current = prev.autoRepair.targetFrameworks;
      const next = current.includes(fw)
        ? current.filter((item) => item !== fw)
        : [...current, fw];
      
      // Ensure at least one framework is selected
      if (next.length === 0) return prev;

      return {
        ...prev,
        autoRepair: {
          ...prev.autoRepair,
          targetFrameworks: next,
          primaryFramework: next.includes(prev.autoRepair.primaryFramework)
            ? prev.autoRepair.primaryFramework
            : next[0],
        },
      };
    });
  };

  const handleSelectEnterpriseStack = () => {
    setFormData((prev) => ({
      ...prev,
      autoRepair: {
        ...prev.autoRepair,
        targetFrameworks: ['JUNIT_5', 'MOCKITO_5', 'ASSERTJ', 'SPRING_BOOT_TEST'],
        primaryFramework: 'JUNIT_5',
        assertionStyle: 'ASSERTJ_FLUENT',
      },
    }));
  };

  const handleResetToDefaults = () => {
    setFormData(DEFAULT_USER_PREFERENCES);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSavePreferences(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 500);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `testpilot-preferences-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.autoRepair && parsed.generation) {
          setFormData(parsed);
          setImportError(null);
        } else {
          setImportError('Invalid configuration file schema.');
        }
      } catch (err) {
        setImportError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const mutationDepthInfo: Record<
    MutationDepth,
    {
      title: string;
      badge: string;
      badgeColor: string;
      desc: string;
      allowedScope: string[];
      riskLevel: 'VERY LOW' | 'LOW' | 'MEDIUM' | 'ELEVATED';
      speed: string;
    }
  > = {
    1: {
      title: 'Level 1: Conservative',
      badge: 'Assertions Only',
      badgeColor: 'bg-[#3FB950]/15 text-[#3FB950] border-[#3FB950]/30',
      desc: 'Only modifies expected assertion arguments, threshold numbers, return status codes, and error string messages.',
      allowedScope: ['Assertion values (assertEquals, assertThat)', 'Numeric tolerance / delta thresholds', 'String constants'],
      riskLevel: 'VERY LOW',
      speed: '< 1.2s',
    },
    2: {
      title: 'Level 2: Standard (Default)',
      badge: 'Balanced Policy',
      badgeColor: 'bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/30',
      desc: 'Synthesizes assertion updates, mock return values (when().thenReturn()), and input parameter permutations.',
      allowedScope: ['Assertion logic & matchers', 'Mock return values & stubs', 'Test arguments & payloads', 'Edge boundary adjustments'],
      riskLevel: 'LOW',
      speed: '~ 1.8s',
    },
    3: {
      title: 'Level 3: Deep Fixture Repair',
      badge: 'Multi-Class Fixtures',
      badgeColor: 'bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/30',
      desc: 'Refactors test setup fixtures, @BeforeEach initialization, multi-collaborator mock chains, and exception contracts.',
      allowedScope: ['@BeforeEach setup & teardown', 'Multi-layer mock chains (@MockBean)', 'Exception assertion contracts (assertThrows)', 'Test fixture builder methods'],
      riskLevel: 'MEDIUM',
      speed: '~ 2.6s',
    },
    4: {
      title: 'Level 4: Exhaustive Overhaul',
      badge: 'Architectural AST',
      badgeColor: 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30',
      desc: 'Complete restructuring of the test class, rewriting class annotations, parameterized matrices, and contract verification.',
      allowedScope: ['Full test class restructuring', 'Parameterized matrix generation', 'Layer isolation and architecture rules', 'Testcontainers & WireMock setup'],
      riskLevel: 'ELEVATED',
      speed: '~ 3.8s',
    },
  };

  const availableFrameworks: {
    id: TargetTestFramework;
    label: string;
    category: string;
    version: string;
    description: string;
  }[] = [
    {
      id: 'JUNIT_5',
      label: 'JUnit 5 (Jupiter)',
      category: 'Unit Core',
      version: 'v5.10',
      description: 'Modern standard with @Test, @DisplayName, @ParameterizedTest, and nested test lifecycles.',
    },
    {
      id: 'MOCKITO_5',
      label: 'Mockito 5',
      category: 'Mocking',
      version: 'v5.11',
      description: 'Mock collaborator behavior with @Mock, @InjectMocks, ArgumentCaptor, and BDDMockito.',
    },
    {
      id: 'ASSERTJ',
      label: 'AssertJ Core',
      category: 'Assertions',
      version: 'v3.25',
      description: 'Rich fluent assertions with assertThat(obj).satisfies() and detailed failure diagnostics.',
    },
    {
      id: 'SPRING_BOOT_TEST',
      label: 'Spring Boot Test',
      category: 'Integration',
      version: 'v3.2',
      description: 'Spring application context testing with @SpringBootTest, @MockBean, and MockMvc.',
    },
    {
      id: 'REST_ASSURED',
      label: 'REST Assured',
      category: 'API Testing',
      version: 'v5.4',
      description: 'Declarative HTTP testing with given().when().then() validation for REST endpoints.',
    },
    {
      id: 'TESTNG',
      label: 'TestNG',
      category: 'Enterprise',
      version: 'v7.9',
      description: 'Parallel test execution, XML suites, and flexible data provider matrices.',
    },
    {
      id: 'SPOCK_FRAMEWORK',
      label: 'Spock Framework',
      category: 'BDD Specification',
      version: 'v2.4',
      description: 'Expressive specification-based testing with Given-When-Then data tables.',
    },
    {
      id: 'ARCHUNIT',
      label: 'ArchUnit',
      category: 'Architecture Rules',
      version: 'v1.2',
      description: 'Automated architectural fitness rules and dependency direction validation.',
    },
  ];

  return (
    <div
      id="user-preferences-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div
        id="user-preferences-modal"
        className="w-full max-w-4xl bg-[#111622] border border-[#30363D] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363D] bg-[#0E121A]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#1F6FEB]/15 border border-[#1F6FEB]/40 flex items-center justify-center text-[#58A6FF]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[#F0F6FC] font-sans">
                  Developer & AI Auto-Repair Preferences
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#238636]/15 text-[#3FB950] border border-[#3FB950]/30">
                  Global Policy
                </span>
              </div>
              <p className="text-xs text-[#8B949E]">
                Configure autonomous mutation depth, target test frameworks, assertion conventions, and execution sandbox controls.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-[#F0F6FC] p-1.5 rounded-md hover:bg-[#161B22] transition cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-[#30363D] bg-[#0B0E14]">
          <button
            id="tab-btn-auto-repair"
            onClick={() => setActiveTab('auto-repair')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'auto-repair'
                ? 'border-[#58A6FF] text-[#58A6FF] bg-[#161B22]/50 rounded-t'
                : 'border-transparent text-[#8B949E] hover:text-[#C9D1D9]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#58A6FF]" />
            <span>AI Auto-Repair Policy</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30">
              Depth {formData.autoRepair.allowedMutationDepth}
            </span>
          </button>

          <button
            id="tab-btn-generation"
            onClick={() => setActiveTab('generation')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'generation'
                ? 'border-[#58A6FF] text-[#58A6FF] bg-[#161B22]/50 rounded-t'
                : 'border-transparent text-[#8B949E] hover:text-[#C9D1D9]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#3FB950]" />
            <span>Test Generation Defaults</span>
          </button>

          <button
            id="tab-btn-editor"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'editor'
                ? 'border-[#58A6FF] text-[#58A6FF] bg-[#161B22]/50 rounded-t'
                : 'border-transparent text-[#8B949E] hover:text-[#C9D1D9]'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5 text-[#D29922]" />
            <span>Editor & Formatting</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0E14]">
          {importError && (
            <div className="p-3 rounded-lg bg-[#F85149]/10 border border-[#F85149]/30 text-xs text-[#F85149] flex items-center justify-between">
              <span>{importError}</span>
              <button
                onClick={() => setImportError(null)}
                className="text-[#F85149] hover:underline text-[11px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: AI AUTO-REPAIR SETTINGS */}
          {activeTab === 'auto-repair' && (
            <div className="space-y-6">
              {/* SECTION 1: Allowed Mutation Depth */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-[#E3B341]" />
                      <span>Allowed AI Mutation Depth</span>
                    </label>
                    <p className="text-[11px] text-[#8B949E] mt-0.5">
                      Determines the maximum structural transformation scope the AI self-repair engine can perform on failed tests.
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                      mutationDepthInfo[formData.autoRepair.allowedMutationDepth].badgeColor
                    }`}
                  >
                    Current: Level {formData.autoRepair.allowedMutationDepth} (
                    {mutationDepthInfo[formData.autoRepair.allowedMutationDepth].riskLevel} Risk)
                  </span>
                </div>

                {/* 4-Level Interactive Depth Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {([1, 2, 3, 4] as MutationDepth[]).map((level) => {
                    const info = mutationDepthInfo[level];
                    const isSelected = formData.autoRepair.allowedMutationDepth === level;
                    return (
                      <div
                        key={level}
                        id={`mutation-depth-card-${level}`}
                        onClick={() => handleMutationDepthChange(level)}
                        className={`p-3.5 rounded-lg border transition cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1F6FEB]/10 border-[#58A6FF] shadow-sm'
                            : 'bg-[#111622] border-[#30363D] hover:border-[#8B949E]/50 hover:bg-[#161B22]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-[#58A6FF] bg-[#58A6FF] text-[#0B0E14]'
                                    : 'border-[#484F58]'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs font-bold text-[#F0F6FC]">
                                {info.title}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border ${info.badgeColor}`}
                            >
                              {info.badge}
                            </span>
                          </div>

                          <p className="text-[11px] text-[#8B949E] leading-relaxed">
                            {info.desc}
                          </p>

                          <div className="pt-1.5 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[#8B949E] tracking-wider block">
                              Permitted Scope:
                            </span>
                            <ul className="text-[10px] text-[#C9D1D9] font-mono space-y-0.5">
                              {info.allowedScope.map((scope, idx) => (
                                <li key={idx} className="flex items-center space-x-1.5">
                                  <span className="text-[#58A6FF]">•</span>
                                  <span>{scope}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#30363D]/60 flex items-center justify-between text-[10px] font-mono text-[#8B949E]">
                          <span>
                            Risk:{' '}
                            <strong
                              className={
                                info.riskLevel === 'VERY LOW' || info.riskLevel === 'LOW'
                                  ? 'text-[#3FB950]'
                                  : info.riskLevel === 'MEDIUM'
                                  ? 'text-[#E3B341]'
                                  : 'text-[#F85149]'
                              }
                            >
                              {info.riskLevel}
                            </strong>
                          </span>
                          <span>Inference Latency: {info.speed}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Target Test Frameworks */}
              <div className="space-y-3 pt-4 border-t border-[#30363D]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-[#58A6FF]" />
                      <span>Target Test Frameworks</span>
                    </label>
                    <p className="text-[11px] text-[#8B949E] mt-0.5">
                      Select which testing libraries and mocking engines the AI auto-repair loop is allowed to synthesize.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSelectEnterpriseStack}
                      className="text-[11px] text-[#58A6FF] hover:underline font-mono cursor-pointer"
                    >
                      Use Enterprise Stack (JUnit5 + Mockito + AssertJ)
                    </button>
                  </div>
                </div>

                {/* Framework Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {availableFrameworks.map((fw) => {
                    const isChecked = formData.autoRepair.targetFrameworks.includes(fw.id);
                    const isPrimary = formData.autoRepair.primaryFramework === fw.id;
                    return (
                      <div
                        key={fw.id}
                        id={`framework-option-${fw.id}`}
                        onClick={() => handleFrameworkToggle(fw.id)}
                        className={`p-2.5 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                          isChecked
                            ? 'bg-[#161B22] border-[#58A6FF]/50 text-[#F0F6FC]'
                            : 'bg-[#111622] border-[#30363D] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Handled by container
                                className="rounded text-[#1F6FEB] focus:ring-0 focus:ring-offset-0 bg-[#0B0E14] border-[#30363D]"
                              />
                              <span className="text-xs font-bold font-mono">
                                {fw.label}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-[#8B949E]">
                              {fw.version}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8B949E] line-clamp-2 leading-tight">
                            {fw.description}
                          </p>
                        </div>

                        {isChecked && (
                          <div className="mt-2 pt-1.5 border-t border-[#30363D] flex items-center justify-between text-[9px] font-mono">
                            <span className="text-[#3FB950]">Active in Repair</span>
                            {isPrimary ? (
                              <span className="text-[#58A6FF] font-bold">Primary</span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData((prev) => ({
                                    ...prev,
                                    autoRepair: {
                                      ...prev.autoRepair,
                                      primaryFramework: fw.id,
                                    },
                                  }));
                                }}
                                className="text-[#8B949E] hover:text-[#C9D1D9] underline cursor-pointer"
                              >
                                Set Primary
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Assertion Style & Mocking Strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#30363D]">
                {/* Assertion Style */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#F0F6FC] flex items-center justify-between">
                    <span>Default Assertion Style</span>
                    <span className="text-[10px] font-mono text-[#8B949E]">Fluent vs Classic</span>
                  </label>
                  <select
                    id="pref-assertion-style"
                    value={formData.autoRepair.assertionStyle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        autoRepair: {
                          ...prev.autoRepair,
                          assertionStyle: e.target.value as AssertionStyle,
                        },
                      }))
                    }
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] font-mono cursor-pointer"
                  >
                    <option value="ASSERTJ_FLUENT">
                      AssertJ Fluent: assertThat(result).isEqualTo(expected)
                    </option>
                    <option value="JUNIT_ASSERTIONS">
                      JUnit 5 Standard: assertEquals(expected, result)
                    </option>
                    <option value="HAMCREST_MATCHERS">
                      Hamcrest Matchers: assertThat(result, is(equalTo(expected)))
                    </option>
                  </select>
                  <p className="text-[10px] text-[#8B949E]">
                    AssertJ provides readable failure messages with exact field-level diffs.
                  </p>
                </div>

                {/* Mocking Strategy */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#F0F6FC] flex items-center justify-between">
                    <span>Mocking & Stubbing Strategy</span>
                    <span className="text-[10px] font-mono text-[#8B949E]">Collaborator Stubs</span>
                  </label>
                  <select
                    id="pref-mocking-strategy"
                    value={formData.autoRepair.mockingStrategy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        autoRepair: {
                          ...prev.autoRepair,
                          mockingStrategy: e.target.value as MockingStrategy,
                        },
                      }))
                    }
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#F0F6FC] focus:outline-none focus:border-[#58A6FF] font-mono cursor-pointer"
                  >
                    <option value="MOCKITO_DEFAULT">
                      Mockito Default (@Mock, @InjectMocks, when().thenReturn())
                    </option>
                    <option value="SPRING_MOCKBEAN">
                      Spring @MockBean (Context-injected mock beans)
                    </option>
                    <option value="WIREMOCK">
                      WireMock (HTTP server stubs & REST assertions)
                    </option>
                    <option value="TESTCONTAINERS">
                      Testcontainers (Real ephemeral Docker DB & Kafka)
                    </option>
                  </select>
                  <p className="text-[10px] text-[#8B949E]">
                    Determines collaborator isolation pattern during auto-repair synthesis.
                  </p>
                </div>
              </div>

              {/* SECTION 4: Autonomous Loop Controls & Safety Gates */}
              <div className="space-y-3 pt-4 border-t border-[#30363D]">
                <label className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#3FB950]" />
                  <span>Autonomous Loop & Safety Verification Gates</span>
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Max Iterations */}
                  <div className="p-3 rounded-lg bg-[#111622] border border-[#30363D] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#F0F6FC]">
                      <span className="font-semibold">Max Self-Repair Iterations</span>
                      <span className="font-mono font-bold text-[#58A6FF]">
                        {formData.autoRepair.maxSelfRepairIterations} retries
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={formData.autoRepair.maxSelfRepairIterations}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          autoRepair: {
                            ...prev.autoRepair,
                            maxSelfRepairIterations: parseInt(e.target.value, 10),
                          },
                        }))
                      }
                      className="w-full accent-[#1F6FEB] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#8B949E]">
                      Number of sandbox compile-run cycles attempted before halting.
                    </p>
                  </div>

                  {/* Sandbox Auto-Verification */}
                  <div className="p-3 rounded-lg bg-[#111622] border border-[#30363D] flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-[#F0F6FC] block">
                          Auto-Verify in Docker Sandbox
                        </span>
                        <p className="text-[10px] text-[#8B949E] mt-0.5">
                          Immediately execute Maven Surefire in container on patch generation.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.autoRepair.autoVerifyInSandbox}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            autoRepair: {
                              ...prev.autoRepair,
                              autoVerifyInSandbox: e.target.checked,
                            },
                          }))
                        }
                        className="rounded text-[#1F6FEB] focus:ring-0 bg-[#0B0E14] border-[#30363D] cursor-pointer mt-0.5"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-[#3FB950]">
                      {formData.autoRepair.autoVerifyInSandbox ? '✓ Enabled' : 'Disabled'}
                    </span>
                  </div>

                  {/* Flaky Test Detection */}
                  <div className="p-3 rounded-lg bg-[#111622] border border-[#30363D] flex flex-col justify-between space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-[#F0F6FC] block">
                          Flakiness Filter
                        </span>
                        <p className="text-[10px] text-[#8B949E] mt-0.5">
                          Re-runs candidate patch 3x to ensure zero timing/concurrency flake.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.autoRepair.detectFlakyTests}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            autoRepair: {
                              ...prev.autoRepair,
                              detectFlakyTests: e.target.checked,
                            },
                          }))
                        }
                        className="rounded text-[#1F6FEB] focus:ring-0 bg-[#0B0E14] border-[#30363D] cursor-pointer mt-0.5"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-[#E3B341]">
                      {formData.autoRepair.detectFlakyTests ? '3x Verification' : 'Single Run'}
                    </span>
                  </div>
                </div>

                {/* Human Review Threshold & Production Patching */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#F0F6FC]">
                      Human Review Escalation Gate
                    </label>
                    <select
                      value={formData.autoRepair.requireHumanReviewThreshold}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          autoRepair: {
                            ...prev.autoRepair,
                            requireHumanReviewThreshold: e.target.value as HumanReviewThreshold,
                          },
                        }))
                      }
                      className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-1.5 text-xs text-[#F0F6FC] font-mono"
                    >
                      <option value="NEVER">Never (Fully Autonomous CI/CD Merge)</option>
                      <option value="DEPTH_3_PLUS">Depth 3 & 4 Only (Require PR Review - Recommended)</option>
                      <option value="ALWAYS">Always Require Manual Approval</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#F0F6FC]">
                      Production Code Auto-Patching
                    </label>
                    <div className="flex items-center justify-between p-1.5 px-2.5 rounded bg-[#161B22] border border-[#30363D] text-xs">
                      <span className="text-[11px] text-[#8B949E]">
                        Allow AI to fix application classes when test is provably correct
                      </span>
                      <input
                        type="checkbox"
                        checked={formData.autoRepair.allowProductionCodePatching}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            autoRepair: {
                              ...prev.autoRepair,
                              allowProductionCodePatching: e.target.checked,
                            },
                          }))
                        }
                        className="rounded text-[#1F6FEB] focus:ring-0 bg-[#0B0E14] border-[#30363D] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Custom Corporate / QA Directive */}
              <div className="space-y-1.5 pt-4 border-t border-[#30363D]">
                <label className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-[#58A6FF]" />
                  <span>Custom QA / Architecture System Directive</span>
                </label>
                <p className="text-[11px] text-[#8B949E]">
                  Injected into every AI auto-repair prompt to enforce organization-specific QA standards, naming rules, or BigDecimal scale conventions.
                </p>
                <textarea
                  rows={2}
                  value={formData.autoRepair.customSystemPromptPrefix}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      autoRepair: {
                        ...prev.autoRepair,
                        customSystemPromptPrefix: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g., Strictly follow Given-When-Then structure. Enforce BigDecimal.setScale(2, RoundingMode.HALF_UP). Never mock standard Java utilities."
                  className="w-full bg-[#161B22] border border-[#30363D] rounded-md p-2.5 text-xs text-[#F0F6FC] font-mono focus:outline-none focus:border-[#58A6FF]"
                />
              </div>
            </div>
          )}

          {/* TAB 2: TEST GENERATION DEFAULTS */}
          {activeTab === 'generation' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                  Default Test Synthesis Parameters
                </h3>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Configure default options pre-selected when generating new test suites from the AI Test Generator or Code Explorer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#F0F6FC]">
                    Default Test Framework
                  </label>
                  <select
                    value={formData.generation.defaultTestFramework}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        generation: {
                          ...prev.generation,
                          defaultTestFramework: e.target.value as TargetTestFramework,
                        },
                      }))
                    }
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#F0F6FC] font-mono"
                  >
                    <option value="JUNIT_5">JUnit 5 (Jupiter)</option>
                    <option value="MOCKITO_5">Mockito 5</option>
                    <option value="ASSERTJ">AssertJ Fluent</option>
                    <option value="SPRING_BOOT_TEST">Spring Boot Test</option>
                    <option value="REST_ASSURED">REST Assured</option>
                    <option value="TESTNG">TestNG</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#F0F6FC]">
                    Execution Timeout Limit
                  </label>
                  <select
                    value={formData.generation.defaultTimeoutMs}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        generation: {
                          ...prev.generation,
                          defaultTimeoutMs: parseInt(e.target.value, 10),
                        },
                      }))
                    }
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#F0F6FC] font-mono"
                  >
                    <option value={2000}>2,000 ms (Fast Unit Tests)</option>
                    <option value={5000}>5,000 ms (Standard Default)</option>
                    <option value={15000}>15,000 ms (Integration / Testcontainers)</option>
                  </select>
                </div>
              </div>

              {/* Automatic Scenario Inclusions */}
              <div className="space-y-2 pt-3 border-t border-[#30363D]">
                <label className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                  Automated Scenario Matrix Inclusions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2.5 p-2.5 rounded bg-[#161B22] border border-[#30363D] text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.generation.includeParameterizedTests}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          generation: {
                            ...prev.generation,
                            includeParameterizedTests: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-[#1F6FEB] focus:ring-0 bg-[#0B0E14] border-[#30363D]"
                    />
                    <div>
                      <span className="font-semibold text-[#F0F6FC] block">
                        Include Parameterized Tests (@ParameterizedTest + @CsvSource)
                      </span>
                      <span className="text-[11px] text-[#8B949E]">
                        Generates input/output value matrix tables for high-density boundary coverage.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2.5 rounded bg-[#161B22] border border-[#30363D] text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.generation.includeEdgeCasesAndBoundaries}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          generation: {
                            ...prev.generation,
                            includeEdgeCasesAndBoundaries: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-[#1F6FEB] focus:ring-0 bg-[#0B0E14] border-[#30363D]"
                    />
                    <div>
                      <span className="font-semibold text-[#F0F6FC] block">
                        Include Null, Negative, and Boundary Edge Scenarios
                      </span>
                      <span className="text-[11px] text-[#8B949E]">
                        Automatically tests 0, negative amounts, empty collections, and extreme ranges.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2.5 rounded bg-[#161B22] border border-[#30363D] text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.generation.includeCyclomaticBranchCoverage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          generation: {
                            ...prev.generation,
                            includeCyclomaticBranchCoverage: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-[#1F6FEB] focus:ring-0 bg-[#0B0E14] border-[#30363D]"
                    />
                    <div>
                      <span className="font-semibold text-[#F0F6FC] block">
                        Include McCabe Cyclomatic Basis Path Testing
                      </span>
                      <span className="text-[11px] text-[#8B949E]">
                        Generates linearly independent test paths for every if/else, switch, and ternary branch.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EDITOR & FORMATTING */}
          {activeTab === 'editor' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
                  Workspace & Code Viewer Configuration
                </h3>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  Configure code snippet indentation, word wrap, and developer notification toasts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#F0F6FC]">
                    Java Code Indentation
                  </label>
                  <select
                    value={formData.editor.indentSize}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        editor: {
                          ...prev.editor,
                          indentSize: parseInt(e.target.value, 10) as 2 | 4,
                        },
                      }))
                    }
                    className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#F0F6FC] font-mono"
                  >
                    <option value={4}>4 Spaces (Standard Java Style)</option>
                    <option value={2}>2 Spaces (Google Java Style)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#F0F6FC]">
                    Notifications
                  </label>
                  <label className="flex items-center space-x-2 p-2 rounded bg-[#161B22] border border-[#30363D] text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifications.toastOnAutoRepair}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            toastOnAutoRepair: e.target.checked,
                          },
                        }))
                      }
                      className="rounded text-[#1F6FEB] focus:ring-0 bg-[#0B0E14] border-[#30363D]"
                    />
                    <span className="text-[#C9D1D9]">Show toast on self-repair loop finish</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#30363D] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F0F6FC] block">
                  Configuration Backup & Synchronization
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-xs text-[#C9D1D9] font-mono transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#58A6FF]" />
                    <span>Export JSON</span>
                  </button>

                  <label className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-xs text-[#C9D1D9] font-mono transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#3FB950]" />
                    <span>Import JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#30363D] bg-[#0E121A]">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center space-x-1.5 text-xs text-[#8B949E] hover:text-[#F85149] font-mono transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md border border-[#30363D] bg-[#161B22] hover:bg-[#21262D] text-xs text-[#C9D1D9] font-medium transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="save-preferences-btn"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-[#1F6FEB] hover:bg-[#388BFD] disabled:opacity-50 text-xs text-white font-bold transition shadow-sm cursor-pointer active:scale-95"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950]" />
                  <span>Preferences Applied!</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Applying...' : 'Save & Apply Preferences'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
