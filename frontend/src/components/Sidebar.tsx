'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Database,
  Plus,
  MessageSquare,
  Trash2,
  History,
  Clock
} from 'lucide-react';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { SampleQuestion, ChatSession } from '../types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  isLiveBackend: boolean;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearHistory: () => void;
  onSelectQuestion: (question: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  isLiveBackend,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearHistory,
  onSelectQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'prompts'>('history');

  // If we switch to live mode, keep tab on history
  useEffect(() => {
    if (isLiveBackend) {
      setActiveTab('history');
    }
  }, [isLiveBackend]);

  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <aside className="relative w-84 max-w-[85vw] h-full bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between p-4 z-50 animate-slideLeft">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 tracking-wide uppercase">
              <History className="w-4 h-4 text-blue-600" />
              <span>Previous Chats</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="pt-3 pb-2 flex-shrink-0">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Chat</span>
            </button>
          </div>

          {/* Navigation Tabs (Only show Demo Prompts tab when in Demo Mode) */}
          {!isLiveBackend ? (
            <div className="flex p-1 bg-slate-100/80 rounded-xl mb-3 flex-shrink-0 text-xs font-medium text-slate-600">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'history'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chats ({sessions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('prompts')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'prompts'
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Prompts</span>
              </button>
            </div>
          ) : (
            <div className="pt-1 pb-2 px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Saved Conversations</span>
              <span className="font-mono text-slate-400">({sessions.length})</span>
            </div>
          )}

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {activeTab === 'history' || isLiveBackend ? (
              sessions.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-600">No previous chats yet</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                    Your conversations are saved automatically in your browser.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sessions.map((session) => {
                    const isActive = session.id === activeSessionId;
                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          onSelectSession(session);
                          onClose();
                        }}
                        className={`group relative flex items-start justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-50/70 border-blue-200 text-blue-900 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200/70 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 pr-6">
                          <MessageSquare
                            className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                              isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate leading-tight">
                              {session.title || 'Untitled Chat'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(session.updatedAt)}
                              </span>
                              <span>•</span>
                              <span>{session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delete Session Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          title="Delete chat"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all absolute right-2 top-2.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {sessions.length > 0 && (
                    <div className="pt-3 flex justify-center">
                      <button
                        onClick={onClearHistory}
                        className="text-[11px] text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 py-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear all previous chats</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              /* Sample Prompts Tab (Demo Mode Only) */
              <div className="space-y-2">
                <div className="text-[11px] text-slate-500 font-medium pb-1">
                  Verified questions for demo inspection:
                </div>
                {SAMPLE_QUESTIONS.map((q: SampleQuestion) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      onSelectQuestion(q.question);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 transition-all text-xs text-slate-700 group cursor-pointer"
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
            )}
          </div>

          {/* Corpus Info Footer */}
          <div className="pt-3 border-t border-slate-100 flex-shrink-0 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium text-[11px]">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Corpus: 415 Documents Indexed</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              <span>SLIIT Codefest 2026 • Team KRYPTX</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
