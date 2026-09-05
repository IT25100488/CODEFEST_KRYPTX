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
        <div className="max-w-xl px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-sm leading-relaxed shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5 my-5 max-w-3xl animate-fadeIn">
      {/* Bot Icon */}
      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Error State */}
        {message.isError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
          </div>
        )}

        {/* Multi-Hop Reasoning Accordion (Subtle & Light) */}
        {message.reasoning && (
          <div className="text-xs">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors py-1 font-mono text-[11px]"
            >
              <span>{showReasoning ? 'Hide reasoning' : 'View multi-hop reasoning'}</span>
              {showReasoning ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showReasoning && (
              <div className="mt-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 leading-relaxed whitespace-pre-line border-l-2 border-l-blue-500">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Main Answer Card */}
        {!message.isError && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-slate-800 space-y-3">
            <div className="text-sm leading-relaxed whitespace-pre-line font-sans">
              {message.content}
            </div>

            {/* Citation Pills */}
            {message.sources && message.sources.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Sources:</span>
                {message.sources.map((src, idx) => (
                  <button
                    key={`${src.document}-${src.chunk || idx}`}
                    onClick={() => onSelectEvidence(src)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                    title="Click to view excerpt"
                  >
                    <FileText className="w-3 h-3 text-blue-500" />
                    <span className="truncate max-w-[180px]">{src.document}</span>
                    {src.chunk && (
                      <span className="text-[10px] text-slate-400 font-sans">
                        #{src.chunk.replace('DOC_', '').replace('_CHUNK_', ':')}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action footer */}
        {!message.isError && (
          <div className="flex items-center gap-3 pt-0.5 px-1 text-[11px] text-slate-400">
            <span>{message.timestamp}</span>
            <button
              onClick={copyContent}
              className="flex items-center gap-1 hover:text-slate-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
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
