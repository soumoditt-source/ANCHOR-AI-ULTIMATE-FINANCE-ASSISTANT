// @ts-nocheck  
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor } from 'lucide-react';

const BOOT_MESSAGES = [
  'Initializing Financial Matrix...',
  'Connecting Market Intelligence...',
  'Loading Wealth Algorithms...',
  'Calibrating FIRE Calculator...',
  'Starting Andy AI Engine...',
  'System Operational.',
];

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(() => { setDone(true); setTimeout(onComplete, 600); }, 300); return 100; }
        if (p % 16 === 0) setMsgIdx(m => Math.min(m + 1, BOOT_MESSAGES.length - 1));
        return p + 1.5;
      });
    }, 22);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#020209]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Animated grid bg */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(0,255,136,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,1) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Glowing orbs */}
          <motion.div className="absolute w-96 h-96 rounded-full bg-[#00ff88] blur-[180px] opacity-10"
            animate={{ scale: [1, 1.3, 1], x: [-60, 60, -60] }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="absolute w-80 h-80 rounded-full bg-[#8b5cf6] blur-[150px] opacity-10"
            animate={{ scale: [1.2, 1, 1.2], y: [40, -40, 40] }} transition={{ duration: 10, repeat: Infinity }} />

          {/* Logo */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#0088ff] flex items-center justify-center mb-8"
              animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 30px rgba(0,255,136,0.3)', '0 0 80px rgba(0,255,136,0.6)', '0 0 30px rgba(0,255,136,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Anchor className="w-10 h-10 text-black" strokeWidth={2.5} />
            </motion.div>

            <h1 className="text-5xl font-black tracking-tighter mb-1">
              <span className="text-white">ANCHOR </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#0088ff]">AI</span>
            </h1>
            <p className="text-white/30 text-xs font-mono tracking-[0.3em] uppercase mb-12">Wealth OS — Enterprise Edition</p>

            {/* Progress bar */}
            <div className="w-72 h-1 bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div className="h-full bg-gradient-to-r from-[#00ff88] to-[#0088ff] rounded-full"
                animate={{ width: `${progress}%` }} transition={{ ease: 'linear' }} />
            </div>

            <motion.p className="text-[#00ff88]/60 text-xs font-mono" key={msgIdx}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
              {BOOT_MESSAGES[msgIdx]} {progress < 100 ? `${Math.round(progress)}%` : ''}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
