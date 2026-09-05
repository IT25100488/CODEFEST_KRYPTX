'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
  AlertCircle
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
  const [showReasoning, setShowReasoning] = useState(false);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end my-4 animate-fadeIn">
        <div className="max-w-xl px-4 py-3 rounded-2xl bg-slate-800/90 text-slate-100 text-sm leading-relaxed border border-slate-700/50 shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 my-6 max-w-3xl animate-fadeIn">
      {/* Bot Icon */}
      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {/* Error State */}
        {message.isError && (
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
          </div>
        )}

        {/* Multi-Hop Reasoning Accordion (Subtle & Clean) */}
        {message.reasoning && (
          <div className="text-xs">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition-colors py-1 font-mono text-[11px]"
            >
              <span>{showReasoning ? 'Hide reasoning' : 'View multi-hop reasoning'}</span>
              {showReasoning ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showReasoning && (
              <div className="mt-1.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed whitespace-pre-line border-l-2 border-l-amber-500/80">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Main Answer Content */}
        {!message.isError && (
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans space-y-2">
            {message.content}
          </div>
        )}

        {/* Citations Chips */}
        {message.sources && message.sources.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono mr-1">Sources:</span>
            {message.sources.map((src, idx) => (
              <button
                key={`${src.document}-${src.chunk || idx}`}
                onClick={() => onSelectEvidence(src)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                title="Click to view excerpt"
              >
                <FileText className="w-3 h-3 text-amber-400/80" />
                <span className="truncate max-w-[180px]">{src.document}</span>
                {src.chunk && (
                  <span className="text-[10px] text-slate-500">
                    #{src.chunk.replace('DOC_', '').replace('_CHUNK_', ':')}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Action footer */}
        {!message.isError && (
          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
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
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
