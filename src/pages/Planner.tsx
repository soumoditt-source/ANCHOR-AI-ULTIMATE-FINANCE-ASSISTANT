// @ts-nocheck
// pages/Planner.tsx — FIRE Path Planner: full simulation with trajectory chart
import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Bot, Target } from 'lucide-react';
import { useStore, formatMoney } from '../store/useStore';

function calcCorpus(monthly: number, years: number, rate: number, existing: number): number {
  const r = rate / 100 / 12;
  const n = years * 12;
  return existing * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
}

export const Planner = memo(function Planner() {
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const currency = useStore((s) => s.currency);

  const [params, setParams] = useState({
    currentAge: 30, retireAge: 45,
    monthlyExpenses: 10000, existing: 0,
    sip: 20000, returnRate: 10,
  });

  const set = useCallback((k: string) => (v: number) => setParams(p => ({ ...p, [k]: v })), []);

  const yearsToFire = Math.max(0, params.retireAge - params.currentAge);
  const fireTarget = params.monthlyExpenses * 12 * 25;
  const projected = Math.round(calcCorpus(params.sip, yearsToFire, params.returnRate, params.existing));
  const onTrack = projected >= fireTarget;

  // Build trajectory data — 6 age checkpoints
  const trajectory = Array.from({ length: 7 }, (_, i) => {
    const yr = (yearsToFire / 6) * i;
    const val = calcCorpus(params.sip, yr, params.returnRate, params.existing);
    return { age: Math.round(params.currentAge + yr), val: Math.round(val) };
  });
  const maxVal = Math.max(projected, fireTarget, 1);

  const [ran, setRan] = useState(false);

  const generateRoadmap = async () => {
    setRan(true);
    navigate('andy');
    setTimeout(() => sendChat(
      `My FIRE plan: I'm ${params.currentAge}, want to retire at ${params.retireAge}. Monthly expenses: $${params.monthlyExpenses}. Monthly SIP: $${params.sip}. Current assets: $${params.existing}. Expected return: ${params.returnRate}%. FIRE target: $${fireTarget.toLocaleString()}. Projected corpus: $${projected.toLocaleString()}. Status: ${onTrack ? 'ON TRACK' : 'BEHIND TARGET'}. Give me a detailed AI roadmap with specific actions.`
    ), 400);
  };

  const SLIDERS = [
    { k: 'currentAge', label: 'Current Age', min: 18, max: 60, step: 1, fmt: (v: number) => `${v} yrs` },
    { k: 'retireAge', label: 'Target Retirement Age', min: 30, max: 75, step: 1, fmt: (v: number) => `${v} yrs` },
    { k: 'monthlyExpenses', label: 'Monthly Expenses ($)', min: 1000, max: 100000, step: 500, fmt: (v: number) => formatMoney(v, currency) },
    { k: 'existing', label: 'Current Invested Assets ($)', min: 0, max: 5000000, step: 10000, fmt: (v: number) => formatMoney(v, currency) },
    { k: 'sip', label: 'Monthly Investment SIP ($)', min: 100, max: 100000, step: 500, fmt: (v: number) => formatMoney(v, currency) },
    { k: 'returnRate', label: 'Expected Return (%)', min: 4, max: 20, step: 0.5, fmt: (v: number) => `${v}%` },
  ];

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">FIRE Path Planner</h1>
          <p className="text-[10px] text-white/30 font-mono uppercase mt-0.5">Financial Independence, Retire Early Simulator</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/30">FIRE Target (25×)</p>
          <p className="text-xl font-black text-[#00ff88]">{formatMoney(fireTarget, currency)}</p>
          <p className="text-[10px] text-white/30">{yearsToFire} years to achieve</p>
        </div>
      </div>

      {/* Simulation sliders */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <p className="text-[10px] text-white/30 font-mono uppercase mb-2">Simulation Parameters</p>
        {SLIDERS.map(s => (
          <div key={s.k}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/50">{s.label}</span>
              <span className="text-[#00ff88] font-black">{s.fmt((params as any)[s.k])}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={(params as any)[s.k]}
              onChange={e => set(s.k)(+e.target.value)} className="w-full accent-[#00ff88]" />
          </div>
        ))}
      </div>

      {/* Wealth trajectory chart — CSS-based (no lib needed) */}
      <div className="glass rounded-2xl p-5">
        <p className="text-sm font-bold text-white mb-4">Wealth Trajectory</p>
        <div className="flex items-end gap-1 h-32 mb-3 relative">
          {/* FIRE target line */}
          <div className="absolute left-0 right-0" style={{ bottom: `${(fireTarget / maxVal) * 128}px` }}>
            <div className="border-t border-dashed border-amber-400/40 relative">
              <span className="absolute -top-3 right-0 text-[9px] text-amber-400/60">FIRE Target</span>
            </div>
          </div>
          {trajectory.map((pt, i) => {
            const h = Math.max(4, Math.round((pt.val / maxVal) * 128));
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <motion.div className="w-full rounded-t-sm" style={{ height: h }}
                  initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: i * 0.1, duration: 0.6 }}
                  title={formatMoney(pt.val, currency)}
                  style={{ background: pt.val >= fireTarget ? '#00ff88' : '#0088ff', height: h, borderRadius: '3px 3px 0 0' }} />
                <span className="text-[8px] text-white/25">{pt.age}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#0088ff]" /><span className="text-[10px] text-white/40">Portfolio</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#00ff88]" /><span className="text-[10px] text-white/40">FIRE Target hit</span></div>
        </div>
      </div>

      {/* Result */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 col-span-2">
          <p className="text-[10px] text-white/30 mb-1">Projected Corpus at Age {params.retireAge}</p>
          <p className="text-2xl font-black text-[#00ff88]">{formatMoney(projected, currency)}</p>
        </div>
        <div className={`rounded-2xl p-4 flex items-center justify-center font-black text-sm ${onTrack ? 'bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88]' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {onTrack ? '✅ ON TRACK' : '⚠️ BEHIND'}
        </div>
      </div>

      <motion.button onClick={generateRoadmap} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm"
        style={{ background: 'linear-gradient(135deg, #00ff88, #0088ff)' }}>
        <Bot className="w-4 h-4 text-black" />
        <span className="text-black">Generate AI Roadmap →</span>
      </motion.button>
    </div>
  );
});
