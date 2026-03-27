import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Zap, BarChart2, MessageCircle } from 'lucide-react';
import { AIService, AITask } from '../services/ai.service';

interface Message {
  id: number;
  role: 'user' | 'andy';
  text: string;
  taskType?: AITask;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: 'Debt Payoff', query: 'Best strategy to eliminate $45,000 in debt aggressively?' },
  { label: 'FIRE at 40', query: 'How much do I need to invest monthly to retire at 40 with $2.5M?' },
  { label: 'BTC outlook', query: 'What is your Bitcoin price prediction for 2025-2026?' },
  { label: 'Portfolio split', query: 'Optimal crypto vs equities allocation for a 28-year-old?' },
];

export default function WindowAndy() {

  const [messages, setMessages] = useState<Message[]>([{
    id: 0,
    role: 'andy',
    text: "Yo. I'm ANDY — your Anchor AI Neural Debt Yntelligence. I route your questions to the best AI model (Gemini, Groq, or OpenRouter) based on complexity. What do you want to dominate today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const taskType = AIService.detectTaskType(text);
    try {
      const response = await AIService.chat(text, taskType);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'andy',
        text: response,
        taskType,
        timestamp: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'andy',
        text: "Neural link disrupted. Check your API keys and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const taskTypeLabel = (t?: AITask) => {
    if (!t) return null;
    const map: Record<AITask, { label: string; color: string; engine: string }> = {
      'chat': { label: 'Chat', color: 'neon-purple', engine: 'Gemini' },
      'analysis': { label: 'Analysis', color: 'neon-gold', engine: 'OpenRouter' },
      'fast_calc': { label: 'Calculation', color: 'neon-emerald', engine: 'Groq' },
    };
    return map[t];
  };

  return (
    <motion.section
      id="andy"
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background: floating currency & Oracle aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(191,0,255,0.06) 0%, transparent 60%)' }} />
        {['₹', '$', '€', '£', '¥', '₿'].map((sym, i) => (
          <motion.div
            key={sym}
            className="absolute text-white/5 font-black select-none"
            style={{
              fontSize: `${Math.random() * 60 + 40}px`,
              left: `${10 + i * 15}%`,
              top: `${Math.random() * 70 + 10}%`,
            }}
            animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          >
            {sym}
          </motion.div>
        ))}
      </div>

      <div className="max-w-4xl w-full h-screen flex flex-col px-4 md:px-8 py-20 z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 shrink-0">
          <motion.div
            className="w-12 h-12 rounded-full bg-neon-purple/20 border border-neon-purple/50 flex items-center justify-center shadow-[0_0_20px_rgba(191,0,255,0.4)]"
            animate={{ boxShadow: ['0 0 20px rgba(191,0,255,0.4)', '0 0 40px rgba(191,0,255,0.8)', '0 0 20px rgba(191,0,255,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Bot className="text-neon-purple" size={22} />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-white">ANDY AI</h2>
            <p className="text-xs font-mono text-white/30 flex items-center gap-2 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-purple animate-pulse" />
              Multi-LLM Oracle (Gemini · Groq · OpenRouter)
            </p>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 shrink-0">
          {QUICK_PROMPTS.map(p => (
            <button
              key={p.label}
              onClick={() => sendMessage(p.query)}
              className="text-xs text-left bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white/50 hover:text-white hover:border-neon-purple/50 hover:bg-neon-purple/5 transition-all font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 glass-panel border-neon-purple/20 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-hide">
            <AnimatePresence>
              {messages.map(msg => {
                const meta = msg.role === 'andy' ? taskTypeLabel(msg.taskType) : null;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 16, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-white/10' : 'bg-neon-purple/20 border border-neon-purple/40'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-neon-purple" />}
                    </div>
                    <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {meta && (
                        <div className={`text-[9px] uppercase tracking-widest font-bold text-${meta.color}/60 flex items-center gap-1`}>
                          <Zap size={8} /> {meta.engine} · {meta.label}
                        </div>
                      )}
                      <div className={`p-3 md:p-4 rounded-2xl text-sm leading-relaxed font-mono whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-white/10 text-white rounded-tr-sm'
                          : 'bg-black/60 border border-neon-purple/20 text-white/90 rounded-tl-sm shadow-[0_0_20px_rgba(191,0,255,0.07)]'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-neon-purple" />
                </div>
                <div className="bg-black/60 border border-neon-purple/20 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                  {[0, 150, 300].map(delay => (
                    <motion.div key={delay} className="w-2 h-2 bg-neon-purple rounded-full"
                      animate={{ y: [0, -6, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: delay / 1000 }} />
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 md:p-4 border-t border-white/5 shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask Andy anything financial..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-neon-purple/60 focus:shadow-[0_0_15px_rgba(191,0,255,0.2)] font-mono transition-all"
              />
              <motion.button
                onClick={() => sendMessage(input)}
                disabled={isTyping || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-3 bg-neon-purple text-black font-black rounded-xl hover:shadow-[0_0_20px_rgba(191,0,255,0.5)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
