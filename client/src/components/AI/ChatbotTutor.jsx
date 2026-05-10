// src/components/AI/ChatbotTutor.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { aiService } from '../../services/aiService';

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const SpinnerIcon = () => (
  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
);

const INITIAL_MESSAGES = [
  {
    type: 'ai',
    content: "Hey there! 👋 I'm your AI tutor — ask me anything about coding, concepts, or debugging.",
    timestamp: new Date().toISOString()
  }
];

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ── Markdown-lite renderer: bold, inline code, code blocks ──────────
const renderContent = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let codeBuffer = [];
  let inCode = false;
  let codeLang = '';
  let key = 0;

  const flush = () => {
    if (codeBuffer.length) {
      elements.push(
        <pre key={key++} className="my-2 bg-[#0d1117] border border-white/10 rounded-xl overflow-x-auto text-[12.5px] leading-relaxed">
          {codeLang && (
            <div className="px-4 py-1.5 border-b border-white/10 text-[11px] font-mono text-[#7ee787] tracking-widest uppercase">{codeLang}</div>
          )}
          <code className="block px-4 py-3 text-[#e6edf3] font-mono">{codeBuffer.join('\n')}</code>
        </pre>
      );
      codeBuffer = [];
      codeLang = '';
    }
  };

  const inline = (str, k) => {
    const parts = str.split(/(`[^`]+`)/g);
    return (
      <span key={k}>
        {parts.map((p, i) =>
          p.startsWith('`') && p.endsWith('`') && p.length > 2
            ? <code key={i} className="px-1.5 py-0.5 rounded-md bg-[#1e2433] text-[#79c0ff] font-mono text-[12px]">{p.slice(1, -1)}</code>
            : <span key={i} dangerouslySetInnerHTML={{
                __html: p
                  .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
              }} />
        )}
      </span>
    );
  };

  lines.forEach((line) => {
    if (line.startsWith('```')) {
      if (inCode) { flush(); inCode = false; }
      else { inCode = true; codeLang = line.slice(3).trim(); }
      return;
    }
    if (inCode) { codeBuffer.push(line); return; }

    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />);
    } else if (/^#{1,3} /.test(line)) {
      const lvl = line.match(/^#+/)[0].length;
      const txt = line.replace(/^#+\s/, '');
      const cls = lvl === 1 ? 'text-[15px] font-bold text-white mt-3 mb-1' :
                  lvl === 2 ? 'text-[14px] font-semibold text-[#c9d1d9] mt-2 mb-0.5' :
                              'text-[13px] font-semibold text-[#8b949e] mt-1';
      elements.push(<p key={key++} className={cls}>{txt}</p>);
    } else if (/^[-*•] /.test(line)) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start">
          <span className="text-[#7c5cfc] mt-[3px] text-[10px]">▸</span>
          <span className="text-[13.5px] text-[#c9d1d9] leading-relaxed">{inline(line.replace(/^[-*•] /, ''), key)}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={key++} className="text-[13.5px] text-[#c9d1d9] leading-relaxed">
          {inline(line, key)}
        </p>
      );
    }
  });
  flush();
  return elements;
};

