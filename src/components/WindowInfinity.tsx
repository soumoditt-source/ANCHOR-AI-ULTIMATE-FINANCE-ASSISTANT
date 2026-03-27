import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart, Sliders } from 'lucide-react';
import { useStore } from '../store/useStore';

const ALLOCATIONS = [
  { label: 'US Equities', pct: 40, color: '#00ff88' },
  { label: 'Crypto (BTC/ETH)', pct: 25, color: '#bf00ff' },
  { label: 'International', pct: 15, color: '#ffd700' },
  { label: 'Real Estate', pct: 12, color: '#ff6600' },
  { label: 'Bonds', pct: 8, color: '#00bfff' },
];

function DonutChart({ allocations }: { allocations: typeof ALLOCATIONS }) {
  const r = 60;
  const cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  let cumulativePct = 0;

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full max-h-64 mx-auto drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">
      {allocations.map((a, i) => {
        const dashLen = (a.pct / 100) * circ;
        const offset = circ - (cumulativePct / 100) * circ;
        cumulativePct += a.pct;
        return (
          <motion.circle
            key={a.label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={a.color}
            strokeWidth="18"
            strokeDasharray={`${dashLen} ${circ - dashLen}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            style={{ filter: `drop-shadow(0 0 6px ${a.color}88)` }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        );
      })}
      <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="800" fontFamily="monospace">FIRE</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace">Portfolio</text>
    </svg>
  );
}

export default function WindowInfinity() {

  const [retireAge, setRetireAge] = useState(45);
  const { cryptos } = useStore();

  const monthsToFire = Math.max(1, (retireAge - 26) * 12);
  const monthlyNeeded = Math.floor(2500000 / monthsToFire);
  const projectedFund = (retireAge - 26) * 28000;

  return (
    <motion.section
      id="infinity"
      className="absolute inset-0 flex flex-col items-center justify-center pt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      {/* Space Blue/Green Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(0,255,136,0.05) 0%, transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(0,100,255,0.04) 0%, transparent 60%)' }} />
        {/* Hype Piggy */}
        <motion.div
          className="absolute right-8 top-1/2 -translate-y-1/2 w-44 h-60 bg-black/40 border border-neon-emerald/30 rounded-3xl flex flex-col items-center justify-center backdrop-blur-md shadow-[0_0_40px_rgba(0,255,136,0.1)]"
          animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-5xl mb-2">🐷</div>
          <div className="text-neon-emerald/60 text-[9px] font-bold uppercase tracking-wider">Surfing Alpha</div>
          <div className="text-white/30 text-[10px] font-mono text-center px-2 mt-1">Riding Bull Waves</div>
        </motion.div>
      </div>

      <div className="max-w-6xl w-full px-4 md:px-8 z-10">
        <div className="mb-8">
          <div className="text-neon-emerald/60 text-xs tracking-[0.3em] uppercase font-bold mb-1 flex items-center gap-2">
            <TrendingUp size={12} /> Autonomous Wealth Generation
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white">INFINITY ENGINE</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* FIRE Calculator */}
            <div className="glass-panel p-6 border-neon-emerald/20">
              <div className="flex items-center gap-2 text-white/40 text-xs tracking-widest uppercase font-bold mb-5">
                <Sliders size={12} /> FIRE Age Calculator
              </div>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-white/60 text-sm">Target Retirement Age</span>
                <span className="text-5xl font-black text-neon-emerald">{retireAge}</span>
              </div>
              <input
                type="range" min={30} max={65} value={retireAge}
                title="Retirement Age"
                aria-label="Target Retirement Age"
                onChange={e => setRetireAge(+e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: '#00ff88', background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${((retireAge-30)/35)*100}%, rgba(255,255,255,0.1) ${((retireAge-30)/35)*100}%, rgba(255,255,255,0.1) 100%)` }}
              />
              <div className="flex justify-between text-xs text-white/20 mt-1 font-mono">
                <span>30</span><span>65</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/5">
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Monthly Required</div>
                  <div className="text-neon-emerald font-black font-mono">${monthlyNeeded.toLocaleString()}</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Projected Fund</div>
                  <div className="text-white font-black font-mono">${(projectedFund / 1000).toFixed(0)}K</div>
                </div>
              </div>
            </div>

            {/* Live Crypto Performance */}
            <div className="glass-panel p-4 border-neon-emerald/10">
              <div className="text-white/30 text-xs uppercase tracking-wider font-bold mb-3">Live Holdings Performance</div>
              <div className="space-y-2">
                {cryptos.slice(0, 3).map(c => (
                  <div key={c.id} className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">{c.name}</span>
                    <span className={`text-xs font-mono font-bold ${c.change_24h >= 0 ? 'text-neon-emerald' : 'text-red-400'}`}>
                      {c.change_24h >= 0 ? '+' : ''}{c.change_24h.toFixed(2)}%
                    </span>
                  </div>
                ))}
                {cryptos.length === 0 && <div className="text-white/20 text-xs">Loading...</div>}
              </div>
            </div>
          </div>

          {/* Right: Donut Chart */}
          <div className="glass-panel p-6 border-neon-emerald/20">
            <div className="flex items-center gap-2 text-white/40 text-xs tracking-widest uppercase font-bold mb-4">
              <PieChart size={12} /> Asset Allocation
            </div>
            <DonutChart allocations={ALLOCATIONS} />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
              {ALLOCATIONS.map(a => (
                <div key={a.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color, boxShadow: `0 0 6px ${a.color}` }} />
                  <span className="text-white/40 text-xs">{a.label}</span>
                  <span className="text-white/60 text-xs font-mono ml-auto">{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
