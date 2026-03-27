import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import { Anchor, Zap, Target, TrendingUp, Bot } from 'lucide-react';

interface Props { scrollYProgress: MotionValue<number>; }

const NAV_ITEMS = [
  { icon: Zap, label: 'Drop', href: '#drop', section: 0 },
  { icon: Target, label: 'Command', href: '#command', section: 0.2 },
  { icon: Target, label: 'War Room', href: '#war', section: 0.4 },
  { icon: TrendingUp, label: 'Infinity', href: '#infinity', section: 0.6 },
  { icon: Bot, label: 'Andy AI', href: '#andy', section: 0.8 },
];

export default function NavBar({ scrollYProgress }: Props) {
  const navOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const navY = useTransform(scrollYProgress, [0, 0.05], [-60, 0]);

  const scrollTo = (index: number) => {
    const container = document.querySelector('[class*="overflow-y-scroll"]') as HTMLElement;
    if (container) {
      const target = container.scrollHeight * (index * 0.2);
      container.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      style={{ opacity: navOpacity, y: navY }}
    >
      <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-full px-4 py-2 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 mr-4 pr-4 border-r border-white/10">
          <Anchor className="text-neon-emerald" size={16} />
          <span className="text-white font-black text-sm tracking-tight">ANCHOR</span>
        </div>
        {NAV_ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className="px-3 py-1.5 rounded-full text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all font-medium"
          >
            {item.label}
          </button>
        ))}
      </div>
    </motion.nav>
  );
}