// ── Message ─────────────────────────────────────────────────────────
const Message = React.memo(({ msg }) => {
  const isUser = msg.type === 'user';
  return (
    <div className={`flex gap-3 animate-fadeUp ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
        isUser
          ? 'bg-gradient-to-br from-[#7c5cfc] to-[#5b8dee] text-white shadow-lg shadow-[#7c5cfc]/25'
          : 'bg-[#161b26] text-[#a78bfa] border border-[#30363d]'
      }`}>
        {isUser ? 'Y' : '✦'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-[#7c5cfc] to-[#6d4fe0] text-white rounded-br-sm shadow-lg shadow-[#7c5cfc]/20'
            : msg.isError
              ? 'bg-[#1a0a0a] text-[#fca5a5] border border-red-500/30 rounded-bl-sm'
              : 'bg-[#161b26] border border-[#30363d] rounded-bl-sm'
        }`}>
          {isUser
            ? <p className="text-[13.5px] leading-relaxed text-white whitespace-pre-wrap" style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}>{msg.content}</p>
            : <div className="space-y-1" style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}>{renderContent(msg.content)}</div>
          }
        </div>
        <p className="text-[11px] text-[#484f58] mt-1 px-1" style={{ fontFamily: 'monospace' }}>
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
});
Message.displayName = 'Message';

// ── Typing Indicator ────────────────────────────────────────────────
const TypingIndicator = React.memo(() => (
  <div className="flex gap-3 animate-fadeUp">
    <div className="w-7 h-7 rounded-full bg-[#161b26] border border-[#30363d] flex items-center justify-center text-[10px] text-[#a78bfa] flex-shrink-0 mt-0.5">✦</div>
    <div className="bg-[#161b26] border border-[#30363d] px-4 py-3 rounded-2xl rounded-bl-sm">
      <div className="flex items-center gap-1.5 h-4">
        {[0, 140, 280].map((delay) => (
          <div key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ background: 'linear-gradient(135deg,#7c5cfc,#5b8dee)', animationDelay: `${delay}ms` }} />
        ))}
      </div>
    </div>
  </div>
));
TypingIndicator.displayName = 'TypingIndicator';

// ── Suggestion Chips ────────────────────────────────────────────────
const SUGGESTIONS = [
  'Explain async/await',
  'What is useEffect?',
  'Explain REST vs GraphQL',
  'How does JWT work?',
];

const SuggestionChips = React.memo(({ onSelect }) => (
  <div className="flex flex-wrap gap-2 mb-4 justify-center">
    {SUGGESTIONS.map((s) => (
      <button
        key={s}
        onClick={() => onSelect(s)}
        className="px-3 py-1.5 rounded-full text-[12px] font-medium text-[#a78bfa] border border-[#7c5cfc]/30 bg-[#7c5cfc]/08 hover:bg-[#7c5cfc]/20 hover:border-[#7c5cfc]/60 transition-all duration-200 hover:text-white"
        style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}
      >
        {s}
      </button>
    ))}
  </div>
));
SuggestionChips.displayName = 'SuggestionChips';

// ── Main Component ──────────────────────────────────────────────────
const ChatbotTutor = ({ userId }) => {
  const [messages, setMessages]     = useState(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const textareaRef    = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [inputMessage]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    setShowSuggestions(false);
    const userMessage = { type: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.chatbotTutor({ message: text.trim(), userId });
      if (response.success) {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: response.response,
          timestamp: response.timestamp
        }]);
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'ai',
        content: `⚠️ ${error.message || 'Something went wrong. Please try again.'}`,
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, userId]);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    sendMessage(inputMessage);
  }, [inputMessage, sendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  }, [inputMessage, sendMessage]);

  const canSend = useMemo(
    () => !isLoading && inputMessage.trim().length > 0,
    [isLoading, inputMessage]
  );

  return (
    <>
      {/* Google Font import */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div
        className="flex flex-col h-[calc(100vh-100px)]"
        style={{ fontFamily: "'DM Sans', sans-serif", background: '#0d1117' }}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#21262d] bg-[#0d1117]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8dee] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[#7c5cfc]/25">✦</div>
          <div>
            <h2 className="text-[14px] font-semibold text-white leading-tight">AI Tutor</h2>
            <p className="text-[11px] text-[#3fb950] font-medium leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] inline-block animate-pulse" />
              Online
            </p>
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
          <div className="max-w-2xl mx-auto space-y-5">
            {showSuggestions && messages.length <= 1 && (
              <SuggestionChips onSelect={(s) => { setInputMessage(s); inputRef.current?.focus(); }} />
            )}
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input Bar ────────────────────────────────────────────── */}
        <div
          className="border-t border-[#21262d] px-4 sm:px-6 py-4"
          style={{ background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(20px)' }}
        >
          <div className="max-w-2xl mx-auto">
            <div className={`flex items-end gap-3 bg-[#161b26] border rounded-2xl px-4 py-3 transition-all duration-200 ${
              inputMessage
                ? 'border-[#7c5cfc]/50 shadow-[0_0_24px_rgba(124,92,252,0.12)]'
                : 'border-[#30363d] hover:border-[#484f58]'
            }`}>
              <textarea
                ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything about coding…"
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent text-[13.5px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none resize-none leading-relaxed disabled:opacity-40 max-h-32 overflow-y-auto"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <button
                onClick={handleSubmit}
                disabled={!canSend}
                className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 mb-0.5 ${
                  canSend
                    ? 'bg-gradient-to-br from-[#7c5cfc] to-[#6d4fe0] text-white shadow-md shadow-[#7c5cfc]/30 hover:shadow-[#7c5cfc]/50 hover:scale-105 active:scale-95'
                    : 'bg-[#21262d] text-[#484f58] cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                {isLoading ? <SpinnerIcon /> : <SendIcon />}
              </button>
            </div>
            <p className="text-[11px] text-[#484f58] text-center mt-2">
              Press <kbd className="px-1 py-0.5 rounded bg-[#21262d] text-[#8b949e] text-[10px] font-mono">Enter</kbd> to send ·{' '}
              <kbd className="px-1 py-0.5 rounded bg-[#21262d] text-[#8b949e] text-[10px] font-mono">Shift+Enter</kbd> for newline
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.25s ease-out both; }

        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #30363d; border-radius: 99px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
    </>
  );
};

export default React.memo(ChatbotTutor);