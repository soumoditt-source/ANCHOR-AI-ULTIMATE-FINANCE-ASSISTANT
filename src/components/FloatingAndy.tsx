// @ts-nocheck
// FloatingAndy.tsx — Talking animated avatar + voice input button
// Shows in bottom-right corner of screen at all times on dashboard
// Animates "talking" when Andy speaks (andyTalking state)
// Click to navigate to Andy AI page
import { memo, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, MessageCircle } from 'lucide-react';
import { useStore, LANGUAGES } from '../store/useStore';

export const FloatingAndy = memo(function FloatingAndy() {
  const navigate = useStore((s) => s.navigate);
  const andyTalking = useStore((s) => s.andyTalking);
  const voiceEnabled = useStore((s) => s.voiceEnabled);
  const toggleVoice = useStore((s) => s.toggleVoice);
  const language = useStore((s) => s.language);
  const sendChat = useStore((s) => s.sendChat);
  const activePage = useStore((s) => s.activePage);

  const [listening, setListening] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListen = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setTooltip('Speech not supported in this browser');
      setTimeout(() => setTooltip(''), 2500);
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRec();
    recognitionRef.current.lang = LANGUAGES[language]?.code || 'en-US';
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;
    recognitionRef.current.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      if (activePage !== 'andy') navigate('andy');
      setTimeout(() => sendChat(transcript), 350);
    };
    recognitionRef.current.onerror = () => setListening(false);
    recognitionRef.current.onend = () => setListening(false);
    recognitionRef.current.start();
    setListening(true);
  }, [language, navigate, sendChat, activePage]);

  const stopListen = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return (
    <div className="fixed bottom-6 right-5 z-[150] flex flex-col items-end gap-2" style={{ bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? '80px' : '24px' }}>
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="px-3 py-1.5 rounded-xl glass text-xs text-white/60 border border-white/10 mb-1">
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice toggle */}
      <motion.button onClick={toggleVoice} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
        className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${voiceEnabled ? 'bg-[#00ff88]/15 border-[#00ff88]/40 text-[#00ff88]' : 'bg-white/[0.04] border-white/10 text-white/30'}`}
        title={voiceEnabled ? 'Voice ON (Andy speaks)' : 'Voice OFF'}>
        <Volume2 className="w-3.5 h-3.5" />
      </motion.button>

      {/* Mic button */}
      <motion.button
        onClick={listening ? stopListen : startListen}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${listening ? 'bg-red-500/20 border-red-500/60 text-red-400' : 'bg-purple-500/15 border-purple-500/30 text-purple-400'}`}
        title="Voice chat with Andy">
        {listening
          ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}><MicOff className="w-4 h-4" /></motion.div>
          : <Mic className="w-4 h-4" />}
      </motion.button>

      {/* Main Andy avatar */}
      <motion.button
        onClick={() => navigate('andy')}
        className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00ff88]/40 shadow-[0_0_30px_rgba(0,255,136,0.2)]"
        whileHover={{ scale: 1.08, boxShadow: '0 0 50px rgba(0,255,136,0.4)' }}
        whileTap={{ scale: 0.94 }}
      >
        {/* Face background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2040] to-[#0a1628]" />

        {/* Talking glow rings */}
        {andyTalking && [0, 1, 2].map(i => (
          <motion.div key={i} className="absolute inset-0 rounded-2xl border border-[#00ff88]"
            animate={{ scale: [1, 1.4 + i * 0.2], opacity: [0.5, 0] }}
            transition={{ duration: 0.8 + i * 0.2, repeat: Infinity, delay: i * 0.15 }} />
        ))}

        {/* Face */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Eyes */}
          <div className="flex gap-2.5 mb-1.5">
            {[0, 1].map(i => (
              <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-[#00ff88]"
                animate={andyTalking ? { scaleY: [1, 0.3, 1], opacity: [1, 0.7, 1] } : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: andyTalking ? 0.3 : 2, repeat: Infinity, delay: i * 0.1 }} />
            ))}
          </div>
          {/* Mouth — animates when talking */}
          <motion.div
            className="rounded-full overflow-hidden border border-[#00ff88]/60"
            animate={andyTalking
              ? { width: [14, 22, 14, 18, 14], height: [6, 10, 6, 12, 6] }
              : { width: 14, height: 5 }}
            transition={{ duration: 0.25, repeat: andyTalking ? Infinity : 0 }}
            style={{ background: 'rgba(0,255,136,0.15)' }}
          />
        </div>

        {/* Listening pulse */}
        {listening && (
          <motion.div className="absolute inset-0 bg-red-500/10"
            animate={{ opacity: [0, 0.3, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} />
        )}

        {/* Label */}
        <div className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] text-[#00ff88]/60 font-mono">ANDY AI</div>
      </motion.button>
    </div>
  );
});
