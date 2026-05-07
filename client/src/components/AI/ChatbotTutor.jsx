// src/components/AI/ChatbotTutor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/aiService';

const ChatbotTutor = ({ userId }) => {
  const [messages, setMessages] = useState([
    { type: 'ai', content: "Hey there! 👋 I'm your AI tutor — ask me anything about coding, concepts, or debugging.", timestamp: new Date().toISOString() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { type: 'user', content: inputMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.chatbotTutor({ message: userMessage.content, userId });
      if (response.success) {
        setMessages(prev => [...prev, { type: 'ai', content: response.response, timestamp: response.timestamp }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'ai', content: `Something went wrong: ${error.message}`, timestamp: new Date().toISOString(), isError: true }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
              style={{ animation: 'fadeUp 0.3s ease-out' }}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.type === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/[0.08] text-white/60 border border-white/[0.08]'
              }`}>
                {msg.type === 'user' ? 'Y' : '✦'}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] ${msg.type === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                  msg.type === 'user'
                    ? 'bg-violet-600 text-white rounded-br-md'
                    : msg.isError
                      ? 'bg-red-500/10 text-red-300 border border-red-500/20 rounded-bl-md'
                      : 'bg-white/[0.05] text-white/85 border border-white/[0.06] rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <p className="text-[11px] text-white/20 mt-1.5 px-1">{formatTime(msg.timestamp)}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-3" style={{ animation: 'fadeUp 0.3s ease-out' }}>
              <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-xs text-white/60">✦</div>
              <div className="bg-white/[0.05] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-white/[0.06] bg-[#0f1117]/80 backdrop-blur-xl px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about coding..."
            disabled={isLoading}
            className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.06] disabled:text-white/20 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ChatbotTutor;