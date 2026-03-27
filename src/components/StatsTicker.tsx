// @ts-nocheck
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Zap, Shield, Timer } from 'lucide-react';
import { useStore } from '../store/useStore';

export function StatsTicker() {
  const debts = useStore(s => s.debts);
  const user = useStore(s => s.user);
  const totalDebt = debts.reduce((a, d) => a + d.balance, 0);
  const monthlyInterest = debts.reduce((a, d) => a + (d.balance * d.apr / 100 / 12), 0);

  const stats = [
    { icon: DollarSign, label: 'Total Debt Tracked', value: `$${(totalDebt / 1000).toFixed(1)}K`, color: 'text-red-400' },
    { icon: TrendingUp, label: 'Monthly Interest', value: `$${monthlyInterest.toFixed(0)}`, color: 'text-orange-400' },
    { icon: Zap, label: 'Est. Debt-Free', value: '18 months', color: 'text-[#00ff88]' },
    { icon: Shield, label: 'Portfolio', value: '$450K Est.', color: 'text-cyan-400' },
    { icon: Timer, label: 'Years to FIRE', value: `${user ? 45 - 28 : '?'} yrs`, color: 'text-purple-400' },
    { icon: DollarSign, label: 'Monthly Income', value: user ? `$${user.monthlyIncome.toLocaleString()}` : '---', color: 'text-amber-400' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 overflow-hidden pointer-events-none h-7 border-b border-white/[0.04]"
      style={{ background: 'rgba(2,2,9,0.85)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        className="flex gap-12 py-1 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      >
        {[...stats, ...stats].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <s.icon className={`w-3 h-3 ${s.color}`} />
            <span className="text-white/30 text-[10px]">{s.label}:</span>
            <span className={`text-[10px] font-bold font-mono ${s.color}`}>{s.value}</span>
            <span className="text-white/10 ml-6">|</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
