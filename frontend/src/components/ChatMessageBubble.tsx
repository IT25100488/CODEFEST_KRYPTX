'use client';

import React, { useState } from 'react';
import {
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
  GitCommit,
  AlertTriangle
} from 'lucide-react';
import { ChatMessage, SourceEvidence } from '../types/chat';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onSelectEvidence: (evidence: SourceEvidence) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onSelectEvidence,
}) => {
  const [showReasoning, setShowReasoning] = useState(true);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFolderBadgeColor = (folder?: string) => {
    switch (folder?.toLowerCase()) {
      case 'codex':
        return 'text-purple-300 border-purple-800/60 bg-purple-950/40 hover:bg-purple-900/60';
      case 'wiki':
        return 'text-blue-300 border-blue-800/60 bg-blue-950/40 hover:bg-blue-900/60';
      case 'ephemera':
        return 'text-amber-300 border-amber-800/60 bg-amber-950/40 hover:bg-amber-900/60';
      case 'novel':
        return 'text-emerald-300 border-emerald-800/60 bg-emerald-950/40 hover:bg-emerald-900/60';
      default:
        return 'text-slate-300 border-slate-700 bg-slate-800/60 hover:bg-slate-700/60';
    }
  };

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 my-4 animate-fadeIn">
        <div className="max-w-2xl p-4 rounded-2xl rounded-tr-sm bg-gradient-to-br from-amber-600/90 to-amber-700/90 text-slate-950 font-medium shadow-lg shadow-amber-950/30">
          <p className="text-sm sm:text-base leading-relaxed">{message.content}</p>
          <span className="block mt-1 text-[11px] text-amber-950/70 font-mono text-right">
            {message.timestamp}
          </span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5 my-5 max-w-3xl animate-fadeIn">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Error State */}
        {message.isError && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p>{message.content}</p>
          </div>
        )}

        {/* Multi-Hop Reasoning Accordion (Track 1B Key Insight) */}
        {message.reasoning && (
          <div className="rounded-xl border border-amber-900/30 bg-slate-900/50 backdrop-blur-md overflow-hidden transition-all">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-amber-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <GitCommit className="w-3.5 h-3.5 text-amber-400" />
                <span>Multi-Hop Reasoning Pathway (Chain of Thought)</span>
              </div>
              {showReasoning ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showReasoning && (
              <div className="px-4 py-3 border-t border-slate-800/60 bg-slate-950/60 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line space-y-1.5 border-l-2 border-l-amber-500/60">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Main Answer Bubble */}
        {!message.isError && (
          <div className="p-5 rounded-2xl rounded-tl-sm bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md text-slate-100 space-y-4">
            {/* Formatted Answer */}
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {message.content}
            </div>

            {/* Citations & Evidence Pill Bar */}
            {message.sources && message.sources.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cited Archive Documents ({message.sources.length}):</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {message.sources.map((src, idx) => (
                    <button
                      key={`${src.document}-${src.chunk || idx}`}
                      onClick={() => onSelectEvidence(src)}
                      className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer shadow-sm ${getFolderBadgeColor(
                        src.source_folder
                      )}`}
                      title="Click to inspect raw archival chunk"
                    >
                      <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold truncate max-w-[170px] sm:max-w-[220px]">
                        {src.document}
                      </span>
                      {src.chunk && (
                        <span className="text-[10px] opacity-75 font-sans px-1 py-0.2 rounded bg-black/40">
                          {src.chunk.replace('CHUNK_', 'C')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bubble Action Footer */}
            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 font-mono">
              <span>{message.timestamp}</span>
              <button
                onClick={copyContent}
                className="flex items-center gap-1 hover:text-slate-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
