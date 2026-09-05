'use client';

import React from 'react';
import { BookOpen, Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

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
    <header className="sticky top-0 z-30 w-full border-b border-amber-900/30 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-2xl">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/50 border border-amber-500/30 shadow-lg shadow-amber-950/40">
          <BookOpen className="w-5 h-5 text-amber-400 drop-shadow" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-lg lg:text-xl font-bold tracking-wide text-slate-100 flex items-center gap-2">
              <span>ASHEN ERA</span>
              <span className="text-amber-400/90 font-mono text-sm uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                ARCHIVE
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Sparkles className="w-3 h-3 text-amber-400/70" />
            <span>Intelligent Multi-Hop Document Assistant</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-300/80 font-medium">Track 1B</span>
          </p>
        </div>
      </div>

      {/* Center: Corpus metadata stats pill (hidden on small screens) */}
      <div className="hidden md:flex items-center gap-4 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 shadow-inner">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>Corpus: <strong className="text-slate-100 font-mono">415 Docs</strong></span>
        </div>
        <span className="text-slate-700">|</span>
        <div>
          <span>Volume: <strong className="text-slate-100 font-mono">~1,277 Pgs</strong></span>
        </div>
        <span className="text-slate-700">|</span>
        <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
          ChromaDB + Voyage
        </span>
      </div>

      {/* Right: Controls & Connection Mode */}
      <div className="flex items-center gap-2.5">
        {/* Connection Mode Toggle */}
        <button
          onClick={onToggleMode}
          title="Toggle between live FastAPI backend and built-in Archive Demo Mode"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
            isLiveBackend
              ? isBackendHealthy
                ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300 hover:bg-emerald-900/40 shadow-sm shadow-emerald-900/20'
                : 'bg-amber-950/40 border-amber-600/40 text-amber-300 hover:bg-amber-900/40'
              : 'bg-indigo-950/40 border-indigo-600/40 text-indigo-300 hover:bg-indigo-900/40'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>
            {isLiveBackend
              ? isBackendHealthy
                ? 'FastAPI Live'
                : 'FastAPI (Offline / Reconnecting)'
              : 'Archive Demo Mode'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveBackend
                ? isBackendHealthy
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
                : 'bg-indigo-400'
            }`}
          />
        </button>

        {/* Reset Chat */}
        <button
          onClick={onResetChat}
          className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800 transition-colors"
        >
          Clear
        </button>

        {/* GitHub link */}
        <a
          href="https://github.com/IT25100488/CODEFEST_KRYPTX"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-amber-300 hover:bg-slate-800/60 border border-slate-800 transition-colors"
        >
          <span>Repo</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
