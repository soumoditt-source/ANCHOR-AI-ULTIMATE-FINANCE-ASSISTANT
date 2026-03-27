import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore, StockQuote, CryptoCoin } from '../store/useStore';
import { TrendingUp, TrendingDown } from 'lucide-react';

function AnimatedNumber({ value, prefix = '$', decimals = 2 }: { value: number; prefix?: string; decimals?: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const start = displayed;
    const end = value;
    if (start === end) return;
    const duration = 1500;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{prefix}{displayed.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

function StockCard({ stock }: { stock: StockQuote }) {
  const isUp = stock.change >= 0;
  return (
    <motion.div
      whileHover={{ rotateX: 8, rotateY: -8, scale: 1.04, z: 40 }}
      className="glass-panel p-4 cursor-pointer border-white/5 group"
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-white/50 text-xs font-bold tracking-widest uppercase">{stock.symbol}</span>
        {isUp ? <TrendingUp className="text-neon-emerald" size={14} /> : <TrendingDown className="text-red-500" size={14} />}
      </div>
      <div className="text-xl font-black text-white font-mono">${stock.price.toFixed(2)}</div>
      <div className={`text-xs mt-1 font-bold font-mono ${isUp ? 'text-neon-emerald' : 'text-red-500'}`}>
        {isUp ? '+' : ''}{stock.change.toFixed(2)} ({isUp ? '+' : ''}{stock.pct.toFixed(2)}%)
      </div>
    </motion.div>
  );
}

function CryptoRow({ coin }: { coin: CryptoCoin }) {
  const isUp = coin.change_24h >= 0;
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-white/60">{coin.symbol[0]}</div>
        <div>
          <div className="text-white text-sm font-bold">{coin.name}</div>
          <div className="text-white/40 text-xs">{coin.symbol}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white font-mono text-sm">${coin.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        <div className={`text-xs font-bold font-mono ${isUp ? 'text-neon-emerald' : 'text-red-500'}`}>
          {isUp ? '+' : ''}{coin.change_24h.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

export default function WindowCommand() {
  const { netWorth, cashFlow, activeDebt, stocks, cryptos } = useStore();

  return (
    <motion.section
      id="command"
      className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-neon-emerald/60 text-xs tracking-[0.3em] uppercase font-bold mb-1">▶ Live Command Feed</div>
            <h2 className="text-4xl md:text-5xl font-black text-white">COMMAND CENTER</h2>
          </div>
          <div className="text-white/30 text-xs font-mono hidden md:block">Finnhub · CoinGecko · Live</div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Net Worth', value: netWorth, color: 'neon-emerald', prefix: '$', delta: '+12.4%' },
            { label: 'Monthly Cash Flow', value: cashFlow, color: 'neon-gold', prefix: '+$', delta: '↑ vs last month' },
            { label: 'Active Debt', value: activeDebt, color: 'red-400', prefix: '$', delta: 'Target: 0 by Oct 27' },
          ].map(({ label, value, color, prefix, delta }) => (
            <motion.div
              key={label}
              whileHover={{ rotateX: 6, scale: 1.02, z: 30 }}
              className={`glass-panel p-5 border-${color}/20`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`text-${color}/60 text-xs tracking-widest uppercase font-bold mb-2`}>{label}</div>
              <div className={`text-3xl font-black font-mono text-${color}`}>
                <AnimatedNumber value={value} prefix={prefix} />
              </div>
              <div className="text-white/30 text-xs mt-2 font-mono">{delta}</div>
            </motion.div>
          ))}
        </div>

        {/* Stocks & Crypto Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stocks */}
          <div className="glass-panel p-5 border-white/5">
            <div className="text-white/40 text-xs tracking-widest uppercase font-bold mb-4">Equity Tracker — Finnhub</div>
            {stocks.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {stocks.map(s => <StockCard key={s.symbol} stock={s} />)}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white/30 text-xs font-mono py-4">
                <span className="w-2 h-2 rounded-full bg-neon-emerald/50 animate-pulse" />
                Loading live market data...
              </div>
            )}
          </div>

          {/* Crypto */}
          <div className="glass-panel p-5 border-white/5">
            <div className="text-white/40 text-xs tracking-widest uppercase font-bold mb-4">Crypto Portfolio — CoinGecko</div>
            {cryptos.length > 0 ? (
              <div>{cryptos.map(c => <CryptoRow key={c.id} coin={c} />)}</div>
            ) : (
              <div className="flex items-center gap-2 text-white/30 text-xs font-mono py-4">
                <span className="w-2 h-2 rounded-full bg-neon-purple/50 animate-pulse" />
                Syncing crypto data...
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
