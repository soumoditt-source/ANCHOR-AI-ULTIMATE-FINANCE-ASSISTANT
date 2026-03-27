// @ts-nocheck
// pages/Market.tsx — Live Market Pulse
// Data: Finnhub (stocks) + CoinGecko (crypto) + NewsData.io (news)
// Falls back to rich mock data if keys not set
import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw, Bot, Zap, Activity, Globe } from 'lucide-react';
import { useStore } from '../store/useStore';

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY || '';
const COINGECKO_KEY = import.meta.env.VITE_COINGECKO_API_KEY || '';
const NEWSDATA_KEY = import.meta.env.VITE_NEWSDATA_API_KEY || '';

// ─── Types ───────────────────────────────────────────────────────────────────
interface IndexData { sym: string; val: number; chg: number; prefix?: string; }
interface NewsItem { tag: string; time: string; title: string; desc: string; color: string; url?: string; }

// ─── Static fallbacks ────────────────────────────────────────────────────────
const FALLBACK_INDICES: IndexData[] = [
  { sym: 'SENSEX', val: 72247.56, chg: 1.68 },
  { sym: 'NIFTY',  val: 22143.18, chg: 0.11 },
  { sym: 'S&P 500',val: 5079.53,  chg: 1.49 },
  { sym: 'NASDAQ', val: 16053.01, chg: 0.34 },
  { sym: 'BTC/USD', val: 64028.32, chg: 1.76, prefix: '$' },
  { sym: 'ETH/USD', val: 3387.54,  chg: -0.6, prefix: '$' },
];

const SECTORS = [
  { name: 'Technology',  chg: 2.43  },
  { name: 'Financials',  chg: 0.86  },
  { name: 'Healthcare',  chg: -1.30 },
  { name: 'Energy',      chg: 1.46  },
  { name: 'Consumer',    chg: -0.42 },
  { name: 'Industrials', chg: 0.23  },
];

