import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Flame, Target } from 'lucide-react';

interface DebtItem {
  name: string;
  balance: number;
  rate: number;
  payment: number;
  color: string;
}

const DEBTS: DebtItem[] = [
  { name: 'Credit Card', balance: 12000, rate: 24.99, payment: 800, color: 'red-500' },
  { name: 'Student Loan', balance: 28000, rate: 6.8, payment: 420, color: 'orange-400' },
  { name: 'Car Loan', balance: 5000, rate: 4.5, payment: 300, color: 'yellow-400' },
];

function DebtBar({ debt, delay }: { debt: DebtItem; delay: number }) {
  const max = 35000;
  const pct = (debt.balance / max) * 100;
  return (
    <motion.div
      className="mb-4"
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/60 font-medium">{debt.name}</span>
        <span className="text-white font-mono">${debt.balance.toLocaleString()} @ {debt.rate}%</span>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-${debt.color} shadow-[0_0_10px_currentColor]`}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="text-right text-xs text-white/30 mt-0.5 font-mono">-${debt.payment}/mo attack</div>
    </motion.div>
  );
}

export default function WindowWarRoom() {

  const [countdown, setCountdown] = useState({ months: 18, pct: 42 });

  // SVG debt trajectory chart points
  const chartPath = "M 0 100 C 20 95, 40 85, 60 70 S 90 40, 120 20 S 150 0, 200 0";

  return (
    <motion.section
      id="war"
      className="absolute inset-0 flex flex-col items-center justify-center pt-20 md:pt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      {/* Red zone aura */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,50,50,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,150,0,0.05) 0%, transparent 70%)' }} />
        {/* Drip Bear */}
        <motion.div
          className="absolute left-8 bottom-0 w-40 h-52 md:w-52 md:h-64 bg-black/50 border border-red-500/30 rounded-3xl flex flex-col items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(255,50,50,0.15)]"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-5xl mb-2">🐻‍❄️</div>
          <div className="text-red-400/70 text-[9px] font-bold uppercase tracking-widest">DEFCON MODE</div>
          <div className="text-[10px] text-white/30 text-center px-2 mt-1 font-mono">Debt Hunting</div>
        </motion.div>
      </div>

      <div className="max-w-5xl w-full px-4 md:px-8 z-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-red-500/70 text-xs tracking-[0.3em] uppercase font-bold mb-1 flex items-center gap-2">
              <Flame size={12} /> Annihilation Protocol Active
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white">THE WAR ROOM</h2>
          </div>
          <div className="text-right">
            <div className="text-4xl font-black text-red-500 font-mono">{countdown.pct}%</div>
            <div className="text-white/30 text-xs font-mono">debt eliminated</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Debt Breakdown */}
          <div className="glass-panel p-6 border-red-500/20">
            <div className="flex items-center gap-2 text-white/40 text-xs tracking-widest uppercase font-bold mb-5">
              <Target size={12} /> Target Acquisition
            </div>
            {DEBTS.map((d, i) => <DebtBar key={d.name} debt={d} delay={i * 0.15} />)}
            <div className="mt-5 pt-4 border-t border-white/5 flex justify-between">
              <div>
                <div className="text-white/30 text-xs">Total Debt</div>
                <div className="text-2xl font-black text-white font-mono">$45,000</div>
              </div>
              <div className="text-right">
                <div className="text-white/30 text-xs">Monthly Attack</div>
                <div className="text-2xl font-black text-red-500 font-mono">$1,520</div>
              </div>
            </div>
          </div>

          {/* Right: Trajectory Chart */}
          <div className="glass-panel p-6 border-red-500/20">
            <div className="flex items-center gap-2 text-white/40 text-xs tracking-widest uppercase font-bold mb-4">
              <Swords size={12} /> Debt to Zero Trajectory
            </div>
            <div className="h-44 w-full relative">
              <div className="absolute left-0 bottom-0 right-0 flex justify-between text-[10px] text-white/20 font-mono">
                <span>Now</span><span>+6mo</span><span>+12mo</span><span>+18mo</span>
              </div>
              <svg viewBox="0 0 200 110" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <motion.path
                  d={`${chartPath} L 200 110 L 0 110 Z`}
                  fill="url(#debtGrad)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
                <motion.path
                  d={chartPath}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  className="drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <circle cx="200" cy="0" r="3" fill="#ef4444" className="drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
              </svg>
            </div>
            <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 flex justify-between items-center">
              <div className="text-white/50 text-xs font-mono">Debt-Free Target</div>
              <div className="text-red-400 font-black font-mono">OCT 2027</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-4 py-3 bg-red-500/10 border border-red-500 text-red-400 font-black uppercase tracking-widest text-sm rounded-xl hover:bg-red-500 hover:text-black transition-all"
            >
              Execute Avalanche Protocol
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
