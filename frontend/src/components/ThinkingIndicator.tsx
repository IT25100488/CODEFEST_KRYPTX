'use client';

import React, { useEffect, useState } from 'react';
import { GitFork, Search, BrainCircuit, Sparkles } from 'lucide-react';

export const ThinkingIndicator: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: 'Deconstructing question entities & relational intent...', icon: Search },
    { text: 'Traversing multi-hop vector space (ChromaDB + Voyage)...', icon: GitFork },
    { text: 'Cross-referencing Annals codex and Wiki entries...', icon: BrainCircuit },
    { text: 'Synthesizing evidence chain & grounding facts...', icon: Sparkles },
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
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/30 flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-amber-300 font-medium">
          <CurrentIcon className="w-4 h-4 animate-spin-slow text-amber-400" />
          <span>{steps[stepIndex].text}</span>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-700 ease-out"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>Multi-Hop Pipeline Active</span>
          <span>•</span>
          <span className="text-slate-400">Track 1B Reasoning</span>
        </div>
      </div>
    </div>
  );
};
