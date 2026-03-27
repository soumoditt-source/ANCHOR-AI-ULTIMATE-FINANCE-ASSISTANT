// @ts-nocheck
// pages/Infinity.tsx — FIRE Engine with projections and allocations
import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Timer, PieChart, Bot, TrendingUp } from 'lucide-react';
import { useStore, formatMoney } from '../store/useStore';

export const Infinity = memo(function Infinity() {
  const fireTargetAge = useStore((s) => s.fireTargetAge);
  const fireMonthly = useStore((s) => s.fireMonthly);
  const currentAge = useStore((s) => s.currentAge);
  const updateFire = useStore((s) => s.updateFire);
  const navigate = useStore((s) => s.navigate);
  const currency = useStore((s) => s.currency);
  const appMode = useStore((s) => s.appMode);

  const [targetAge, setTargetAge] = useState(fireTargetAge);
  const [monthly, setMonthly] = useState(fireMonthly);
  const [age, setAge] = useState(currentAge);

  const handleChange = useCallback((setter: any, storeKey: string) => (v: number) => {
    setter(v);
    const newTargetAge = storeKey === 'targetAge' ? v : targetAge;
    const newMonthly = storeKey === 'monthly' ? v : monthly;
    const newAge = storeKey === 'age' ? v : age;
    updateFire(newAge, newMonthly, newTargetAge);
  }, [targetAge, monthly, age, updateFire]);

  const yearsToFire = Math.max(0, targetAge - age);
  const fireNumber = monthly * 12 * 25;
  const passiveIncome = (fireNumber * 0.04) / 12;
  const totalSaved = monthly * 12 * yearsToFire;
  const capitalGainsAt7 = Math.round(monthly * ((Math.pow(1 + 0.07 / 12, 12 * yearsToFire) - 1) / (0.07 / 12)));

  const ALLOCS = [
    { label: 'Index Funds', pct: 45, color: '#3b82f6' },
    { label: 'Crypto',      pct: 25, color: '#8b5cf6' },
    { label: 'Real Estate', pct: 20, color: '#10b981' },
    { label: 'Bonds',       pct: 10, color: '#f59e0b' },
  ];

  const PROJECTIONS = [
    { label: 'FIRE Number (25×)', val: formatMoney(fireNumber, currency), color: 'text-[#00ff88]', desc: 'Safe withdrawal target' },
    { label: 'Monthly Passive', val: formatMoney(passiveIncome, currency), color: 'text-cyan-400', desc: 'At 4% withdrawal' },
    { label: 'Years to FIRE', val: `${yearsToFire} years`, color: 'text-white', desc: `Retire at ${targetAge}` },
    { label: 'Capital at 7% return', val: formatMoney(capitalGainsAt7, currency), color: 'text-purple-400', desc: 'Invested consistently' },
  ];

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-black text-white">Infinity Engine</h1>
          {appMode === 'cfo' && <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">CFO DEEP ANALYTICS</span>}
        </div>
        <motion.button onClick={() => navigate('andy')} whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/20 text-purple-400 text-xs">
          <Bot className="w-3.5 h-3.5" /> Ask Andy to optimize
        </motion.button>
      </div>

      {/* Sliders */}
      <div className="glass rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-4 h-4 text-cyan-400" />
          <p className="text-sm font-bold text-white">F.I.R.E. Timeline</p>
        </div>
        {[
          { label: 'Current Age', val: age, min: 18, max: 60, unit: 'yrs', key: 'age', setter: setAge },
          { label: 'Target FIRE Age', val: targetAge, min: 30, max: 70, unit: 'yrs', key: 'targetAge', setter: setTargetAge },
          { label: 'Monthly Savings', val: monthly, min: 100, max: 15000, step: 100, unit: '/mo', key: 'monthly', setter: setMonthly },
        ].map(s => (
          <div key={s.key}>
            <div className="flex justify-between text-sm mb-2.5">
              <span className="text-white/50">{s.label}</span>
              <span className="text-[#00ff88] font-black">{s.unit === '/mo' ? formatMoney(s.val, currency) : `${s.val} ${s.unit}`}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={(s as any).step || 1} value={s.val}
              onChange={e => handleChange(s.setter, s.key)(+e.target.value)}
              className="w-full accent-[#00ff88]" />
          </div>
        ))}
      </div>

      {/* Projections */}
      <div className="grid grid-cols-2 gap-3">
        {PROJECTIONS.map(p => (
          <div key={p.label} className="glass rounded-2xl p-4">
            <p className="text-[10px] text-white/35 mb-1">{p.label}</p>
            <p className={`text-xl font-black ${p.color}`}>{p.val}</p>
            <p className="text-[10px] text-white/20 mt-0.5">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Asset allocation */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4 text-purple-400" />
          <p className="text-sm font-bold text-white">Recommended Allocation</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            {ALLOCS.map((a, i) => (
              <motion.div key={i} className="absolute border rounded-full"
                style={{ inset: `${i * 14}px`, borderColor: a.color + '50', borderWidth: 2 }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }} />
            ))}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs font-black text-white">WEALTH</p>
              <p className="text-[9px] text-white/40">Mix</p>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            {ALLOCS.map(a => (
              <div key={a.label} className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${a.pct}%` }} transition={{ duration: 1.2 }}
                    className="h-full rounded-full" style={{ background: a.color }} />
                </div>
                <span className="text-xs text-white/40 w-20">{a.label}</span>
                <span className="text-xs font-black w-7 text-right" style={{ color: a.color }}>{a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.button onClick={() => navigate('warroom')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm">
        Start Debt Annihilation Protocol →
      </motion.button>
    </div>
  );
});
