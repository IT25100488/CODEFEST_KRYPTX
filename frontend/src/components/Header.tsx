'use client';

import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

interface HeaderProps {
  isLiveBackend: boolean;
  isBackendHealthy: boolean | null;
  onToggleMode: () => void;
  onResetChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLiveBackend,
  isBackendHealthy,
  onToggleMode,
  onResetChat,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-100 tracking-tight">
            Ashen Era
          </span>
          <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
            Track 1B
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Backend Mode Pill */}
        <button
          onClick={onToggleMode}
          title="Toggle between FastAPI Live and Archive Demo Mode"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLiveBackend
                ? isBackendHealthy
                  ? 'bg-emerald-400'
                  : 'bg-amber-400 animate-pulse'
                : 'bg-indigo-400'
            }`}
          />
          <span>
            {isLiveBackend
              ? isBackendHealthy
                ? 'Live API'
                : 'API Connecting'
              : 'Demo Mode'}
          </span>
        </button>

        {/* New Chat */}
        <button
          onClick={onResetChat}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          title="Start a new chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
};
