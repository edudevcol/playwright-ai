import React, { useRef, useEffect, useState } from 'react';
import { Send, Bot, User, Code2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onGenerateCode: () => void;
  isProcessing: boolean;
  hasSteps: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onGenerateCode, isProcessing, hasSteps }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          AI Assistant
        </h3>
        {hasSteps && (
          <button 
            onClick={onGenerateCode}
            disabled={isProcessing}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 font-medium"
          >
            <Code2 className="w-3 h-3" />
            Finish & Generate Code
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10 text-sm px-6">
            <p>Hello! I'm your Playwright Automation Architect.</p>
            <p className="mt-2">Tell me what to do step-by-step, for example:</p>
            <ul className="mt-4 space-y-2 text-xs font-mono bg-slate-950/50 p-4 rounded-lg border border-slate-800 inline-block text-left">
              <li>"Navigate to https://example.com"</li>
              <li>"Click the login button"</li>
              <li>"Fill the username with 'admin'"</li>
            </ul>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-slate-800' : 'bg-indigo-600/20'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-slate-400" /> : <Bot className="w-4 h-4 text-indigo-400" />}
            </div>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-slate-200 rounded-tr-sm' 
                : 'bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isProcessing && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4 text-indigo-400" />
             </div>
             <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-tl-sm">
               <div className="flex gap-1">
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type instructions..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-indigo-500/50 transition-all placeholder-slate-600 text-sm"
            disabled={isProcessing}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;