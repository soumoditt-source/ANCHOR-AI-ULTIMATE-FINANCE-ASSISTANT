// @ts-nocheck
// pages/Andy.tsx — Full Andy AI chat with voice input/output, document scanning, i18n
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, FileText, Upload, Sparkles, X, Camera } from 'lucide-react';
import { useStore, LANGUAGES } from '../store/useStore';

export const Andy = memo(function Andy() {
  const chatMessages = useStore((s) => s.chatMessages);
  const chatLoading = useStore((s) => s.chatLoading);
  const sendChat = useStore((s) => s.sendChat);
  const voiceEnabled = useStore((s) => s.voiceEnabled);
  const toggleVoice = useStore((s) => s.toggleVoice);
  const andyTalking = useStore((s) => s.andyTalking);
  const language = useStore((s) => s.language);
  const scannedDoc = useStore((s) => s.scannedDoc);
  const scanLoading = useStore((s) => s.scanLoading);
  const scanDocument = useStore((s) => s.scanDocument);

  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, chatLoading]);

  const handle = useCallback(async (msg: string) => {
    if (!msg.trim() || chatLoading) return;
    setInput('');
    await sendChat(msg.trim());
  }, [chatLoading, sendChat]);

  const startListen = useCallback(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) { alert('Voice not supported in this browser'); return; }
    recognitionRef.current = new SpeechRec();
    recognitionRef.current.lang = LANGUAGES[language]?.code || 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setListening(false);
      handle(t);
    };
    recognitionRef.current.onerror = () => setListening(false);
    recognitionRef.current.onend = () => setListening(false);
    recognitionRef.current.start();
    setListening(true);
  }, [language, handle]);

  const stopListen = useCallback(() => { recognitionRef.current?.stop(); setListening(false); }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string)?.split(',')[1];
      if (base64) { scanDocument(base64); setShowScan(true); }
    };
    reader.readAsDataURL(file);
  }, [scanDocument]);

  const QUICK = [
    'How do I pay off debt faster?',
    'What should I invest in?',
    'Calculate my FIRE number',
    'Best way to save $500/month?',
    'What is the avalanche method?',
    'How to improve my credit score?',
  ];

  return (
    <div className="flex flex-col h-full max-h-full p-4 sm:p-6 pb-20 md:pb-6" style={{ minHeight: 'calc(100dvh - 24px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${andyTalking ? 'border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.4)]' : 'border-[#00ff88]/30'} bg-gradient-to-br from-[#0a1628] to-[#0d2040]`}>
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Andy AI</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <p className="text-[10px] text-white/30 font-mono">{andyTalking ? 'SPEAKING...' : 'ONLINE'} · {LANGUAGES[language]?.flag} {LANGUAGES[language]?.label}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button onClick={toggleVoice} whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${voiceEnabled ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : 'border-white/10 text-white/30 hover:text-white/50'}`}>
            <Volume2 className="w-3.5 h-3.5" />
            {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
          </motion.button>
          <motion.button onClick={() => fileRef.current?.click()} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs hover:border-blue-500/40 transition-all">
            <Camera className="w-3.5 h-3.5" /> Scan Doc
          </motion.button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>

      {/* Scanned document result */}
      <AnimatePresence>
        {(showScan && (scannedDoc || scanLoading)) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass rounded-xl p-4 mb-3 border border-blue-500/20 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <p className="text-xs font-bold text-blue-300">Document Analysis</p>
              </div>
              <button onClick={() => setShowScan(false)} className="text-white/20 hover:text-white/50"><X className="w-3.5 h-3.5" /></button>
            </div>
            {scanLoading
              ? <div className="flex items-center gap-2 text-white/40 text-sm"><div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> Scanning document...</div>
              : <pre className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed">{scannedDoc}</pre>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0 pr-1">
        {chatMessages.map((msg, i) => (
          <motion.div key={`${msg.ts}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'andy' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'andy'
                ? 'bg-purple-600/15 border border-purple-500/15 text-white/90 rounded-tl-sm'
                : 'bg-[#00ff88]/10 border border-[#00ff88]/15 text-[#00ff88] rounded-tr-sm'
            }`}>
              {msg.role === 'andy' && <p className="text-[9px] text-purple-400/50 font-mono mb-1">ANDY AI</p>}
              {msg.text}
            </div>
          </motion.div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-purple-600/15 border border-purple-500/15 rounded-tl-sm">
              <div className="flex gap-1.5">
                <span className="text-[9px] text-purple-400/50 font-mono mr-1">ANDY AI</span>
                {[0, 0.15, 0.3].map(d => (
                  <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="flex gap-1.5 flex-wrap mb-2.5 flex-shrink-0">
        {QUICK.map(q => (
          <button key={q} onClick={() => handle(q)}
            className="text-[11px] px-2.5 py-1.5 rounded-xl glass border border-white/[0.07] text-white/35 hover:text-purple-300 hover:border-purple-500/30 transition-all whitespace-nowrap">
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="flex gap-2 flex-shrink-0">
        <motion.button onClick={listening ? stopListen : startListen} whileTap={{ scale: 0.93 }}
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${listening ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'glass border-white/10 text-purple-400'}`}>
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </motion.button>
        <input id="andy-page-input" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handle(input)}
          placeholder={`Message Andy in ${LANGUAGES[language]?.label || 'English'}...`}
          className="flex-1 px-4 py-3 rounded-xl glass border border-white/[0.07] text-white placeholder-white/20 focus:outline-none focus:border-purple-400/30 text-sm min-w-0" />
        <motion.button onClick={() => handle(input)} disabled={!input.trim() || chatLoading}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white disabled:opacity-30 flex items-center justify-center flex-shrink-0">
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
});
