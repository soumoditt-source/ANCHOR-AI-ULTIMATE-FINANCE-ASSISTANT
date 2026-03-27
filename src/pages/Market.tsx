// @ts-nocheck
// pages/Market.tsx — Market Pulse: SENSEX/NIFTY + global indices + AI sentiment + sector heatmap
import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, Bot, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

// Mock Indian + global market data
const INDICES = [
  { sym: 'SENSEX', val: 72247.56, chg: 1.68 },
  { sym: 'NIFTY',  val: 22143.18, chg: 0.11 },
  { sym: 'S&P 500',val: 5079.53,  chg: 1.49 },
  { sym: 'NASDAQ', val: 16053.01, chg: 0.34 },
  { sym: 'BTC/USD', val: 64028.32, chg: 1.76, prefix: '$' },
  { sym: 'ETH/USD', val: 3387.54,  chg: -0.6, prefix: '$' },
];

const SECTORS = [
  { name: 'Technology',  chg: 2.43,  color: '#10b981' },
  { name: 'Financials',  chg: 0.86,  color: '#3b82f6' },
  { name: 'Healthcare',  chg: -1.3,  color: '#ef4444' },
  { name: 'Energy',      chg: 1.46,  color: '#f59e0b' },
  { name: 'Consumer',    chg: -0.42, color: '#ef4444' },
  { name: 'Industrials', chg: 0.23,  color: '#22d3ee' },
];

const NEWS = [
  { tag: 'Central Bank', time: '10m ago', title: 'Fed Signals Rate Cuts in Q3', desc: 'Federal Reserve minutes indicate a shift towards dovish policy as inflation cools.', color: '#22d3ee' },
  { tag: 'Tech',         time: '45m ago', title: 'AI Chip Demand Surges 300%', desc: 'Enterprise spending on generative AI infrastructure hits record highs.', color: '#8b5cf6' },
  { tag: 'Markets',      time: '1h ago',  title: 'Global Markets Rally on Tech Earnings', desc: 'Major indices hit all-time highs driven by semiconductor sector performance.', color: '#00ff88' },
  { tag: 'Crypto',       time: '2h ago',  title: 'Bitcoin Halving Event Approaches', desc: 'Analysts predict supply shock as the halving event draws near.', color: '#f59e0b' },
];

