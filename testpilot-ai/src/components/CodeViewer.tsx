import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  maxHeight?: string;
  highlightLines?: number[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'java',
  title,
  maxHeight = 'max-h-96',
  highlightLines = [],
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="rounded-lg border border-[#30363D] bg-[#0B0E14] overflow-hidden font-mono text-xs shadow-sm">
      {/* Title bar */}
      <div className="bg-[#161B22] px-3.5 py-1.5 border-b border-[#30363D] flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[#8B949E]">
          <Terminal className="w-3.5 h-3.5 text-[#58A6FF]" />
          <span className="font-semibold text-[#C9D1D9]">
            {title || `${language.toUpperCase()} Snippet`}
          </span>
          <span className="text-[10px] text-[#8B949E]">({lines.length} lines)</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-[#8B949E] hover:text-[#F0F6FC] transition py-0.5 px-2 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#3FB950]" />
              <span className="text-[10px] text-[#3FB950]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className={`overflow-auto p-3.5 leading-relaxed ${maxHeight}`}>
        <pre className="text-[#C9D1D9]">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            return (
              <div
                key={idx}
                className={`flex items-start ${
                  isHighlighted ? 'bg-[#D29922]/10 -mx-3.5 px-3.5 border-l-2 border-[#E3B341]' : ''
                }`}
              >
                <span className="w-8 text-right pr-3 text-[#8B949E] select-none shrink-0 font-normal">
                  {lineNum}
                </span>
                <span className="flex-1 whitespace-pre-wrap">{line}</span>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
};
