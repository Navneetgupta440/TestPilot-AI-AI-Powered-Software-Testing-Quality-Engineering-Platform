import React from 'react';
import {
  LayoutDashboard,
  Code2,
  Sparkles,
  PlayCircle,
  Wrench,
  Globe2,
  AlertTriangle,
  Bot,
  BarChart3,
  BookOpen,
  FolderGit2,
  UserCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'explorer'
  | 'test-generation'
  | 'test-execution'
  | 'failure-repair'
  | 'api-testing'
  | 'static-analysis'
  | 'ai-assistant'
  | 'quality-reports'
  | 'docs'
  | 'developer';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  untestedGapsCount: number;
  findingsCount: number;
  activeTestRunsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  untestedGapsCount,
  findingsCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'explorer' as NavTab,
      label: 'Code Intelligence',
      icon: Code2,
      badge: 'AST',
    },
    {
      id: 'test-generation' as NavTab,
      label: 'AI Test Generator',
      icon: Sparkles,
      badge: untestedGapsCount > 0 ? `${untestedGapsCount} gaps` : null,
      badgeColor: 'bg-[#D29922]/15 text-[#E3B341] border-[#D29922]/30',
    },
    {
      id: 'test-execution' as NavTab,
      label: 'Sandbox Test Runner',
      icon: PlayCircle,
      badge: 'Docker',
    },
    {
      id: 'failure-repair' as NavTab,
      label: 'Failure Auto-Repair',
      icon: Wrench,
      badge: 'Loop',
    },
    {
      id: 'api-testing' as NavTab,
      label: 'REST API Testing',
      icon: Globe2,
      badge: 'Assured',
    },
    {
      id: 'static-analysis' as NavTab,
      label: 'Static Code Rules',
      icon: AlertTriangle,
      badge: findingsCount > 0 ? `${findingsCount}` : null,
      badgeColor: 'bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30',
    },
    {
      id: 'ai-assistant' as NavTab,
      label: 'RAG AI Assistant',
      icon: Bot,
      badge: '50+ Prompts',
      badgeColor: 'bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/30',
    },
    {
      id: 'quality-reports' as NavTab,
      label: 'Quality Score & Radar',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'docs' as NavTab,
      label: 'Architecture Specs',
      icon: BookOpen,
      badge: 'v1.0',
      badgeColor: 'bg-[#58A6FF]/15 text-[#58A6FF] border-[#58A6FF]/30',
    },
    {
      id: 'developer' as NavTab,
      label: 'Contact / Developer',
      icon: UserCheck,
      badge: 'Author',
      badgeColor: 'bg-[#238636]/15 text-[#3FB950] border-[#3FB950]/30',
    },
  ];

  return (
    <aside
      id="testpilot-sidebar"
      className="w-60 border-r border-[#30363D] bg-[#111622] flex flex-col justify-between shrink-0 select-none"
    >
      <div className="p-3 space-y-0.5">
        <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B949E]">
          Modules
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition group cursor-pointer ${
                isActive
                  ? 'bg-[#1F6FEB]/15 text-[#58A6FF] border border-[#1F6FEB]/40'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive
                      ? 'text-[#58A6FF]'
                      : 'text-[#8B949E] group-hover:text-[#C9D1D9]'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold border ${
                    item.badgeColor ||
                    'bg-[#161B22] text-[#8B949E] border-[#30363D]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-[#30363D] bg-[#0B0E14]">
        <div className="p-2.5 rounded bg-[#161B22] border border-[#30363D] text-[10px] space-y-1 font-mono">
          <div className="flex items-center justify-between text-[#C9D1D9] font-bold">
            <span className="flex items-center space-x-1.5">
              <FolderGit2 className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span>Workspace</span>
            </span>
            <span className="text-[#3FB950]">SYNCED</span>
          </div>
          <p className="text-[#8B949E] truncate">
            Target: <span className="text-[#C9D1D9]">sample-spring-app</span>
          </p>
          <div className="text-[#8B949E]">
            Java 17 • Maven 3.9 • JUnit 5
          </div>
        </div>
      </div>
    </aside>
  );
};