export const Market = memo(function Market() {
  const market = useStore((s) => s.market);
  const crypto = useStore((s) => s.crypto);
  const marketLoading = useStore((s) => s.marketLoading);
  const fetchMarket = useStore((s) => s.fetchMarket);
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const language = useStore((s) => s.language);

  const [sentiment] = useState(74); // Fear/Greed index
  const [tick, setTick] = useState(0);

  useEffect(() => { fetchMarket(); }, []);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const deepDive = (q: string) => { navigate('andy'); setTimeout(() => sendChat(q), 400); };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Market Pulse</h1>
          <p className="text-[10px] text-white/30 font-mono uppercase">Live • AI-Powered • {language.toUpperCase()}</p>
        </div>
        <button onClick={fetchMarket}
          className="flex items-center gap-1.5 text-xs text-[#00ff88]/60 hover:text-[#00ff88] transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${marketLoading ? 'animate-spin' : ''}`} />
          {marketLoading ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Scrolling ticker */}
      <div className="relative overflow-hidden rounded-xl glass border border-white/[0.06] py-2 px-0">
        <div className="flex gap-6 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
          {[...INDICES, ...INDICES].map((idx, i) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0 px-3">
              <span className="text-white/50 text-xs font-mono">{idx.sym}</span>
              <span className="text-white font-black text-xs">{idx.prefix || ''}{idx.val.toLocaleString()}</span>
              <span className={`text-[10px] font-bold ${idx.chg >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {idx.chg >= 0 ? '+' : ''}{idx.chg}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Indices grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {INDICES.map((idx) => (
          <motion.div key={idx.sym} className="glass rounded-xl p-3 border border-white/[0.05] cursor-pointer hover:border-white/10 transition-all"
            whileHover={{ scale: 1.03 }}
            onClick={() => deepDive(`What's the latest on ${idx.sym}? Should I be watching this closely?`)}>
            <p className="text-[10px] text-white/35 font-mono">{idx.sym}</p>
            <p className="text-lg font-black text-white">{idx.prefix || ''}{idx.val.toLocaleString()}</p>
            <p className={`text-xs font-bold ${idx.chg >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>{idx.chg >= 0 ? '+' : ''}{idx.chg}%</p>
          </motion.div>
        ))}
      </div>

      {/* AI Market Sentiment */}
      <div className="glass rounded-2xl p-5 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">AI Market Sentiment</p>
          <span className="text-[10px] text-white/20">Updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#1f2937" strokeWidth="3" />
              <motion.path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none"
                stroke={sentiment >= 60 ? '#f59e0b' : sentiment >= 40 ? '#22d3ee' : '#ef4444'} strokeWidth="3"
                strokeDasharray={`${sentiment} 100`} strokeLinecap="round"
                initial={{ strokeDasharray: '0 100' }} animate={{ strokeDasharray: `${sentiment} 100` }} transition={{ duration: 1.5 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-base font-black text-white">{sentiment}</p>
            </div>
          </div>
          <div>
            <p className="text-lg font-black text-amber-400">Greed</p>
            <p className="text-xs text-white/40">{sentiment}/100 • Market Sentiment</p>
          </div>
        </div>
        <p className="text-xs text-white/50 leading-relaxed italic">
          "Tech stocks dancing on hopeful beats, yet higher interest rates keep the crowd wary. For a savvy portfolio: blend high-growth tech exposure with inflation-hedged instruments and disciplined dollar-cost-averaging — tiny wins today, big wins tomorrow."
        </p>
      </div>

      {/* Deep Dive input */}
      <div className="glass rounded-2xl p-4">
        <p className="text-[10px] text-purple-400/50 font-mono uppercase mb-2">Deep Dive with Andy</p>
        <div className="flex gap-2">
          <input id="market-ask" placeholder="Analyze AAPL earnings, explain the Fed rate hike, or predict crypto trends..."
            onKeyDown={e => { if (e.key === 'Enter') { deepDive((e.target as any).value); (e.target as any).value = ''; }}}
            className="flex-1 px-3 py-2 rounded-xl glass border border-white/[0.07] text-white placeholder-white/20 text-xs focus:outline-none focus:border-purple-400/30" />
          <button onClick={() => { const el = document.getElementById('market-ask') as HTMLInputElement; if (el?.value) { deepDive(el.value); el.value = ''; }}}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">ASK</button>
        </div>
      </div>

      {/* Sector heatmap */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Sector Heatmap</p>
        <div className="grid grid-cols-3 gap-2">
          {SECTORS.map(s => (
            <motion.div key={s.name} className="p-3 rounded-xl text-center cursor-pointer"
              style={{ background: s.chg >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${s.color}20` }}
              whileHover={{ scale: 1.05 }} onClick={() => deepDive(`What's happening in the ${s.name} sector today? Any opportunities?`)}>
              <p className="text-xs text-white/60 mb-1">{s.name}</p>
              <p className="font-black text-sm" style={{ color: s.color }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Intel */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Live Intel</p>
        <div className="space-y-3">
          {NEWS.map((n, i) => (
            <motion.button key={i} onClick={() => deepDive(`Tell me more about: "${n.title}". What does this mean for my portfolio?`)}
              className="w-full text-left p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.04]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono" style={{ background: n.color + '15', color: n.color }}>{n.tag}</span>
                <span className="text-[9px] text-white/25">{n.time}</span>
              </div>
              <p className="text-xs font-bold text-white">{n.title}</p>
              <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{n.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
});
