import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Maximize2, 
  Minimize2,
  BrainCircuit,
  ShieldQuestion,
  Lightbulb,
  AlertCircle,
  Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db } from '../lib/firebase.ts';
import { collection, query, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.tsx';
import { Risk, Asset, RemediationAction } from '../types.ts';
import { cn } from '../lib/utils.ts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const RiskAssistant: React.FC = () => {
  const { userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Risk Strategy Engine initialized. How can I assist with your organizational security posture or remediation roadmap today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !userProfile?.organizationId) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Fetch current context for the LLM
      const risksQ = query(collection(db, `organizations/${userProfile.organizationId}/risks`));
      const assetsQ = query(collection(db, `organizations/${userProfile.organizationId}/assets`));
      const actionsQ = query(collection(db, `organizations/${userProfile.organizationId}/actions`));
      
      const [risksSnap, assetsSnap, actionsSnap] = await Promise.all([
        getDocs(risksQ), 
        getDocs(assetsQ),
        getDocs(actionsQ)
      ]);

      const context = {
        risks: risksSnap.docs.map(d => ({ title: d.data().title, score: d.data().score, status: d.data().status })),
        assets: assetsSnap.docs.map(d => ({ name: d.data().name, type: d.data().type, criticality: d.data().criticality })),
        actions: actionsSnap.docs.map(d => ({ title: d.data().title, status: d.data().status }))
      };

      // 2. Call our proxy API
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        throw new Error(data.error || 'Unknown AI error');
      }
    } catch (error) {
      console.error('Assistant Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error while processing your request. Please check your connectivity and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { label: "Analyze my top risks", icon: AlertCircle },
    { label: "Suggest remediation priorities", icon: Target },
    { label: "Draft a risk scenario for assets", icon: ShieldQuestion },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-all" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "bg-white rounded-[32px] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 zoom-in-95",
          isExpanded ? "w-[600px] h-[700px]" : "w-[400px] h-[550px]"
        )}>
          {/* Header */}
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">Strategic Advisory</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Analysis Engine: Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 scroll-smooth"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-white border border-slate-100 text-slate-700 shadow-sm rounded-tl-none prose prose-slate prose-sm max-w-none"
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                  {msg.role === 'assistant' ? 'System' : 'You'}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-col items-start max-w-[85%] animate-pulse">
                <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex space-x-2">
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length === 1 && !isLoading && (
            <div className="px-6 pb-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => {
                    setInput(s.label);
                    // Triggering manually to ensure input is set first
                    setTimeout(() => handleSendMessage(), 10);
                  }}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm"
                >
                  <s.icon className="w-3 h-3" />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-slate-50 bg-white">
            <form 
              onSubmit={handleSendMessage}
              className="relative"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query risk posture or request analysis..."
                className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400 font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-xl disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[8px] text-center mt-3 text-slate-300 font-bold uppercase tracking-widest">
              Automated advisory based on current organization metadata. Verify against internal policies.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
