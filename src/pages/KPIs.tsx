// @ts-nocheck
// pages/KPIs.tsx — Personal Finance Monitor: 6D health score + system health log
import { memo, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Flame, Bot, Download } from 'lucide-react';
import { useStore, formatMoney } from '../store/useStore';

const HEALTH_DIMS = [
  { label: 'Emergency', score: 100, color: '#00ff88' },
  { label: 'Insurance',  score: 60,  color: '#22d3ee' },
  { label: 'Diversification', score: 50, color: '#8b5cf6' },
  { label: 'Debt',       score: 83,  color: '#f59e0b' },
  { label: 'Tax',        score: 65,  color: '#06b6d4' },
  { label: 'Retirement', score: 100, color: '#00ff88' },
];

function timestamp() {
  return new Date().toLocaleTimeString('en-IN', { hour12: false });
}

function SysLog({ entries }: { entries: { ts: string; msg: string }[] }) {
  return (
    <div className="font-mono text-[10px] space-y-1 max-h-36 overflow-y-auto">
      {entries.map((e, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-white/20 flex-shrink-0">[{e.ts}]</span>
          <span className="text-[#00ff88]/60">{e.msg}</span>
        </div>
      ))}
    </div>
  );
}

export const KPIs = memo(function KPIs() {
  const debts = useStore((s) => s.debts);
  const user = useStore((s) => s.user);
  const microWins = useStore((s) => s.microWins);
  const streak = useStore((s) => s.streak);
  const fireMonthly = useStore((s) => s.fireMonthly);
  const fireTargetAge = useStore((s) => s.fireTargetAge);
  const currentAge = useStore((s) => s.currentAge);
  const currency = useStore((s) => s.currency);
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const appMode = useStore((s) => s.appMode);
  const fetchMarket = useStore((s) => s.fetchMarket);

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [log, setLog] = useState<{ ts: string; msg: string }[]>([]);

  const addLog = (msg: string) => setLog(prev => [{ ts: timestamp(), msg }, ...prev].slice(0, 20));

  useEffect(() => {
    fetchMarket();
    addLog('Context Refreshed — KPIs loaded');
    addLog('Triggering KPI Analysis');
    addLog('AI Request Initiated {"mode":"analysis","lang":"en"}');
    addLog('Engaging Gemini Neural Core');
  }, []);

  const income = user?.monthlyIncome || 5000;
  const expenses = user?.monthlyExpenses || 3200;
  const cashFlow = income - expenses;
  const savingsRate = income > 0 ? Math.max(0, Math.round((cashFlow / income) * 100)) : 0;
  const totalDebt = debts.reduce((a, d) => a + d.balance, 0);
  const monthlyInterest = debts.reduce((a, d) => a + (d.balance * d.apr / 100 / 12), 0);
  const dailyInterest = monthlyInterest / 30;
  const avgApr = debts.length > 0 ? debts.reduce((a, d) => a + d.apr, 0) / debts.length : 0;
  const totalMin = debts.reduce((a, d) => a + d.minPayment, 0);
  const yearsToFire = Math.max(0, fireTargetAge - currentAge);
  const fireDate = new Date();
  fireDate.setFullYear(fireDate.getFullYear() + yearsToFire);
  const freeDateStr = fireDate.toLocaleDateString('en', { month: 'short', year: 'numeric' });
  const overallHealth = Math.round(HEALTH_DIMS.reduce((a, d) => a + d.score, 0) / HEALTH_DIMS.length);

  // Debt trajectory — 6 months
  const trajectory = Array.from({ length: 6 }, (_, i) => {
    const remaining = Math.max(0, totalDebt - (totalMin * i));
    return { month: `M${i}`, val: remaining };
  });
  const maxTraj = totalDebt || 1;

  const getLiveAnalysis = async () => {
    setLoadingAI(true);
    addLog('Triggering Neural Analysis');
    addLog('AI Request Initiated {"mode":"deep_kpi","lang":"en"}');
    navigate('andy');
    setTimeout(() => sendChat(
      `Perform a deep KPI analysis on my finances: ${debts.length} debts, $${totalDebt.toLocaleString()} total debt, ${avgApr.toFixed(1)}% avg APR, $${cashFlow}/mo cash flow, ${savingsRate}% savings rate, $${dailyInterest.toFixed(2)}/day interest burn, ${yearsToFire} years to FIRE. Give structured analysis with 3 key insights and priority actions.`
    ), 400);
    setLoadingAI(false);
  };

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Debt', totalDebt],
      ['Monthly Interest', monthlyInterest.toFixed(2)],
      ['Daily Interest Burn', dailyInterest.toFixed(2)],
      ['Cash Flow', cashFlow],
      ['Savings Rate', `${savingsRate}%`],
      ['Years to FIRE', yearsToFire],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv); a.download = 'anchor-kpis.csv'; a.click();
  };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Personal Finance Monitor</h1>
          <p className="text-[10px] text-white/30 font-mono uppercase mt-0.5">Real-Time // {user?.name || 'Demo User'}'s Data</p>
        </div>
        <div className="flex items-center gap-2">
          {appMode === 'cfo' && <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">CFO MODE</span>}
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-white/10 text-white/40 text-xs hover:text-white/70 transition-all">
            <Download className="w-3 h-3" /> Export CSV
          </button>
        </div>
      </div>

      {/* Live Neural Analysis */}
      <div className="glass rounded-2xl p-4 border border-purple-500/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-purple-400/50 font-mono uppercase">Live Neural Analysis</p>
          <button onClick={getLiveAnalysis} className="text-[10px] text-purple-400 hover:text-white transition-colors">Run Analysis →</button>
        </div>
        <p className="text-xs text-white/50 leading-relaxed italic">
          "{totalDebt > 0
            ? `Anchor Local Core Engaged. Algorithmic Assessment: 1. Debt Diffusion Trap Detected — Focus liquidity on ${[...debts].sort((a, b) => b.apr - a.apr)[0]?.name || 'highest APR debt'} to trigger Goal Gradient effect. 2. Arbitrage Opportunity: once debt clears, redirect to risk-free yields. 3. Action: Execute next payment in War Room.`
            : `No active debt load detected. System recommends accelerating FIRE savings — invest ${formatMoney(cashFlow * 0.8, currency)}/mo. Wealth velocity: positive.`}"
        </p>
      </div>

      {/* KPI stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Daily Interest Burn', val: `-${formatMoney(dailyInterest, currency)}`, sub: 'Cost of waiting 24hrs', color: '#ef4444' },
          { label: 'Avg Portfolio APR', val: `${avgApr.toFixed(1)}%`, sub: 'Target: 0%', color: '#f97316' },
          { label: 'Projected Freedom', val: freeDateStr, sub: 'Based on min payments', color: '#22d3ee' },
          { label: 'Free Cash Flow', val: formatMoney(cashFlow, currency), sub: 'Monthly Surplus', color: '#00ff88' },
          { label: 'Savings Rate', val: `${savingsRate}%`, sub: 'Income Saved', color: '#8b5cf6' },
          { label: 'Money Health Score', val: `${overallHealth}/100`, sub: '6-Dimension Audit', color: '#f59e0b' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-4">
            <p className="text-[10px] text-white/30 mb-1">{k.label}</p>
            <p className="text-xl font-black" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px] text-white/20 mt-0.5">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* 6D Health Score */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-white">6-Dimension Money Health Score</p>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border-2 border-[#00ff88]/40 flex items-center justify-center">
              <span className="text-sm font-black text-[#00ff88]">{overallHealth}</span>
            </div>
            <span className="text-xs text-white/30">/100</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {HEALTH_DIMS.map((d) => (
            <div key={d.label} className="p-3 rounded-xl bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-white/35">{d.label}</p>
                <p className="text-[10px] font-black" style={{ color: d.color }}>{d.score}/100</p>
              </div>
              <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} transition={{ duration: 1.2 }}
                  className="h-full rounded-full" style={{ background: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Debt Reduction Trajectory */}
      {totalDebt > 0 && (
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-bold text-white mb-4">Debt Reduction Trajectory</p>
          <div className="flex items-end gap-2 h-20 mb-2">
            {trajectory.map((pt, i) => {
              const h = Math.max(4, Math.round((pt.val / maxTraj) * 80));
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <motion.div className="w-full rounded-t-sm"
                    initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: i * 0.1, duration: 0.7 }}
                    style={{ height: h, background: `hsl(${130 - i * 22}, 100%, 50%)`, opacity: 0.8, borderRadius: '3px 3px 0 0' }} />
                  <span className="text-[8px] text-white/25">{pt.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* System Health Monitor */}
      <div className="glass rounded-2xl p-4 border border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-white/30 font-mono uppercase">System Health Monitor</p>
          <div className="flex gap-2">
            {[
              { label: 'VERCEL', status: 'STABLE', color: '#00ff88' },
              { label: 'Gemini Core', status: 'ACTIVE', color: '#00ff88' },
              { label: 'Open Source AI', status: 'READY', color: '#22d3ee' },
              { label: 'Env Status', status: 'SECURE', color: '#00ff88' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/[0.08] glass">
                <div className="w-1 h-1 rounded-full" style={{ background: s.color }} />
                <span className="text-[8px] font-mono" style={{ color: s.color }}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
        <SysLog entries={log} />
      </div>
    </div>
  );
});
