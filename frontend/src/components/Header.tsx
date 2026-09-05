'use client';

import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

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
    <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      {/* Group Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 font-bold text-sm tracking-wide">
          K
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-slate-900 tracking-tight">
            KRYPTX
          </span>
          <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200/80 font-semibold px-2 py-0.5 rounded-full">
            AI Assistant
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend Mode Pill */}
        <button
          onClick={onToggleMode}
          title="Toggle between Live Backend and Demo Mode"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100/90 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveBackend
                ? isBackendHealthy
                  ? 'bg-emerald-500'
                  : 'bg-amber-500 animate-pulse'
                : 'bg-indigo-500'
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Start a new chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
};
