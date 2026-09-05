'use client';

import React, { useEffect, useState } from 'react';
import { GitFork, Search, BrainCircuit, Sparkles } from 'lucide-react';

export const ThinkingIndicator: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: 'Deconstructing question entities...', icon: Search },
    { text: 'Searching multi-hop records (ChromaDB + Voyage)...', icon: GitFork },
    { text: 'Cross-referencing codex and wiki documents...', icon: BrainCircuit },
    { text: 'Synthesizing verified evidence chain...', icon: Sparkles },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  const CurrentIcon = steps[stepIndex].icon;

  return (
    <div className="flex items-start gap-3.5 my-4 max-w-3xl animate-fadeIn">
      <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
      </div>

      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
          <CurrentIcon className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>{steps[stepIndex].text}</span>
        </div>

        <div className="w-56 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Multi-hop reasoning pipeline active
        </div>
      </div>
    </div>
  );
};
