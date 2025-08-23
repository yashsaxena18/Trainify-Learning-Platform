// src/components/AI/ChatbotTutor.jsx
import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../../services/aiService';

const ChatbotTutor = ({ userId }) => {
  const [messages, setMessages] = useState([
    { type: 'ai', content: "👋 Hi! I'm your AI tutor.", timestamp: new Date().toISOString() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
      setMessages(prev => [...prev, { type: 'ai', content: `❌ Error: ${error.message}`, timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-xl">
        <div className="flex items-center gap-4 p-4 md:p-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white font-bold text-lg">🤖</span>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">AI Tutor</h2>
            <p className="text-sm text-white/60">Ask me anything about coding!</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] px-4 py-3 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] ${
                msg.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md' 
                  : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 border border-white/10 rounded-bl-md backdrop-blur-sm'
              }`}>
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.type === 'user' ? 'text-white/70' : 'text-white/50'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Form */}
      <div className="sticky bottom-0 backdrop-blur-xl bg-white/5 border-t border-white/10 shadow-xl">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full px-4 py-3 md:py-4 pr-12 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white/5 backdrop-blur-sm text-white placeholder-white/40 transition-all duration-300 text-sm md:text-base"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-white/30 text-sm">💬</span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className={`px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold transition-all duration-300 transform ${
                isLoading || !inputMessage.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              <span className="hidden sm:inline text-sm md:text-base">Send</span>
              <span className="sm:hidden text-lg">🚀</span>
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatbotTutor;