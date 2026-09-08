'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ThinkingIndicator } from '../components/ThinkingIndicator';
import { EvidenceDrawer } from '../components/EvidenceDrawer';
import { ChatMessage, SourceEvidence, ChatSession } from '../types/chat';
import { SAMPLE_QUESTIONS, MOCK_RESPONSES } from '../data/sampleQuestions';

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<SourceEvidence | null>(null);
  const [isLiveBackend, setIsLiveBackend] = useState(true);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Load chat history from localStorage when the page first opens
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('my_chat_sessions');
      if (savedChats) {
        const parsed = JSON.parse(savedChats);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && 'messages' in parsed[0]) {
            setSessions(parsed);
          } else if (parsed.length > 0 && 'role' in parsed[0]) {
            // Migrate legacy flat messages array to session format
            const initialSession: ChatSession = {
              id: `session_${Date.now()}`,
              title: parsed[0]?.content?.slice(0, 36) || 'Previous Conversation',
              messages: parsed,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            setSessions([initialSession]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load chat sessions from localStorage:', e);
    }
  }, []);

  // 2. Automatically save sessions whenever sessions state updates
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('my_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Check FastAPI backend health on mount and poll every 4s to detect online status
  useEffect(() => {
    let isSubscribed = true;

    async function checkHealth() {
      try {
        const res = await fetch('/api/ask', { method: 'GET' });
        if (isSubscribed) {
          setIsBackendHealthy(res.ok);
        }
      } catch {
        if (isSubscribed) {
          setIsBackendHealthy(false);
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  // Start a new chat session in the same window
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Switch to an existing chat session from the history sidebar
  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setIsSidebarOpen(false);
  };

  // Delete a specific session
  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (updated.length === 0) {
      localStorage.removeItem('my_chat_sessions');
    } else {
      localStorage.setItem('my_chat_sessions', JSON.stringify(updated));
    }

    if (activeSessionId === sessionId) {
      handleNewChat();
    }
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Clear all chat history from this browser?')) {
      localStorage.removeItem('my_chat_sessions');
      setSessions([]);
      handleNewChat();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isThinking) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Determine current session or initialize a new one
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}`;
      setActiveSessionId(currentSessionId);
      const title = query.length > 36 ? `${query.slice(0, 36)}...` : query;
      const newSession: ChatSession = {
        id: currentSessionId,
        title,
        messages: [userMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
    } else {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, userMessage], updatedAt: Date.now() }
            : s
        )
      );
    }

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsThinking(true);

    // If Demo Mode is active
    if (!isLiveBackend) {
      setTimeout(() => {
        const matched = SAMPLE_QUESTIONS.find(
          (q) => q.question.toLowerCase() === query.toLowerCase() || query.toLowerCase().includes(q.title.toLowerCase())
        );

        let mockData = matched ? MOCK_RESPONSES[matched.id] : null;

        if (!mockData) {
          mockData = {
            content: `**Synthesized Archival Finding**\n\nCross-referencing the 415 documents across the archive indicates verified records in both the **Codex Annals** and **Wiki Chronicles**.\n\nThe queried entities share institutional affiliations connected through treaties established during the Third Era.`,
            reasoning: `Hop 1: Located candidate character records in 'the_annals_of_the_ashen_era.pdf'.\nHop 2: Linked faction to recorded treaty outcome in 'the_leaden_accord.md'.\nHop 3: Synthesized multi-hop relationship chain without external assumptions.`,
            sources: [
              {
                document: 'the_annals_of_the_ashen_era.pdf',
                chunk: 'DOC_000015_CHUNK_0008',
                source_folder: 'codex',
                relative_path: 'codex/the_annals_of_the_ashen_era.pdf',
                evidence_score: 124.5,
                text: 'Archival Registry: Cross-referenced subject records indicating formal station and canonical affiliation during the Ashen Era.'
              }
            ]
          };
        }

        const botMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: mockData.content || '',
          reasoning: mockData.reasoning,
          sources: mockData.sources,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botMessage]);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: [...s.messages, botMessage], updatedAt: Date.now() }
              : s
          )
        );
        setIsThinking(false);
      }, 1200);
      return;
    }

    // Call live FastAPI backend via Next.js proxy
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorContent = data.isOffline
          ? `⚠️ **FastAPI backend is not running yet.**\n\nTo connect live: run \`start_app.bat\` or \`uvicorn src.api:app --reload\`.\n\nTip: You can switch to **"Demo Mode"** (top right) to test verified responses immediately.`
          : `⚠️ **Notice**: ${data.error || 'Failed to generate response.'}`;

        const errorMessage: ChatMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: errorContent,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: [...s.messages, errorMessage], updatedAt: Date.now() }
              : s
          )
        );
        if (data.isOffline) {
          setIsBackendHealthy(false);
        }
      } else {
        const botMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: data.answer || 'No answer found in archive.',
          reasoning: data.reasoning,
          sources: data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: [...s.messages, botMessage], updatedAt: Date.now() }
              : s
          )
        );
        setIsBackendHealthy(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Connection error: ${msg}. You can switch to Demo Mode in the top-right corner.`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, errorMessage], updatedAt: Date.now() }
            : s
        )
      );
      fetch('/api/ask', { method: 'GET' })
        .then((res) => setIsBackendHealthy(res.ok))
        .catch(() => setIsBackendHealthy(false));
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Light Header with Group Name, New Chat & Sidebar Trigger */}
      <Header
        isLiveBackend={isLiveBackend}
        isBackendHealthy={isBackendHealthy}
        onToggleMode={() => setIsLiveBackend((p) => !p)}
        onResetChat={handleNewChat}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* Main Chat Stage */}
      <div className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto px-4 sm:px-6 overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto py-6 space-y-2 pr-1">
          {messages.length === 0 ? (
            /* Clean, Fresh Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto my-auto animate-fadeIn">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  KRYPTX Document Assistant
                </h2>
                <p className="text-xs text-slate-500">
                  {isLiveBackend
                    ? 'Connected to live archive. Ask any question across the 415 documents.'
                    : 'Demo Mode active. Select a verified sample question below or enter your prompt.'}
                </p>
              </div>

              {/* Minimal Prompt Chips — ONLY visible in Demo Mode */}
              {!isLiveBackend && (
                <div className="w-full space-y-2 pt-2 text-left animate-fadeIn">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
                    <span>Suggested Demo Questions</span>
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">Demo Mode</span>
                  </div>
                  {SAMPLE_QUESTIONS.slice(0, 3).map((sq) => (
                    <button
                      key={sq.id}
                      onClick={() => handleSendMessage(sq.question)}
                      className="w-full p-3.5 rounded-xl bg-white hover:bg-blue-50/40 border border-slate-200/90 hover:border-blue-300 text-xs text-slate-700 hover:text-blue-900 transition-all shadow-xs flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate pr-2 font-medium">{sq.question}</span>
                      <span className="text-[11px] text-blue-600 font-mono flex-shrink-0 opacity-80 group-hover:opacity-100">
                        {sq.hops} Hops →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Message List */
            <>
              {messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  onSelectEvidence={(evidence) => setSelectedEvidence(evidence)}
                />
              ))}
              {isThinking && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Clean Light Input Area */}
        <div className="py-4">
          <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about the documents..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none outline-none px-3 py-2 max-h-32 leading-relaxed"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isThinking}
              className={`p-2 rounded-xl transition-all duration-150 flex items-center justify-center ${
                inputValue.trim() && !isThinking
                  ? 'bg-blue-600 text-white hover:bg-blue-500 cursor-pointer shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2 text-center text-[11px] text-slate-400 font-mono">
            <span>Enter to submit • Shift+Enter for new line</span>
          </div>
        </div>
      </div>

      {/* Slide-over Previous Chats & Prompts Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        isLiveBackend={isLiveBackend}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearHistory={handleClearHistory}
        onSelectQuestion={(q) => handleSendMessage(q)}
      />

      {/* Slide-over Evidence Inspector */}
      <EvidenceDrawer
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}
