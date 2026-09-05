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
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'wiki':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'ephemera':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'novel':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer panel */}
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Document Evidence
              </h2>
              <p className="text-[11px] text-slate-500">Verified citation excerpt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1 flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-blue-500" />
                <span>Archive Type</span>
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getFolderBadgeColor(
                  evidence.source_folder
                )}`}
              >
                {evidence.source_folder || 'General'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3 text-blue-500" />
                <span>Chunk ID</span>
              </div>
              <span className="font-mono text-slate-800 font-semibold">
                {evidence.chunk || 'N/A'}
              </span>
            </div>
          </div>

          {/* Document File Name */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
            <div className="text-slate-400 text-[10px] uppercase font-semibold flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-500" />
              <span>Source File</span>
            </div>
            <p className="font-mono text-xs text-blue-700 break-all select-all font-semibold">
              {evidence.document}
            </p>
            {evidence.relative_path && (
              <p className="font-mono text-[10px] text-slate-400 break-all">
                {evidence.relative_path}
              </p>
            )}
            {evidence.evidence_score !== undefined && (
              <div className="pt-1 text-[11px] text-emerald-600 font-mono font-medium">
                Relevance: {evidence.evidence_score.toFixed(2)}
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Raw Excerpt Content
              </span>
              {evidence.text && (
                <button
                  onClick={copyExcerpt}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy text</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-700 whitespace-pre-wrap selection:bg-blue-100">
              {evidence.text ? (
                evidence.text
              ) : (
                <p className="italic text-slate-400">
                  Chunk {evidence.chunk} referenced from {evidence.document}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
