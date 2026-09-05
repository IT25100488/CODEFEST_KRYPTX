'use client';

import React from 'react';
import { X, FileText, Bookmark, Hash, Layers, Check, Copy } from 'lucide-react';
import { SourceEvidence } from '../types/chat';

interface EvidenceDrawerProps {
  evidence: SourceEvidence | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ evidence, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!evidence) return null;

  const copyExcerpt = () => {
    if (evidence.text) {
      navigator.clipboard.writeText(evidence.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFolderBadgeColor = (folder?: string) => {
    switch (folder?.toLowerCase()) {
      case 'codex':
        return 'bg-purple-950/60 border-purple-600/40 text-purple-300';
      case 'wiki':
        return 'bg-blue-950/60 border-blue-600/40 text-blue-300';
      case 'ephemera':
        return 'bg-amber-950/60 border-amber-600/40 text-amber-300';
      case 'novel':
        return 'bg-emerald-950/60 border-emerald-600/40 text-emerald-300';
      default:
        return 'bg-slate-800/60 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer panel */}
      <div className="w-full max-w-lg h-full bg-slate-950 border-l border-amber-900/40 shadow-2xl flex flex-col overflow-hidden animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Archival Evidence Record</h2>
              <p className="text-xs text-slate-400">Verified document citation chunk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Document metadata cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Archive Category</span>
              </div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium border uppercase tracking-wider ${getFolderBadgeColor(
                  evidence.source_folder
                )}`}
              >
                {evidence.source_folder || 'General'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Chunk ID</span>
              </div>
              <span className="font-mono text-slate-200 text-xs font-semibold">
                {evidence.chunk || 'N/A'}
              </span>
            </div>
          </div>

          {/* Document File Name */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Corpus Document</span>
            </div>
            <p className="font-mono text-xs text-amber-300 break-all select-all font-medium">
              {evidence.document}
            </p>
            {evidence.relative_path && (
              <p className="font-mono text-[11px] text-slate-500 break-all">
                Path: {evidence.relative_path}
              </p>
            )}
            {evidence.evidence_score !== undefined && (
              <div className="pt-2 text-[11px] text-emerald-400 font-mono">
                Relevance Score: {evidence.evidence_score.toFixed(2)}
              </div>
            )}
          </div>

          {/* Passage Excerpt */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Raw Archival Excerpt
              </label>
              {evidence.text && (
                <button
                  onClick={copyExcerpt}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-950/60 font-serif text-sm leading-relaxed text-slate-200 whitespace-pre-wrap selection:bg-amber-500/30">
              {evidence.text ? (
                evidence.text
              ) : (
                <p className="italic text-slate-400">
                  Full text for chunk {evidence.chunk} referenced from {evidence.document}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
