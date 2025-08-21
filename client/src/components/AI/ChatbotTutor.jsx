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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold">AI</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-100">AI Tutor Chat</h3>
          <p className="text-sm text-gray-300">Ask me anything about coding!</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-6 overflow-y-auto max-h-96 space-y-4 bg-gray-900">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
              msg.type === 'user' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'bg-gray-800 text-gray-100 border border-gray-700'
            }`}>
              <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-sm text-gray-300 ml-2">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Form */}
      <div className="p-6 border-t border-gray-700 bg-gray-800">
        <div className="flex gap-3">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="flex-1 px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-700 text-gray-100 placeholder-gray-400 transition-all duration-200"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !inputMessage.trim()}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isLoading || !inputMessage.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:scale-105'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotTutor;