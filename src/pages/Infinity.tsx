// @ts-nocheck
// Infinity.tsx — The Infinite Wealth Engine (Group A / Group B Strategy)
import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Infinity as InfinityIcon, Bot, ArrowRight, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Infinity = memo(function InfinityPage() {
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const { currency, user } = useStore();
  const cSym = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : '₹');

  // Infinite Engine State
  const [corpus, setCorpus] = useState(240000000); // 24 Crores default
  const [withdrawalRate, setWithdrawalRate] = useState(7.5); // 7.5% yield on Group A
  const [growthRate, setGrowthRate] = useState(12); // 12% CAGR on Group B
  const [inflation, setInflation] = useState(6); // 6% Indian inflation

  // Maths
  const groupA = corpus / 2; // 50% for income
  const groupB = corpus / 2; // 50% for growth
  const monthlyIncome = (groupA * (withdrawalRate / 100)) / 12; // E.g., 1.5L per month
  const groupBValueYear15 = groupB * Math.pow(1 + (growthRate / 100), 15); // Compounded 15 years

  // Formatter for Indian numbering (Lakhs/Crores)
  const formatINR = (val: number) => {
    if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
    return val.toLocaleString('en-IN');
  };

  const askBuffettAI = () => {
    navigate('andy');
    setTimeout(() => {
      sendChat(
        `I am using the 'Infinite Wealth Bucket Strategy'. I have ${cSym}${formatINR(corpus)}. I am splitting it 50/50.\n\nGroup A (Income): ${cSym}${formatINR(groupA)} invested for ${withdrawalRate}% yield to generate ${cSym}${formatINR(monthlyIncome)} per month for my living expenses.\nGroup B (Growth): ${cSym}${formatINR(groupB)} left completely untouched in equity/bonds compounding at ${growthRate}% CAGR to combat ${inflation}% inflation, projecting to become ${cSym}${formatINR(groupBValueYear15)} in 15 years.\n\nAct as Warren Buffett advising an Indian investor. Evaluate this exact math. Tell me which specific Indian banks, SWP mutual funds, or bonds to use for Group A to safely get ${cSym}${formatINR(monthlyIncome)}/mo. Then tell me where to park Group B to safely hit ${cSym}${formatINR(groupBValueYear15)}. Give me highest-grade brutal financial advice.`
      );
    }, 400);
  };

  return (
    <div className="p-4 sm:p-6 pb-24 md:pb-6 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <InfinityIcon className="w-5 h-5 text-[#00ff88]" />
          <h1 className="text-2xl font-black text-white">Infinite Wealth Engine</h1>
        </div>
        <p className="text-[10px] text-white/30 font-mono uppercase">The 50/50 Perpetual Bucket Strategy</p>
      </div>

      <div className="glass rounded-2xl p-4 border border-[#00ff88]/20 bg-[#00ff88]/[0.02]">
        <p className="text-xs text-white/60 mb-3">
          Split your capital into two buckets. <b className="text-white">Group A</b> generates safe monthly income for 15 years. <b className="text-white">Group B</b> is left untouched to compound and double, replacing Group A when it depletes. This makes your wealth mathematically infinite.
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[10px] text-white/40">Total Investable Corpus</span>
              <span className="text-xs text-[#00ff88] font-black">{cSym} {formatINR(corpus)}</span>
            </div>
            <input type="range" min={1000000} max={500000000} step={1000000} value={corpus}
              onChange={e => setCorpus(+e.target.value)} className="w-full accent-[#00ff88]" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* GROUP A */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 blur-[50px] rounded-full group-hover:bg-[#00ff88]/10 transition-all" />
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-[#00ff88]" />
            <h2 className="text-sm font-black text-white">Group A: The Income Engine</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Allocated Capital (50%)</p>
            <p className="text-2xl font-black text-[#00ff88]">{cSym} {formatINR(groupA)}</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-white/40">Expected SWP Yield</span>
                <span className="text-[10px] text-white font-bold">{withdrawalRate}%</span>
              </div>
              <input type="range" min={4} max={12} step={0.5} value={withdrawalRate}
                onChange={e => setWithdrawalRate(+e.target.value)} className="w-full accent-[#00ff88]" />
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[10px] text-white/30 mb-1">Monthly Passive Income Generated</p>
              <p className="text-xl font-black text-white">{cSym} {formatINR(monthlyIncome)} <span className="text-xs text-white/30 font-normal">/ mo</span></p>
            </div>
          </div>
        </div>

        {/* GROUP B */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 blur-[50px] rounded-full group-hover:bg-[#8b5cf6]/10 transition-all" />
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-sm font-black text-white">Group B: The Growth Engine</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-[10px] text-white/30 uppercase tracking-wider">Untouched Capital (50%)</p>
            <p className="text-2xl font-black text-[#8b5cf6]">{cSym} {formatINR(groupB)}</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-white/40">Expected Equity CAGR</span>
                <span className="text-[10px] text-white font-bold">{growthRate}%</span>
              </div>
              <input type="range" min={8} max={20} step={0.5} value={growthRate}
                onChange={e => setGrowthRate(+e.target.value)} className="w-full accent-[#8b5cf6]" />
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[10px] text-white/30 mb-1">Projected Value in 15 Years</p>
              <p className="text-xl font-black text-white">{cSym} {formatINR(groupBValueYear15)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4 border border-amber-400/20 bg-amber-400/[0.02] flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-400 mb-1">Inflation Warning ({inflation}%)</p>
          <p className="text-[11px] text-white/50 leading-relaxed">
            While Group A pays your bills today, inflation will erode its purchasing power. Group B MUST grow faster than {inflation}% to ensure that when Group A runs out in 15 years, Group B has compounded enough to restart the cycle infinitely.
          </p>
        </div>
      </div>

      <motion.button onClick={askBuffettAI} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-black shadow-[0_0_30px_rgba(0,255,136,0.3)]"
        style={{ background: 'linear-gradient(135deg, #00ff88, #22d3ee)' }}>
        <Bot className="w-4 h-4" />
        Analyze with Buffett-Level AI <ArrowRight className="w-4 h-4" />
      </motion.button>
    </div>
  );
});
