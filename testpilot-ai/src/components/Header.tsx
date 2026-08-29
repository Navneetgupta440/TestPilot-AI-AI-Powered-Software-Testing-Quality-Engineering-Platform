import React from 'react';
import { Project, MutationDepth } from '../types';
import { TestPilotLogo } from './TestPilotLogo';
import {
  GitBranch,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Plus,
  Sliders,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onTriggerAnalysis: () => void;
  isAnalyzing: boolean;
  onOpenNewProject: () => void;
  onOpenPreferences: () => void;
  onOpenDeveloperProfile?: () => void;
  mutationDepth?: MutationDepth;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onTriggerAnalysis,
  isAnalyzing,
  onOpenNewProject,
  onOpenPreferences,
  onOpenDeveloperProfile,
  mutationDepth = 2,
}) => {
  return (
    <header
      id="testpilot-header"
      className="h-14 border-b border-[#30363D] bg-[#161B22] px-5 flex items-center justify-between z-30 shrink-0 select-none"
    >
      {/* Brand & Project Selector */}
      <div className="flex items-center space-x-5">
        <TestPilotLogo size="md" />

        <div className="h-5 w-px bg-[#30363D] hidden md:block" />

        {/* Project Selector dropdown */}
        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-[11px] text-[#8B949E] font-medium">Repo:</span>
          <div className="relative">
            <select
              id="header-project-select"
              aria-label="Active Project"
              value={activeProject?.id || ''}
              onChange={(e) => {
                const found = projects.find((p) => p.id === e.target.value);
                if (found) onSelectProject(found);
              }}
              className="bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-xs rounded-md px-2.5 py-1 pr-7 focus:border-[#58A6FF] focus:outline-none font-mono cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.framework})
                </option>
              ))}
            </select>
          </div>

          <button
            id="header-add-project-btn"
            onClick={onOpenNewProject}
            className="p-1 rounded-md text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] transition border border-[#30363D] cursor-pointer"
            title="Import New Repository"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Branch Badge */}
        {activeProject && (
          <div className="hidden lg:flex items-center space-x-1 px-2 py-0.5 rounded bg-[#0B0E14] border border-[#30363D] text-[#C9D1D9] text-[11px] font-mono">
            <GitBranch className="w-3 h-3 text-[#58A6FF]" />
            <span>{activeProject.currentBranch}</span>
          </div>
        )}
      </div>

      {/* System Status Indicators & Actions */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Engine Status Badges */}
        <div className="hidden xl:flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-[#C9D1D9] px-2 py-0.5 rounded bg-[#0B0E14] border border-[#30363D]">
            <Cpu className="w-3 h-3 text-[#3FB950]" />
            <span className="text-[11px]">Gemini 3.7 Flash</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[#C9D1D9] px-2 py-0.5 rounded bg-[#0B0E14] border border-[#30363D]">
            <ShieldCheck className="w-3 h-3 text-[#58A6FF]" />
            <span className="text-[11px]">Docker Sandbox: Ready</span>
          </div>
        </div>

        {/* AI Preferences Button */}
        <button
          id="header-preferences-btn"
          onClick={onOpenPreferences}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md bg-[#0B0E14] hover:bg-[#21262D] border border-[#30363D] text-xs text-[#C9D1D9] hover:text-[#F0F6FC] transition cursor-pointer font-mono group"
          title="Configure AI Auto-Repair & Developer Preferences"
        >
          <Sliders className="w-3.5 h-3.5 text-[#58A6FF] group-hover:rotate-45 transition-transform duration-200" />
          <span className="hidden md:inline">AI Preferences</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#58A6FF]/15 text-[#58A6FF] border border-[#58A6FF]/30 font-bold">
            Depth {mutationDepth}
          </span>
        </button>

        {/* Trigger Analysis Button */}
        <button
          id="header-trigger-analysis-btn"
          onClick={onTriggerAnalysis}
          disabled={isAnalyzing}
          className="flex items-center space-x-1.5 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md border border-[#3FB950]/30 shadow-sm transition active:scale-95 cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`}
          />
          <span>{isAnalyzing ? 'Scanning...' : 'Scan AST'}</span>
        </button>

        {/* Developer Profile Pill */}
        <div
          onClick={onOpenDeveloperProfile || onOpenPreferences}
          className="flex items-center space-x-2 pl-2 border-l border-[#30363D] cursor-pointer hover:opacity-80 transition group"
          title="Author & Lead Developer: Navneet Gupta (Click to view Contact/Details)"
        >
          <div className="w-6 h-6 rounded bg-[#1F6FEB]/20 border border-[#1F6FEB]/40 flex items-center justify-center text-[10px] font-bold text-[#58A6FF] font-mono group-hover:bg-[#1F6FEB]/30 transition">
            NG
          </div>
          <div className="hidden sm:block text-left font-mono">
            <p className="text-[11px] font-medium text-[#C9D1D9] leading-none group-hover:text-[#58A6FF] transition">
              Navneet Gupta
            </p>
            <p className="text-[9px] text-[#3FB950] leading-none mt-0.5">DEV DETAILS</p>
          </div>
        </div>
      </div>
    </header>
  );
};

