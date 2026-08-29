import React, { useState } from 'react';
import { Project } from '../types';
import { X, FolderGit2, GitBranch, Sparkles } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (data: Partial<Project>) => Promise<void>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [buildSystem, setBuildSystem] = useState<'MAVEN' | 'GRADLE'>('MAVEN');
  const [framework, setFramework] = useState<'SPRING_BOOT' | 'MICRONAUT' | 'QUARKUS' | 'STANDARD_JAVA'>('SPRING_BOOT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateProject({
        name: name.trim(),
        description: description.trim(),
        repositoryUrl: repositoryUrl.trim() || 'https://github.com/org/' + name.trim(),
        defaultBranch: defaultBranch.trim() || 'main',
        buildSystem,
        framework,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-lg bg-[#161B22] border border-[#30363D] shadow-2xl overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#111622] border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-[#58A6FF]" />
            <h2 className="font-bold text-[#F0F6FC] text-sm">Connect & Analyze Java Repository</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-[#F0F6FC] p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[#C9D1D9] font-semibold">Repository Name / Service ID</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. order-settlement-service"
              className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-lg p-2.5 focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#C9D1D9] font-semibold">GitHub / GitLab Repository URL</label>
            <input
              type="text"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/company/order-settlement-service"
              className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-lg p-2.5 focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[#C9D1D9] font-semibold">Default Branch</label>
              <div className="relative">
                <GitBranch className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-lg pl-8 pr-2.5 py-2.5 focus:outline-none focus:border-[#58A6FF]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#C9D1D9] font-semibold">Build Tool</label>
              <select
                aria-label="Build Tool"
                value={buildSystem}
                onChange={(e) => setBuildSystem(e.target.value as any)}
                className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-lg p-2.5 focus:outline-none cursor-pointer"
              >
                <option value="MAVEN">Maven (pom.xml)</option>
                <option value="GRADLE">Gradle (build.gradle)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#C9D1D9] font-semibold">Framework Archetype</label>
            <select
              aria-label="Framework Archetype"
              value={framework}
              onChange={(e) => setFramework(e.target.value as any)}
              className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-lg p-2.5 focus:outline-none cursor-pointer"
            >
              <option value="SPRING_BOOT">Spring Boot 3.x (Web, JPA, Security)</option>
              <option value="MICRONAUT">Micronaut Framework</option>
              <option value="QUARKUS">Quarkus Supersonic</option>
              <option value="STANDARD_JAVA">Standard Java 17/21 Library</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#C9D1D9] font-semibold">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Core financial ledger & user settlement microservice..."
              className="w-full bg-[#0B0E14] border border-[#30363D] text-[#F0F6FC] rounded-lg p-2.5 focus:outline-none focus:border-[#58A6FF]"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#30363D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white font-semibold rounded-lg flex items-center space-x-1.5 border border-[#3FB950]/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Importing & Parsing AST...' : 'Connect & Analyze AST'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