const FALLBACK_NEWS: NewsItem[] = [
  { tag: 'Central Bank', time: 'Live', title: 'Fed Signals Rate Cuts', desc: 'Federal Reserve minutes indicate a shift towards dovish policy as inflation cools.', color: '#22d3ee' },
  { tag: 'India Markets', time: '1h ago', title: 'SEBI Tightens F&O Regulations', desc: 'New margin requirements for derivatives expected to reduce retail speculation.', color: '#00ff88' },
  { tag: 'Tech', time: '2h ago', title: 'AI Chip Demand Surges 300%', desc: 'Enterprise spending on generative AI infrastructure hits record highs.', color: '#8b5cf6' },
  { tag: 'Crypto', time: '3h ago', title: 'Bitcoin Hits New All-Time High', desc: 'Institutional inflows via ETFs drive unprecedented BTC demand.', color: '#f59e0b' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(ts: string): string {
  const d = new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

function tagColor(cat: string): string {
  const m: Record<string, string> = { business: '#22d3ee', technology: '#8b5cf6', science: '#00ff88', finance: '#f59e0b' };
  return m[cat?.toLowerCase()] || '#ffffff66';
}

export const Market = memo(function Market() {
  const market = useStore((s) => s.market);
  const crypto = useStore((s) => s.crypto);
  const marketLoading = useStore((s) => s.marketLoading);
  const fetchMarket = useStore((s) => s.fetchMarket);
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const language = useStore((s) => s.language);

  const [indices, setIndices] = useState<IndexData[]>(FALLBACK_INDICES);
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [newsLoading, setNewsLoading] = useState(false);
  const [sentiment, setSentiment] = useState(74);
  const [lastUpdated, setLastUpdated] = useState('');
  const [liveMode, setLiveMode] = useState(false);
  const intervalRef = useRef<any>(null);

  // Build indices from Finnhub stock data + CoinGecko crypto
  const buildIndices = useCallback(() => {
    const entries: IndexData[] = [
      ...FALLBACK_INDICES.slice(0, 4), // SENSEX/NIFTY are not on Finnhub free — keep as is
    ];
    // Overlay Finnhub stock data
    const btc = crypto?.bitcoin;
    const eth = crypto?.ethereum;
    if (btc) entries[4] = { sym: 'BTC/USD', val: Math.round(btc.usd), chg: +btc.usd_24h_change.toFixed(2), prefix: '$' };
    if (eth) entries[5] = { sym: 'ETH/USD', val: Math.round(eth.usd), chg: +eth.usd_24h_change.toFixed(2), prefix: '$' };
    // Add Finnhub stocks
    const stocksToShow = ['AAPL', 'NVDA', 'MSFT'];
    stocksToShow.forEach(sym => {
      const q = market[sym];
      if (q) entries.push({ sym, val: +q.c.toFixed(2), chg: +q.dp.toFixed(2), prefix: '$' });
    });
    setIndices(entries);
    // Compute a sentiment based on how many are positive
    const pos = entries.filter(e => e.chg > 0).length;
    setSentiment(Math.round((pos / entries.length) * 100));
    setLastUpdated(new Date().toLocaleTimeString());
    setLiveMode(true);
  }, [market, crypto]);

  // Fetch live news from NewsData.io
  const fetchNews = useCallback(async () => {
    if (!NEWSDATA_KEY) return;
    setNewsLoading(true);
    try {
      const r = await fetch(
        `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_KEY}&q=india+stocks+OR+market+OR+finance&language=en&size=4`
      );
      const d = await r.json();
      if (d.results?.length) {
        const mapped: NewsItem[] = d.results.slice(0, 4).map((n: any) => ({
          tag: n.category?.[0] || 'Markets',
          time: timeAgo(n.pubDate),
          title: n.title?.slice(0, 70) || '',
          desc: n.description?.slice(0, 120) || '',
          color: tagColor(n.category?.[0] || ''),
          url: n.link,
        }));
        setNews(mapped);
      }
    } catch { /* keep fallback */ }
    setNewsLoading(false);
  }, []);

  useEffect(() => {
    fetchMarket();
    fetchNews();
  }, []);

  useEffect(() => {
    buildIndices();
  }, [market, crypto]);

  // Live ticker auto-refresh every 2 min
  useEffect(() => {
    intervalRef.current = setInterval(() => { fetchMarket(); fetchNews(); }, 120_000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const deepDive = (q: string) => { navigate('andy'); setTimeout(() => sendChat(q), 400); };

  const sentimentLabel = sentiment >= 70 ? 'Greed' : sentiment >= 50 ? 'Neutral' : sentiment >= 30 ? 'Fear' : 'Extreme Fear';
  const sentimentColor = sentiment >= 70 ? '#f59e0b' : sentiment >= 50 ? '#22d3ee' : '#ef4444';

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Market Pulse</h1>
            {liveMode && (
              <motion.span className="text-[9px] bg-green-500/15 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full font-mono flex items-center gap-1"
                animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                LIVE
              </motion.span>
            )}
          </div>
          <p className="text-[10px] text-white/30 font-mono uppercase mt-0.5">
            {lastUpdated ? `Updated: ${lastUpdated}` : 'Connecting...'} · {language.toUpperCase()}
          </p>
        </div>
        <button onClick={() => { fetchMarket(); fetchNews(); }}
          className="flex items-center gap-1.5 text-xs text-[#00ff88]/60 hover:text-[#00ff88] transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${marketLoading ? 'animate-spin' : ''}`} />
          {marketLoading ? 'Syncing...' : 'Refresh'}
        </button>
      </div>

      {/* Live Ticker */}
      <div className="relative overflow-hidden rounded-xl glass border border-white/[0.06] py-2">
        <div className="flex gap-6 animate-[scroll_25s_linear_infinite] whitespace-nowrap">
          {[...indices, ...indices].map((idx, i) => (
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
        {indices.slice(0, 6).map((idx, i) => (
          <motion.div key={idx.sym}
            className="glass rounded-xl p-3 border border-white/[0.05] cursor-pointer hover:border-white/10 transition-all"
            whileHover={{ scale: 1.03 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => deepDive(`What's the latest on ${idx.sym}? Should I be watching this closely?`)}>
            <p className="text-[10px] text-white/35 font-mono">{idx.sym}</p>
            <p className="text-lg font-black text-white">{idx.prefix || ''}{idx.val.toLocaleString()}</p>
            <div className="flex items-center gap-1">
              {idx.chg >= 0 ? <TrendingUp className="w-3 h-3 text-[#00ff88]" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
              <p className={`text-xs font-bold ${idx.chg >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>{idx.chg >= 0 ? '+' : ''}{idx.chg}%</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Market Sentiment */}
      <div className="glass rounded-2xl p-5 border border-white/[0.06]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">AI Market Sentiment</p>
          <span className="text-[10px] text-white/20">Live computed · {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none" stroke="#1f2937" strokeWidth="3" />
              <motion.path d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32" fill="none"
                stroke={sentimentColor} strokeWidth="3"
                strokeDasharray="0 100"
                animate={{ strokeDasharray: `${sentiment} 100` }} transition={{ duration: 1.5 }}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-base font-black text-white">{sentiment}</p>
            </div>
          </div>
          <div>
            <p className="text-lg font-black" style={{ color: sentimentColor }}>{sentimentLabel}</p>
            <p className="text-xs text-white/40">{sentiment}/100 · Market Momentum</p>
            <button onClick={() => deepDive('Analyze current market sentiment and tell me if now is a good time to invest or wait.')}
              className="mt-1 text-[10px] text-purple-400 hover:text-white transition-colors">Ask Andy →</button>
          </div>
        </div>
      </div>

      {/* Deep Dive with Andy */}
      <div className="glass rounded-2xl p-4 border border-purple-500/10">
        <p className="text-[10px] text-purple-400/50 font-mono uppercase mb-2">Opportunity Radar — Ask Andy</p>
        <div className="flex gap-2">
          <input id="market-ask"
            placeholder="Analyze NIFTY breakout, compare HDFC vs ICICI, explain FII DII flows..."
            onKeyDown={e => { if (e.key === 'Enter') { deepDive((e.target as any).value); (e.target as any).value = ''; }}}
            className="flex-1 px-3 py-2 rounded-xl glass border border-white/[0.07] text-white placeholder-white/20 text-xs focus:outline-none focus:border-purple-400/30" />
          <button onClick={() => { const el = document.getElementById('market-ask') as HTMLInputElement; if (el?.value) { deepDive(el.value); el.value = ''; }}}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold">ASK</button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {['NIFTY breakout signals?', 'Best SIP funds right now?', 'FII DII flows today?', 'NSE smallcap momentum?'].map(q => (
            <button key={q} onClick={() => deepDive(q)}
              className="text-[9px] text-white/30 hover:text-white/60 border border-white/[0.06] px-2 py-0.5 rounded-full transition-colors">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Sector Heatmap */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">NSE Sector Heatmap</p>
        <div className="grid grid-cols-3 gap-2">
          {SECTORS.map(s => {
            const col = s.chg >= 1 ? '#00ff88' : s.chg >= 0 ? '#22d3ee' : s.chg >= -1 ? '#f59e0b' : '#ef4444';
            return (
              <motion.div key={s.name} className="p-3 rounded-xl text-center cursor-pointer"
                style={{ background: s.chg >= 0 ? 'rgba(0,255,136,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${col}25` }}
                whileHover={{ scale: 1.05 }}
                onClick={() => deepDive(`What's happening in the ${s.name} sector in India today? Any opportunities or risks?`)}>
                <p className="text-[10px] text-white/50 mb-1">{s.name}</p>
                <p className="font-black text-sm" style={{ color: col }}>{s.chg >= 0 ? '+' : ''}{s.chg}%</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live News Intel */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">Live Market Intel</p>
          {newsLoading && <RefreshCw className="w-3.5 h-3.5 text-white/30 animate-spin" />}
          {NEWSDATA_KEY ? (
            <span className="text-[9px] text-green-400/60 font-mono">NewsData.io Live</span>
          ) : (
            <span className="text-[9px] text-white/20 font-mono">Curated Feed</span>
          )}
        </div>
        <div className="space-y-3">
          {news.map((n, i) => (
            <motion.button key={i}
              onClick={() => n.url ? window.open(n.url, '_blank') : deepDive(`Tell me more about: "${n.title}". What does this mean for my investments?`)}
              className="w-full text-left p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/[0.04]"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] px-2 py-0.5 rounded-full font-mono capitalize" style={{ background: n.color + '18', color: n.color }}>{n.tag}</span>
                <span className="text-[9px] text-white/25">{n.time}</span>
              </div>
              <p className="text-xs font-bold text-white">{n.title}</p>
              <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed line-clamp-2">{n.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
});
