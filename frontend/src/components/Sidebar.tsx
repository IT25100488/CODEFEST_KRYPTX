'use client';

import React from 'react';
import {
  BookOpen,
  HelpCircle,
  FileCode,
  Users,
  Compass,
  ArrowRight,
  Database
} from 'lucide-react';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { SampleQuestion } from '../types/chat';

interface SidebarProps {
  onSelectQuestion: (question: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onSelectQuestion,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:static top-[57px] bottom-0 left-0 z-20 w-80 bg-slate-950/95 border-r border-amber-900/20 backdrop-blur-xl flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* Corpus Structure Summary */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>The Ashen Era Archive</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Codex Volumes</span>
                <span className="font-mono text-sm font-bold text-slate-200">3 Data Books</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Wiki Lore</span>
                <span className="font-mono text-sm font-bold text-slate-200">90 Articles</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Ephemera</span>
                <span className="font-mono text-sm font-bold text-slate-200">~150 Records</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Novel Volumes</span>
                <span className="font-mono text-sm font-bold text-slate-200">4 Volumes</span>
              </div>
            </div>
          </div>

          {/* Sample Prompts (Track 1B Multi-Hop) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Test Prompts (Track 1B)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1-Click Demo</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Official evaluation benchmarks requiring multi-hop synthesis across documents:
            </p>

            <div className="space-y-2">
              {SAMPLE_QUESTIONS.map((q: SampleQuestion) => (
                <button
                  key={q.id}
                  onClick={() => {
                    onSelectQuestion(q.question);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800/80 hover:border-amber-500/30 transition-all group"
                >
                  <div className="flex items-center justify-between text-[10px] text-amber-400/90 font-mono mb-1">
                    <span>{q.category}</span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      {q.hops} Hops
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium group-hover:text-amber-200 line-clamp-2 leading-relaxed">
                    {q.question}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-amber-400/80 mt-2 font-mono">
                    <span>Ask assistant</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Team & Competition info */}
        <div className="pt-4 border-t border-slate-900 space-y-2">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Team KRYPTX</span>
            </div>
            <p className="text-[11px] text-slate-400">
              SLIIT Codefest 2026 • AI Challenge Powered by IFS
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-mono flex flex-wrap gap-1">
              <span className="text-amber-400/90">Dumindu (UI/UX)</span> •
              <span>Himath</span> •
              <span>Hirusha</span> •
              <span>Vishwa</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
