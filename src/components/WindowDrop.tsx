import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';

const TICKER_ITEMS = ['BTC $85.2K ▲', 'ETH $3.1K ▲', 'NVDA $980 ▲', 'SOL $162 ▼', 'NET WORTH +12% ▲'];

// 3D Tilt Card wrapper
function TiltCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 20;
    const y = -(e.clientY - top - height / 2) / 20;
    ref.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${y}deg) scale3d(1.05, 1.05, 1.05)`;
  };
  
  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-300 ease-out will-change-transform [transform-style:preserve-3d] ${className}`}
    >
      {children}
    </div>
  );
}

export default function WindowDrop() {
  return (
    <motion.section
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)' }}
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(191,0,255,0.15) 0%, transparent 70%)' }}
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Characters Row — 3D Parallax Tilt Avatars */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-6 md:gap-16 items-end px-4 pointer-events-auto z-20">
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <TiltCard>
            <div className="relative w-28 h-32 md:w-44 md:h-52 bg-gradient-to-br from-black/80 to-yellow-900/20 border border-neon-gold/40 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.15)] backdrop-blur-xl group cursor-pointer">
              <div className="text-5xl md:text-7xl mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">🐻</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neon-gold font-black">Drip Bear</div>
              <div className="absolute -top-3 -right-3 text-xs bg-neon-gold text-black font-black w-8 h-8 flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(255,215,0,0.8)]">⛓️</div>
            </div>
          </TiltCard>
        </motion.div>

        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="-mb-8 z-10">
          <TiltCard>
            <div className="relative w-36 h-48 md:w-56 md:h-72 bg-gradient-to-b from-purple-900/30 to-black/80 border border-neon-purple/50 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_80px_rgba(191,0,255,0.3)] backdrop-blur-xl group cursor-pointer">
              <div className="text-6xl md:text-8xl mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_25px_rgba(191,0,255,0.5)]">🤖</div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-neon-purple font-black">The Oracle</div>
              <motion.div className="absolute inset-0 rounded-3xl border border-neon-purple/50" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
          </TiltCard>
        </motion.div>

        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <TiltCard>
            <div className="relative w-28 h-32 md:w-44 md:h-52 bg-gradient-to-bl from-black/80 to-emerald-900/20 border border-neon-emerald/40 rounded-3xl flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,255,136,0.15)] backdrop-blur-xl group cursor-pointer">
              <div className="text-5xl md:text-7xl mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_15px_rgba(0,255,136,0.5)]">🐷</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-neon-emerald font-black">Hype Piggy</div>
              <div className="absolute -top-3 -right-3 text-xs bg-neon-emerald text-black font-black w-8 h-8 flex items-center justify-center rounded-full shadow-[0_0_20px_rgba(0,255,136,0.8)]">₿</div>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 text-center flex flex-col items-center px-4 -mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="flex items-center gap-3 mb-8 bg-black/40 border border-neon-emerald/40 rounded-full px-6 py-2.5 backdrop-blur-md shadow-[0_0_30px_rgba(0,255,136,0.2)]"
        >
          <Anchor className="text-neon-emerald" size={18} />
          <span className="text-neon-emerald text-[11px] md:text-xs uppercase tracking-[0.25em] font-black">Wealth OS 2026 — Gen-Z Financial Intelligence</span>
        </motion.div>

        <motion.h1
          className="text-7xl sm:text-8xl md:text-[12rem] font-black tracking-tighter mb-2 leading-none"
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #00ff88 60%, #bf00ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ANCHOR 
        </motion.h1>
        
        <motion.h1
          className="text-5xl sm:text-6xl md:text-[8rem] font-black tracking-widest mb-6 leading-none text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}
        >
          NEXUS
        </motion.h1>

        <motion.p
          className="text-white/60 text-lg md:text-2xl max-w-2xl mb-12 font-light tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Stop tracking your money. <strong className="text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">Command it.</strong>
        </motion.p>
      </div>

      {/* High-End Ticker Tape */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-neon-emerald/20 overflow-hidden py-3 bg-black/60 backdrop-blur-xl z-30">
        <motion.div
          className="flex gap-16 text-sm font-mono text-neon-emerald font-bold whitespace-nowrap"
          animate={{ x: [0, '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ textShadow: '0 0 10px rgba(0,255,136,0.5)' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="shrink-0 tracking-widest">{item}</span>
          ))}
        </motion.div>
      </div>


    </motion.section>
  );
}
