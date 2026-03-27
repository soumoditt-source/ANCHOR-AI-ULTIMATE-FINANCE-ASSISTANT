import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Anchor } from 'lucide-react';

export default function IntroScreen() {
  const setCurrentView = useStore(state => state.setCurrentView);
  const fetchAllData = useStore(state => state.fetchAllData);

  useEffect(() => {
    // Kick off data sync
    fetchAllData();
    // Advance to onboarding after 3.5s cinematic intro
    const timer = setTimeout(() => {
      // In a real app we'd check if user is already onboarded. We'll simulate going to onboarding for the authentic flow.
      setCurrentView('onboarding');
    }, 3500);
    return () => clearTimeout(timer);
  }, [setCurrentView, fetchAllData]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-cyber-black">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
          className="text-neon-emerald mb-4"
        >
          <Anchor size={64} />
        </motion.div>
        
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
            className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase text-center"
          >
            ANCHOR <span className="text-neon-emerald">AI</span>
          </motion.h1>
        </div>
        
        <div className="overflow-hidden mt-2">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-neon-emerald/50 font-mono text-xs uppercase tracking-[0.5em]"
          >
            System Initialization
          </motion.p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 h-1 bg-white/5 mt-8 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="h-full bg-neon-emerald shadow-[0_0_10px_#00ff88]"
          />
        </div>
      </motion.div>
    </div>
  );
}
