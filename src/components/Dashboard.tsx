// @ts-nocheck
// Dashboard.tsx — Full enterprise dashboard, fully responsive
// Uses global Zustand activeTab/navigateTo — any button can navigate any section
import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Anchor, BarChart3, Sword, Rocket, Bot, LogOut, RefreshCw,
  TrendingUp, TrendingDown, Wallet, DollarSign, Target, PieChart,
  Send, Sparkles, Plus, Trash2, ArrowRight, Zap, Timer, Shield, ChevronRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { TransitionOverlay } from './TransitionOverlay';

// ─────────────────────────── Shared UI ────────────────────────────────────────
const Glass = memo(function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl ${className}`}>{children}</div>;
});

function Tag({ children, color = 'green' }: any) {
  const cls: Record<string, string> = {
    green: 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono whitespace-nowrap ${cls[color] || cls.green}`}>{children}</span>;
}

function NavBtn({ label, Icon, onClick }: { label: string; Icon: any; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs text-[#00ff88] hover:text-white border border-[#00ff88]/20 hover:border-[#00ff88]/50 px-3 py-1.5 rounded-xl transition-all"
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
    >
      <Icon className="w-3.5 h-3.5" /> {label} <ChevronRight className="w-3 h-3" />
    </motion.button>
  );
}

// ─────────────────────────── Command Center ────────────────────────────────────
const CommandCenter = memo(function CommandCenter() {
  const market = useStore((s) => s.market);
  const crypto = useStore((s) => s.crypto);
  const marketLoading = useStore((s) => s.marketLoading);
  const user = useStore((s) => s.user);
  const fetchMarket = useStore((s) => s.fetchMarket);
  const navigateTo = useStore((s) => s.navigateTo);

  useEffect(() => { fetchMarket(); }, [fetchMarket]);

  const income = user?.monthlyIncome || 5000;
  const expenses = user?.monthlyExpenses || 3000;
  const cashFlow = income - expenses;
  const netWorth = income * 36;

  const kpis = [
    { label: 'Est. Net Worth', value: `$${(netWorth / 1000).toFixed(0)}K`, change: '+12.5%', Icon: Wallet, up: true },
    { label: 'Monthly Cash Flow', value: `$${cashFlow.toLocaleString()}`, change: cashFlow >= 0 ? '+8.2%' : '-5.3%', Icon: TrendingUp, up: cashFlow >= 0 },
    { label: 'Savings Rate', value: `${income ? Math.max(0, Math.round((cashFlow / income) * 100)) : 0}%`, change: '+3.2pp', Icon: DollarSign, up: true },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-black text-white">Command Center</h2>
        <div className="flex items-center gap-3">
          <button onClick={fetchMarket}
            className="flex items-center gap-1.5 text-xs text-[#00ff88]/70 hover:text-[#00ff88] transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${marketLoading ? 'animate-spin' : ''}`} />
            {marketLoading ? 'Syncing...' : 'Refresh'}
          </button>
          <NavBtn label="Manage Debts" Icon={Sword} onClick={() => navigateTo(1)} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {kpis.map((k, i) => (
          <Glass key={i} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <k.Icon className="w-5 h-5 text-[#00ff88]/60" />
              <Tag color={k.up ? 'green' : 'red'}>{k.change}</Tag>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white mb-0.5">{k.value}</p>
            <p className="text-xs text-white/35">{k.label}</p>
          </Glass>
        ))}
      </div>

      {/* Quick action row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Kill Debt', tab: 1, Icon: Sword, color: 'from-red-600 to-orange-600' },
          { label: 'FIRE Calc', tab: 2, Icon: Rocket, color: 'from-cyan-600 to-blue-600' },
          { label: 'Ask Andy', tab: 3, Icon: Bot, color: 'from-purple-600 to-pink-600' },
          { label: 'Optimize', tab: 2, Icon: Target, color: 'from-emerald-600 to-green-600' },
        ].map((a, i) => (
          <motion.button key={i} onClick={() => navigateTo(a.tab)}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r ${a.color} text-white text-sm font-bold`}
            whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
            <a.Icon className="w-4 h-4" /> {a.label}
          </motion.button>
        ))}
      </div>

      {/* Stocks grid */}
      <Glass className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest">Stocks · Live</h3>
          <Tag color="green">Finnhub</Tag>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {Object.entries(market).length > 0
            ? Object.entries(market).map(([sym, d]: any) => (
              <div key={sym} className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-colors">
                <p className="text-[10px] text-white/40 font-mono mb-0.5">{sym}</p>
                <p className="text-base sm:text-lg font-black text-white">${d.c?.toFixed(2)}</p>
                <div className={`flex items-center gap-0.5 ${d.dp >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                  {d.dp >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <p className="text-xs font-bold">{d.dp >= 0 ? '+' : ''}{d.dp?.toFixed(2)}%</p>
                </div>
              </div>
            ))
            : Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />)}
        </div>
      </Glass>

      {/* Crypto grid */}
      <Glass className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest">Crypto · Vanguard</h3>
          <Tag color="purple">CoinGecko</Tag>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {Object.entries(crypto).map(([coin, d]: any) => (
            <div key={coin} className="p-3 rounded-xl bg-purple-500/[0.05] border border-purple-500/10 hover:border-purple-500/20 transition-colors">
              <p className="text-[10px] text-purple-300/50 capitalize mb-0.5">{coin}</p>
              <p className="text-base font-black text-white">${typeof d.usd === 'number' && d.usd > 1 ? d.usd.toLocaleString() : d.usd}</p>
              <p className={`text-xs font-bold ${d.usd_24h_change >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {d.usd_24h_change >= 0 ? '+' : ''}{d.usd_24h_change?.toFixed(2)}% 24h
              </p>
            </div>
          ))}
        </div>
      </Glass>
    </div>
  );
});

// ─────────────────────────── War Room ─────────────────────────────────────────
const WarRoom = memo(function WarRoom() {
  const debts = useStore((s) => s.debts);
  const addDebt = useStore((s) => s.addDebt);
  const removeDebt = useStore((s) => s.removeDebt);
  const navigateTo = useStore((s) => s.navigateTo);

  const [form, setForm] = useState({ name: '', balance: '', apr: '', minPayment: '' });
  const [showAdd, setShowAdd] = useState(false);

  const handleChange = useCallback((key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
  }, []);

  const handleAdd = useCallback(() => {
    if (!form.name.trim() || !form.balance) return;
    addDebt({ name: form.name, balance: +form.balance, apr: +(form.apr || 0), minPayment: +(form.minPayment || 0) });
    setForm({ name: '', balance: '', apr: '', minPayment: '' });
    setShowAdd(false);
  }, [form, addDebt]);

  const total = debts.reduce((a, d) => a + d.balance, 0);
  const monthlyInterest = debts.reduce((a, d) => a + (d.balance * d.apr / 100 / 12), 0);
  const debtFreeMonths = total > 0 && debts.some(d => d.minPayment > 0)
    ? Math.round(total / debts.reduce((a, d) => a + d.minPayment, 0))
    : 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Sword className="w-5 h-5 text-red-400" /> War Room
        </h2>
        <div className="flex items-center gap-2">
          <NavBtn label="FIRE Calculator" Icon={Rocket} onClick={() => navigateTo(2)} />
          <motion.button onClick={() => setShowAdd(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-[#00ff88] border border-[#00ff88]/20 hover:bg-[#00ff88]/5 transition-all"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Plus className="w-4 h-4" /> Add Debt
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Debt', val: `$${total.toLocaleString()}`, color: 'text-red-400' },
          { label: 'Monthly Interest', val: `$${monthlyInterest.toFixed(0)}`, color: 'text-orange-400' },
          { label: 'Debt-Free In', val: debtFreeMonths > 0 ? `${debtFreeMonths}mo` : '—', color: 'text-amber-400' },
        ].map((s, i) => (
          <Glass key={i} className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-white/40 mb-1">{s.label}</p>
            <p className={`text-lg sm:text-2xl font-black ${s.color}`}>{s.val}</p>
          </Glass>
        ))}
      </div>

      {/* Add debt form — STABLE (useCallback handlers, no key flicker) */}
      <AnimatePresence>
        {showAdd && (
          <motion.div key="add-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
            <Glass className="p-4 border border-[#00ff88]/10">
              <p className="text-sm font-bold text-white mb-3">New Debt Target</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                <input id="debt-name" placeholder="Debt Name" value={form.name} onChange={handleChange('name')}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#00ff88]/30 col-span-1 sm:col-span-2" />
                <input id="debt-balance" type="number" placeholder="Balance ($)" value={form.balance} onChange={handleChange('balance')}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#00ff88]/30" />
                <input id="debt-apr" type="number" placeholder="APR %" value={form.apr} onChange={handleChange('apr')}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#00ff88]/30" />
                <input id="debt-min" type="number" placeholder="Min Payment ($)" value={form.minPayment} onChange={handleChange('minPayment')}
                  className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#00ff88]/30 col-span-1 sm:col-span-2" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#0088ff] text-black font-bold text-sm">Add Debt</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm">Cancel</button>
              </div>
            </Glass>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debt list */}
      <div className="space-y-3">
        {debts.map((debt, i) => {
          const pct = total > 0 ? Math.min((debt.balance / total) * 100, 100) : 0;
          return (
            <motion.div key={debt.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Glass className="p-4 border border-red-500/[0.08] hover:border-red-500/15 transition-colors">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <p className="font-bold text-white">{debt.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Tag color="red">{debt.apr}% APR</Tag>
                      <span className="text-[10px] text-white/25">Min ${debt.minPayment}/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xl sm:text-2xl font-black text-red-400">${debt.balance.toLocaleString()}</p>
                    <button onClick={() => removeDebt(debt.id)} className="p-1 text-white/15 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden mb-1.5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/25">{pct.toFixed(1)}% of total</span>
                  <motion.button onClick={() => navigateTo(3)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="text-[10px] font-bold text-[#00ff88] flex items-center gap-1 hover:text-white transition-colors">
                    Ask Andy for a plan <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              </Glass>
            </motion.div>
          );
        })}
        {debts.length === 0 && (
          <Glass className="p-10 text-center border border-dashed border-white/10">
            <Shield className="w-9 h-9 text-[#00ff88]/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No debts tracked. Add one to begin your annihilation protocol.</p>
          </Glass>
        )}
      </div>
    </div>
  );
});

// ─────────────────────────── Infinity Engine ───────────────────────────────────
const InfinityEngine = memo(function InfinityEngine() {
  const fireTarget = useStore((s) => s.fireTarget);
  const fireMonthly = useStore((s) => s.fireMonthly);
  const updateFireTarget = useStore((s) => s.updateFireTarget);
  const navigateTo = useStore((s) => s.navigateTo);

  const [target, setTarget] = useState(fireTarget);
  const [monthly, setMonthly] = useState(fireMonthly);

  const currentAge = 28;
  const yearsToFire = Math.max(0, target - currentAge);
  const fireNumber = monthly * 12 * 25;
  const passiveIncome = (fireNumber * 0.04) / 12;

  const handleTarget = useCallback((v: number) => { setTarget(v); updateFireTarget(v, monthly); }, [monthly, updateFireTarget]);
  const handleMonthly = useCallback((v: number) => { setMonthly(v); updateFireTarget(target, v); }, [target, updateFireTarget]);

  const allocs = [
    { label: 'Stocks', pct: 45, color: '#3b82f6' },
    { label: 'Crypto', pct: 25, color: '#8b5cf6' },
    { label: 'Real Estate', pct: 20, color: '#10b981' },
    { label: 'Bonds', pct: 10, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-cyan-400" /> Infinity Engine
        </h2>
        <NavBtn label="Ask Andy AI" Icon={Bot} onClick={() => navigateTo(3)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* FIRE Calculator */}
        <Glass className="p-5 sm:p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <Timer className="w-5 h-5 text-cyan-400" /> F.I.R.E. Timeline
          </h3>
          <div className="space-y-4 mb-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/50">Target FIRE Age</span>
                <span className="text-[#00ff88] font-black">{target} yrs</span>
              </div>
              <input type="range" min={30} max={70} value={target}
                onChange={(e) => handleTarget(+e.target.value)} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/50">Monthly Savings</span>
                <span className="text-[#00ff88] font-black">${monthly.toLocaleString()}</span>
              </div>
              <input type="range" min={200} max={10000} step={100} value={monthly}
                onChange={(e) => handleMonthly(+e.target.value)} className="w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Years to FIRE', val: `${yearsToFire} yrs`, color: 'text-[#00ff88]' },
              { label: 'FIRE Number', val: `$${(fireNumber / 1000).toFixed(0)}K`, color: 'text-white' },
              { label: 'Monthly Passive', val: `$${passiveIncome.toFixed(0)}`, color: 'text-cyan-400' },
              { label: 'Annual Savings', val: `$${(monthly * 12).toLocaleString()}`, color: 'text-purple-400' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-[10px] text-white/40 mb-0.5">{item.label}</p>
                <p className={`text-lg sm:text-xl font-black ${item.color}`}>{item.val}</p>
              </div>
            ))}
          </div>
          <motion.button onClick={() => navigateTo(3)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm">
            Ask Andy to Optimize My Plan →
          </motion.button>
        </Glass>

        {/* Asset Allocation */}
        <Glass className="p-5 sm:p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" /> Asset Allocation
          </h3>
          <div className="relative w-40 h-40 mx-auto mb-5">
            {allocs.map((a, i) => (
              <motion.div key={i} className="absolute inset-0 border-2 rounded-full"
                style={{ inset: `${i * 16}px`, borderColor: a.color + '55', background: a.color + '07' }}
                animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 18 + i * 5, repeat: Infinity, ease: 'linear' }} />
            ))}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-black text-white">$450K</p>
              <p className="text-[10px] text-white/40">Portfolio</p>
            </div>
          </div>
          <div className="space-y-2">
            {allocs.map((a) => (
              <div key={a.label} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${a.pct}%` }} transition={{ duration: 1.2 }}
                    className="h-full rounded-full" style={{ background: a.color }} />
                </div>
                <span className="text-xs text-white/50 w-20 text-right">{a.label}</span>
                <span className="text-xs font-black w-7 text-right" style={{ color: a.color }}>{a.pct}%</span>
              </div>
            ))}
          </div>
          <motion.button onClick={() => navigateTo(1)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm">
            Start Annihilating Debt →
          </motion.button>
        </Glass>
      </div>
    </div>
  );
});

// ─────────────────────────── Andy AI ──────────────────────────────────────────
const AndyAI = memo(function AndyAI() {
  const chatMessages = useStore((s) => s.chatMessages);
  const chatLoading = useStore((s) => s.chatLoading);
  const sendChat = useStore((s) => s.sendChat);
  const navigateTo = useStore((s) => s.navigateTo);

  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, chatLoading]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleKey = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  }, []);

  const handle = useCallback(async (msg: string) => {
    if (!msg.trim() || chatLoading) return;
    setInput('');
    await sendChat(msg.trim(), apiKey);
  }, [chatLoading, sendChat, apiKey]);

  const onEnter = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) handle(input);
  }, [handle, input]);

  const quickQ = [
    'How do I pay off debt faster?',
    'What is the avalanche method?',
    'Calculate my FIRE number',
    'Best crypto allocation?',
  ];

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 200px)', minHeight: 480 }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> Andy AI
          <span className="text-[10px] font-mono text-purple-400/50 font-normal">Gemini</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" /><span className="text-xs text-white/30">Online</span></div>
          <NavBtn label="War Room" Icon={Sword} onClick={() => navigateTo(1)} />
        </div>
      </div>

      <input id="andy-key" type="password" placeholder="🔑 Gemini API key (optional — smart answers work without it)"
        value={apiKey} onChange={handleKey}
        className="w-full px-3 py-2 text-xs rounded-xl glass border border-white/[0.07] text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30 mb-2.5 flex-shrink-0" />

      {/* Messages */}
      <Glass className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 mb-3 scrollbar-thin min-h-0">
        {chatMessages.map((msg, i) => (
          <motion.div key={`${msg.ts}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'andy' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'andy'
                ? 'bg-purple-600/15 border border-purple-500/15 text-white/90 rounded-tl-sm'
                : 'bg-[#00ff88]/10 border border-[#00ff88]/15 text-[#00ff88] rounded-tr-sm'
            }`}>
              {msg.role === 'andy' && <p className="text-[9px] text-purple-400/50 font-mono mb-1">ANDY AI</p>}
              {msg.text}
            </div>
          </motion.div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-purple-600/15 border border-purple-500/15 rounded-tl-sm">
              <div className="flex gap-1.5 items-center">
                <span className="text-[9px] text-purple-400/50 font-mono mr-1">ANDY AI</span>
                {[0, 0.15, 0.3].map(d => (
                  <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-purple-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </Glass>

      {/* Quick questions */}
      <div className="flex gap-1.5 flex-wrap mb-2.5 flex-shrink-0">
        {quickQ.map(q => (
          <button key={q} onClick={() => handle(q)}
            className="text-[11px] px-2.5 py-1.5 rounded-xl glass border border-white/[0.07] text-white/35 hover:text-purple-300 hover:border-purple-500/30 transition-all whitespace-nowrap">
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <input id="andy-input" value={input} onChange={handleInput} onKeyDown={onEnter}
          placeholder="Ask Andy anything about your money..."
          className="flex-1 px-3 sm:px-4 py-3 rounded-xl glass border border-white/[0.07] text-white placeholder-white/20 focus:outline-none focus:border-purple-400/30 text-sm min-w-0" />
        <motion.button onClick={() => handle(input)} disabled={!input.trim() || chatLoading}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="px-3 sm:px-4 py-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white disabled:opacity-30 flex-shrink-0">
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      </div>
    </div>
  );
});

// ─────────────────────────── Dashboard Shell ───────────────────────────────────
const TABS = [
  { key: 0, label: 'Command Center', Icon: BarChart3, color: '#00ff88' },
  { key: 1, label: 'War Room',        Icon: Sword,    color: '#ef4444' },
  { key: 2, label: 'Infinity Engine', Icon: Rocket,   color: '#22d3ee' },
  { key: 3, label: 'Andy AI',         Icon: Bot,      color: '#a855f7' },
];

export function Dashboard() {
  const user = useStore((s) => s.user);
  const clearData = useStore((s) => s.clearData);
  const activeTab = useStore((s) => s.activeTab);
  const navigateTo = useStore((s) => s.navigateTo);

  return (
    <div className="min-h-[100dvh] text-white flex flex-col pt-6"> {/* pt-6 for StatsTicker */}
      {/* Transition overlay — renders only during navigation */}
      <TransitionOverlay />

      {/* ── Header ── */}
      <header className="sticky top-6 z-50 flex items-center justify-between px-4 sm:px-6 py-3 glass border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00ff88] to-[#0088ff] flex items-center justify-center flex-shrink-0">
            <Anchor className="w-3.5 h-3.5 text-black" strokeWidth={3} />
          </div>
          <span className="font-black text-sm tracking-wider hidden xs:block">ANCHOR <span className="text-[#00ff88]">AI</span></span>
        </div>

        {/* Desktop tabs */}
        <nav className="hidden md:flex gap-1" role="navigation">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => navigateTo(tab.key)}
                className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-white/[0.07] border border-white/10' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'}`}
                style={isActive ? { color: tab.color } : undefined}>
                <tab.Icon className="w-4 h-4" />
                <span className="hidden lg:block">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-white/30 truncate max-w-[120px]">{user?.name || 'Commander'}</span>
          <button onClick={clearData} className="text-white/20 hover:text-red-400 transition-colors p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Mobile tab bar (bottom sheet style) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2.5 border-t border-white/[0.06]"
        style={{ background: 'rgba(2,2,9,0.92)', backdropFilter: 'blur(20px)' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => navigateTo(tab.key)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
              style={isActive ? { color: tab.color } : { color: 'rgba(255,255,255,0.3)' }}>
              <tab.Icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-6 py-6 pb-20 md:pb-8">
        <AnimatePresence mode="sync">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 0 && <CommandCenter />}
            {activeTab === 1 && <WarRoom />}
            {activeTab === 2 && <InfinityEngine />}
            {activeTab === 3 && <AndyAI />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="hidden md:block py-3 text-center text-[10px] text-white/10 font-mono border-t border-white/[0.04] mb-0">
        ANCHOR AI WEALTH OS · Enterprise · Market data for educational purposes
      </footer>
    </div>
  );
}
