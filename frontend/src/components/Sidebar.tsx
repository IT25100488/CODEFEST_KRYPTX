'use client';

import React from 'react';
import { X, Sparkles, Database } from 'lucide-react';
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
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={onClose} />

      {/* Slide-over Drawer */}
      <aside className="relative w-80 max-w-[85vw] h-full bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between p-5 z-50 animate-slideLeft">
        <div className="space-y-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Sample Prompts</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 transition-all text-xs text-slate-700 group"
              >
                <div className="text-[10px] text-blue-600 font-semibold mb-1 flex items-center justify-between">
                  <span>{q.category}</span>
                  <span className="text-slate-400">{q.hops} Hops</span>
                </div>
                <p className="leading-snug text-slate-800 group-hover:text-blue-950 font-medium">
                  {q.question}
                </p>
              </button>
            ))}
          </div>

          {/* Corpus Info */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Corpus Summary</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              415 documents (Novels, Wiki, Codex, Ephemera) indexed with ChromaDB and Voyage embeddings.
            </p>
          </div>
        </div>

        {/* Team Footer */}
        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
          <span>SLIIT Codefest 2026 • Team KRYPTX</span>
        </div>
      </aside>
    </div>
  );
};
