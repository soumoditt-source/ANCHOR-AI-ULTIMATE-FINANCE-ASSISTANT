// @ts-nocheck
// pages/WarRoom.tsx — Tactical Debt Elimination: 3 strategies + velocity params + trajectory
import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Plus, Trash2, ArrowRight, Shield, Bot, Zap } from 'lucide-react';
import { useStore, formatMoney } from '../store/useStore';

const STRATEGIES = [
  { key: 'drift',    label: 'Drift',    Icon: '🌊', color: '#64748b', multiplier: 0,    desc: 'Paying minimums. You drift aimlessly while interest eats your future.' },
  { key: 'drive',    label: 'Drive',    Icon: '🚗', color: '#22d3ee', multiplier: 0.2,  desc: 'Paying extra. You take the wheel. 20% more payment saves years.' },
  { key: 'velocity', label: 'Velocity', Icon: '🚀', color: '#00ff88', multiplier: 1.2,  desc: 'All out war. Lifestyle cuts + Side hustle. Maximum speed.' },
];

export const WarRoom = memo(function WarRoom() {
  const debts = useStore((s) => s.debts);
  const addDebt = useStore((s) => s.addDebt);
  const removeDebt = useStore((s) => s.removeDebt);
  const makePayment = useStore((s) => s.makePayment);
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const currency = useStore((s) => s.currency);

  const [form, setForm] = useState({ name: '', balance: '', apr: '', minPayment: '', type: 'credit' });
  const [showAdd, setShowAdd] = useState(false);
  const [scenario, setScenario] = useState<'snowball' | 'avalanche'>('avalanche');
  const [expenseCut, setExpenseCut] = useState(10);
  const [sideHustle, setSideHustle] = useState(200);
  const [strategy, setStrategy] = useState('drive');

  const handleChange = useCallback((k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value })), []);
  const handleAdd = useCallback(() => {
    if (!form.name.trim() || !form.balance) return;
    addDebt({ name: form.name, balance: +form.balance, apr: +(form.apr || 0), minPayment: +(form.minPayment || 0), type: form.type });
    setForm({ name: '', balance: '', apr: '', minPayment: '', type: 'credit' });
    setShowAdd(false);
  }, [form, addDebt]);

  const total = debts.reduce((a, d) => a + d.balance, 0);
  const monthlyInterest = debts.reduce((a, d) => a + (d.balance * d.apr / 100 / 12), 0);
  const totalMin = debts.reduce((a, d) => a + d.minPayment, 0);

  const sortedDebts = [...debts].sort((a, b) =>
    scenario === 'avalanche' ? b.apr - a.apr : a.balance - b.balance
  );

  // Strategy date calculations
  const strat = STRATEGIES.find(s => s.key === strategy) || STRATEGIES[1];
  const extraPayment = totalMin * strat.multiplier + sideHustle;
  const monthlyPayment = totalMin + extraPayment;
  const debtFreeMonths = total > 0 && monthlyPayment > 0 ? Math.ceil(total / monthlyPayment) : 0;
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + debtFreeMonths);
  const dateStr = debtFreeDate.toLocaleDateString('en', { month: 'short', year: 'numeric' });

  const generateBattlePlan = async () => {
    navigate('andy');
    setTimeout(() => sendChat(
      `Generate my optimal debt battle plan. Strategy: ${strategy}. Total debt: ${formatMoney(total, currency)}. Monthly payment capacity: ${formatMoney(monthlyPayment, currency)}. Scenario: ${scenario}. Debts: ${debts.map(d => `${d.name} ${formatMoney(d.balance, currency)} @${d.apr}%`).join(', ')}. Projected debt-free: ${dateStr}. Give specific monthly actionable steps.`
    ), 400);
  };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Sword className="w-6 h-6 text-red-400" />
          <div>
            <h1 className="text-2xl font-black text-white">War Room</h1>
            <p className="text-[10px] text-white/30 font-mono">TACTICAL DEBT ELIMINATION SIMULATOR</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[9px] font-mono text-red-400">TARGETING ONLINE</span>
          </div>
          <motion.button onClick={() => setShowAdd(s => !s)} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#00ff88]/20 text-[#00ff88] text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Debt
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Debt', val: formatMoney(total, currency), c: '#ef4444' },
          { label: 'Monthly Interest', val: formatMoney(monthlyInterest, currency), c: '#f97316' },
          { label: 'Debt-Free', val: debtFreeMonths > 0 ? dateStr : '—', c: strat.color },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] text-white/35 mb-1">{s.label}</p>
            <p className="text-base sm:text-xl font-black" style={{ color: s.c }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Strategy cards — Drift / Drive / Velocity */}
      <div>
        <p className="text-[10px] text-white/30 font-mono uppercase mb-3">Strategy: Choose Your Mode</p>
        <div className="grid grid-cols-3 gap-2">
          {STRATEGIES.map(s => {
            const extra = totalMin * s.multiplier + sideHustle;
            const pay = totalMin + extra;
            const months = total > 0 && pay > 0 ? Math.ceil(total / pay) : 0;
            const d = new Date(); d.setMonth(d.getMonth() + months);
            const savings = Math.max(0, monthlyInterest * Math.max(0, (total > 0 && totalMin > 0 ? Math.ceil(total / totalMin) : 0) - months));
            return (
              <motion.button key={s.key} onClick={() => setStrategy(s.key)}
                className={`p-3 sm:p-4 rounded-2xl text-left border transition-all ${strategy === s.key ? 'border-current' : 'border-white/[0.06] hover:border-white/10'}`}
                style={{ borderColor: strategy === s.key ? s.color + '40' : undefined, background: strategy === s.key ? s.color + '08' : 'rgba(255,255,255,0.02)' }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <div className="text-xl mb-2">{s.Icon}</div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-white text-sm">Strategy: {s.label}</span>
                  {strategy === s.key && <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />}
                </div>
                {months > 0 && <p className="text-[10px] font-black" style={{ color: s.color }}>{d.toLocaleDateString('en', { month: 'short', year: 'numeric' })}</p>}
                {pay > 0 && <p className="text-[9px] text-white/30 mt-0.5">Pay: {formatMoney(pay, currency)}/mo</p>}
                {savings > 0 && <p className="text-[9px] text-[#00ff88]">Saves {formatMoney(savings, currency)}</p>}
                <p className="text-[9px] text-white/25 mt-1 leading-tight">{s.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Scenario selector */}
      <div>
        <p className="text-[10px] text-white/30 font-mono uppercase mb-2">Trajectory Analysis</p>
        <div className="flex gap-2">
          {(['snowball', 'avalanche'] as const).map(s => (
            <button key={s} onClick={() => setScenario(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${scenario === s ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white' : 'glass border border-white/[0.06] text-white/40'}`}>
              {s === 'avalanche' ? '⚡ Avalanche' : '❄️ Snowball'}
            </button>
          ))}
        </div>
      </div>

      {/* Velocity parameters */}
      <div className="glass rounded-2xl p-5 border border-white/[0.06]">
        <p className="text-sm font-bold text-white mb-4">Velocity Parameters</p>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/50">Expense Cut</span>
              <span className="text-[#00ff88] font-black">{expenseCut}%</span>
            </div>
            <p className="text-[10px] text-white/25 mb-2">Reduce monthly expenses to free up cash.</p>
            <input type="range" min={0} max={50} value={expenseCut} onChange={e => setExpenseCut(+e.target.value)} className="w-full accent-[#00ff88]" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/50">Side Hustle</span>
              <span className="text-[#00ff88] font-black">{formatMoney(sideHustle, currency)}/mo</span>
            </div>
            <p className="text-[10px] text-white/25 mb-2">Extra monthly income dedicated to debt.</p>
            <input type="range" min={0} max={5000} step={50} value={sideHustle} onChange={e => setSideHustle(+e.target.value)} className="w-full accent-[#00ff88]" />
          </div>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div key="add" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="glass rounded-2xl p-4 border border-[#00ff88]/10 space-y-2.5">
              <p className="text-sm font-bold text-white">New Debt Target</p>
              <div className="grid grid-cols-2 gap-2">
                <input id="war-name" placeholder="Debt Name" value={form.name} onChange={handleChange('name')} style={{ gridColumn: 'span 2' }}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00ff88]/30" />
                <input id="war-balance" type="number" placeholder={`Balance (${currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : '₹')})`} value={form.balance} onChange={handleChange('balance')}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00ff88]/30" />
                <input id="war-apr" type="number" placeholder="APR %" value={form.apr} onChange={handleChange('apr')}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00ff88]/30" />
                <input id="war-min" type="number" placeholder={`Min Payment (${currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : '₹')})`} value={form.minPayment} onChange={handleChange('minPayment')} style={{ gridColumn: 'span 2' }}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00ff88]/30" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#0088ff] text-black font-bold text-sm">Add</button>
                <button onClick={() => setShowAdd(false)} className="px-4 rounded-xl glass border border-white/10 text-white/40 text-sm">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debt list */}
      <div className="space-y-3">
        {sortedDebts.map((debt, i) => {
          const pct = total > 0 ? (debt.balance / total) * 100 : 0;
          return (
            <motion.div key={debt.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <div className={`glass rounded-2xl p-4 border ${i === 0 ? 'border-red-500/20' : 'border-white/[0.05]'}`}>
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {i === 0 && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-mono uppercase">Strike First</span>}
                      <p className="font-bold text-white">{debt.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">{debt.apr}% APR</span>
                      <span className="text-[10px] text-white/20">Min {formatMoney(debt.minPayment, currency)}/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-black text-red-400">{formatMoney(debt.balance, currency)}</p>
                    <button onClick={() => removeDebt(debt.id)} className="p-1 text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden mb-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/20">{pct.toFixed(1)}% of total</span>
                  <motion.button onClick={() => makePayment(debt.id, debt.minPayment)} whileTap={{ scale: 0.95 }}
                    className="text-[10px] font-bold text-[#00ff88] flex items-center gap-1 hover:text-white transition-colors">
                    Strike Min <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {debts.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center border border-dashed border-white/10">
            <Shield className="w-8 h-8 text-[#00ff88]/20 mx-auto mb-3" />
            <p className="text-white/25 text-sm">No debts tracked. Debt-free! 🎉</p>
          </div>
        )}
      </div>

      {/* AI Tactical Advisor */}
      <div className="glass rounded-2xl p-4 border border-[#00ff88]/10">
        <p className="text-[10px] text-[#00ff88]/50 font-mono uppercase mb-3">AI Tactical Advisor</p>
        <motion.button onClick={generateBattlePlan} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-black"
          style={{ background: 'linear-gradient(135deg, #00ff88, #0088ff)' }}>
          <Zap className="w-4 h-4 text-black" /> GENERATE OPTIMAL BATTLE PLAN
        </motion.button>
      </div>
    </div>
  );
});
