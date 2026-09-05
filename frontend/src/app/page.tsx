'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Search,
  BookOpen,
  HelpCircle,
  Menu,
  Shield,
  Layers,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ThinkingIndicator } from '../components/ThinkingIndicator';
import { EvidenceDrawer } from '../components/EvidenceDrawer';
import { ChatMessage, SourceEvidence } from '../types/chat';
import { SAMPLE_QUESTIONS, MOCK_RESPONSES } from '../data/sampleQuestions';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<SourceEvidence | null>(null);
  const [isLiveBackend, setIsLiveBackend] = useState(true);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check FastAPI backend health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/ask', { method: 'GET' });
        if (res.ok) {
          setIsBackendHealthy(true);
        } else {
          setIsBackendHealthy(false);
        }
      } catch {
        setIsBackendHealthy(false);
      }
    }
    checkHealth();
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
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

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsThinking(true);

    // 1. Check if we should use local Archive Demo Mode or if Live mode is chosen
    if (!isLiveBackend) {
      // Simulate multi-hop reasoning demo
      setTimeout(() => {
        // Try finding matching sample question
        const matched = SAMPLE_QUESTIONS.find(
          (q) => q.question.toLowerCase() === query.toLowerCase() || query.toLowerCase().includes(q.title.toLowerCase())
        );

        let mockData = matched ? MOCK_RESPONSES[matched.id] : null;

        if (!mockData) {
          // Default generic multi-hop demo answer
          mockData = {
            content: `**Synthesized Archival Finding**\n\nCross-referencing the 415 documents across the Ashen Era Archive indicates related records in both the **Codex Annals** and **Wiki Chronicles**.\n\nThe queried entities share institutional affiliations connected through treaties established in the Third Era.`,
            reasoning: `Hop 1: Extracted key named entities from prompt → Located candidate passages in 'the_annals_of_the_ashen_era.pdf'.\nHop 2: Linked entity to recorded historical treaty in 'the_leaden_accord.md'.\nHop 3: Formulated grounded response without external assumptions.`,
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
        setIsThinking(false);
      }, 1500);
      return;
    }

    // 2. Call FastAPI backend via Next.js proxy route
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the FastAPI server is offline, offer fallback gracefully
        const errorContent = data.isOffline
          ? `⚠️ **FastAPI Backend Offline** (Could not reach \`http://127.0.0.1:8000\`).\n\nTo connect live: have backend teammate run \`python -m uvicorn api.main:app --reload\`.\n\n*Tip*: You can switch to **"Archive Demo Mode"** (using the top-right toggle) to demo and test verified multi-hop responses right now!`
          : `⚠️ **Server Error**: ${data.error || 'Failed to generate answer from archive pipeline.'}`;

        const errorMessage: ChatMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: errorContent,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsBackendHealthy(false);
      } else {
        // Successfully received answer from live FastAPI
        const botMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: data.answer || 'No answer generated.',
          reasoning: data.reasoning,
          sources: data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsBackendHealthy(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Connection error: ${msg}. You can switch to Archive Demo Mode at any time.`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsBackendHealthy(false);
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

  const handleResetChat = () => {
    setMessages([]);
  };

  const handleToggleMode = () => {
    setIsLiveBackend((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-[#080c14] text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation & Status */}
      <Header
        isLiveBackend={isLiveBackend}
        isBackendHealthy={isBackendHealthy}
        onToggleMode={handleToggleMode}
        onResetChat={handleResetChat}
      />

      {/* Main Workspace: Sidebar + Chat Feed */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          onSelectQuestion={(q) => handleSendMessage(q)}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Chat Stage */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-[#080c14] relative">
          {/* Mobile Sidebar Toggle Button */}
          <div className="lg:hidden p-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-medium"
            >
              <Menu className="w-4 h-4" />
              <span>Archive Prompts & Stats</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">Track 1B</span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
            {messages.length === 0 ? (
              /* Empty State Hero Screen */
              <div className="max-w-3xl mx-auto my-auto py-10 flex flex-col items-center text-center space-y-8 animate-fadeIn">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-950/60 border border-amber-500/30 flex items-center justify-center shadow-2xl shadow-amber-950/50">
                    <BookOpen className="w-10 h-10 text-amber-400" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-semibold shadow">
                    Track 1B
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight">
                    Explore The Ashen Era Archive
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    A multi-hop intelligent document assistant engineered for complex inquiries across{' '}
                    <span className="text-amber-300 font-medium">415 fantasy documents</span> and{' '}
                    <span className="text-amber-300 font-medium">1,277 pages</span> of mixed lore, codexes, and ephemera.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left text-xs">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Layers className="w-4 h-4" />
                      <span>Multi-Hop Retrieval</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Connects separated facts when no single document contains the full answer.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Shield className="w-4 h-4" />
                      <span>Strict Grounding</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Answers using solely archival evidence—eliminating fictitious model hallucinations.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Database className="w-4 h-4" />
                      <span>Citation Inspector</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Inspect the raw source text chunks, document IDs, and relevance rankings.
                    </p>
                  </div>
                </div>

                {/* Instant Prompt Cards */}
                <div className="w-full space-y-3 pt-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Try an Official Benchmark Question:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                    {SAMPLE_QUESTIONS.slice(0, 2).map((sq) => (
                      <button
                        key={sq.id}
                        onClick={() => handleSendMessage(sq.question)}
                        className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-xs transition-all group shadow-sm flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-[10px] text-amber-400/90 font-mono mb-1 w-full">
                          <span>{sq.category}</span>
                          <span className="flex items-center gap-1 text-slate-500 group-hover:text-amber-300">
                            Run Query <ArrowUpRight className="w-3 h-3" />
                          </span>
                        </div>
                        <p className="text-slate-200 font-medium group-hover:text-amber-200 leading-snug">
                          {sq.question}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Active Message Stream */
              <div className="max-w-3xl mx-auto space-y-2">
                {messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    message={msg}
                    onSelectEvidence={(evidence) => setSelectedEvidence(evidence)}
                  />
                ))}

                {isThinking && <ThinkingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-end gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/10 shadow-2xl transition-all"
              >
                <div className="p-2 text-slate-500 flex-shrink-0">
                  <Search className="w-5 h-5 text-amber-400/70" />
                </div>

                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question requiring multi-hop reasoning across the Ashen Era Archive..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none outline-none py-1.5 max-h-36 overflow-y-auto leading-relaxed"
                />

                <button
                  type="submit"
                  disabled={!inputValue.trim() || isThinking}
                  className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                    inputValue.trim() && !isThinking
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-950/40 cursor-pointer scale-100'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                  title="Send message (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Helper shortcut indicator */}
              <div className="mt-2 px-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Press <strong className="text-slate-300">Enter</strong> to submit, <strong className="text-slate-300">Shift + Enter</strong> for line break</span>
                <span>SLIIT Codefest 2026</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Slide-over Evidence Inspector Drawer */}
      <EvidenceDrawer
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
      />
    </div>
  );
}
