'use client';

import React from 'react';
import { X, Sparkles, Database, FileText } from 'lucide-react';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { SampleQuestion } from '../types/chat';

interface SidebarProps {
  onSelectQuestion: (question: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onSelectQuestion,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over Drawer */}
      <aside className="relative w-80 max-w-[85vw] h-full bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col justify-between p-5 z-50 animate-slideLeft">
        <div className="space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sample Inquiries</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sample Prompts */}
          <div className="space-y-2">
            {SAMPLE_QUESTIONS.map((q: SampleQuestion) => (
              <button
                key={q.id}
                onClick={() => {
                  onSelectQuestion(q.question);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/30 transition-all text-xs text-slate-300 group"
              >
                <div className="text-[10px] text-amber-400/80 font-mono mb-1 flex items-center justify-between">
                  <span>{q.category}</span>
                  <span className="opacity-75">{q.hops} Hops</span>
                </div>
                <p className="leading-snug text-slate-200 group-hover:text-amber-200 line-clamp-2">
                  {q.question}
                </p>
              </button>
            ))}
          </div>

          {/* Corpus Info */}
          <div className="pt-4 border-t border-slate-900 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Corpus Scope</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              415 documents (Novels, Wiki, Codex, Ephemera) indexed with ChromaDB and Voyage embeddings.
            </p>
          </div>
        </div>

        {/* Team Footer */}
        <div className="pt-4 border-t border-slate-900 text-[11px] text-slate-500">
          <span>SLIIT Codefest 2026 • Team KRYPTX</span>
        </div>
      </aside>
    </div>
  );
};
