// @ts-nocheck
// pages/Concierge.tsx — Location-aware lifestyle & wealth planning AI
// Fetches geolocation → coordinates → city name → weather
import { memo, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Cloud, Utensils, ShoppingCart, Map, Briefcase, Bot, Send } from 'lucide-react';
import { useStore, formatMoney } from '../store/useStore';

interface GeoState {
  city: string; country: string; lat: number; lng: number; loading: boolean;
}

function useGeo() {
  const [geo, setGeo] = useState<GeoState>({ city: 'Unknown City', country: 'India', lat: 28.6, lng: 77.2, loading: true });
  useEffect(() => {
    const tryGeo = async (lat: number, lng: number) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const d = await r.json();
        const city = d.address?.city || d.address?.town || d.address?.village || d.address?.state_district || 'Unknown City';
        const country = d.address?.country || 'India';
        setGeo({ city, country, lat, lng, loading: false });
      } catch {
        setGeo(p => ({ ...p, loading: false }));
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => tryGeo(coords.latitude, coords.longitude),
        async () => {
          // IP fallback
          try {
            const r = await fetch('https://ipapi.co/json/');
            const d = await r.json();
            setGeo({ city: d.city || 'Unknown City', country: d.country_name || 'India', lat: d.latitude || 28.6, lng: d.longitude || 77.2, loading: false });
          } catch {
            setGeo(p => ({ ...p, loading: false }));
          }
        },
        { timeout: 5000 }
      );
    } else {
      setGeo(p => ({ ...p, loading: false }));
    }
  }, []);
  return geo;
}

const LIFESTYLE_ACTIONS = [
  { Icon: Utensils,      label: 'Dinner Date',   desc: 'Budget-optimized local dining.', color: '#f59e0b',  q: (city: string) => `Suggest 3 budget-friendly restaurants in ${city} for a dinner date with an estimated total bill under $30.` },
  { Icon: ShoppingCart,  label: 'Grocery Run',   desc: 'Cost-effective meal planning.',  color: '#10b981',  q: (city: string) => `Help me plan a cost-effective weekly grocery list in ${city} under $50, with 5 healthy meals planned.` },
  { Icon: Map,           label: 'Weekend Trip',  desc: 'Local exploration on a budget.', color: '#22d3ee',  q: (city: string) => `Suggest a budget weekend trip or day outing near ${city} under $20 total, including transport tips.` },
  { Icon: Briefcase,     label: 'Work Space',    desc: 'Productivity without premium.',   color: '#8b5cf6',  q: (city: string) => `Find affordable co-working spaces or cafes in ${city} suitable for remote work under $5/day.` },
];

export const Concierge = memo(function Concierge() {
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const weather = useStore((s) => s.weather);
  const fetchWeather = useStore((s) => s.fetchWeather);
  const debts = useStore((s) => s.debts);
  const currency = useStore((s) => s.currency);
  const market = useStore((s) => s.market);

  const [mission, setMission] = useState('');
  const [time, setTime] = useState(new Date());
  const geo = useGeo();

  useEffect(() => { fetchWeather(); }, []);
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const handleMission = useCallback(() => {
    if (!mission.trim()) return;
    navigate('andy');
    setTimeout(() => sendChat(`Mission objective: ${mission}. I'm in ${geo.city}, ${geo.country}. Help me plan this within my budget and financial goals.`), 400);
    setMission('');
  }, [mission, navigate, sendChat, geo]);

  const highestApr = [...debts].sort((a, b) => b.apr - a.apr)[0];

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white">Concierge</h1>
          <p className="text-[10px] text-white/30 font-mono uppercase">Location-Aware Lifestyle & Wealth Planning</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-[#00ff88]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-[9px] font-mono text-[#00ff88]">SATELLITE UPLINK ACTIVE</span>
        </div>
      </div>

      {/* Location + time + weather */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 border border-white/[0.06]">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#00ff88]" />
            <p className="text-[10px] text-white/30 font-mono">LOCATION</p>
          </div>
          <p className="text-lg font-black text-white">{geo.loading ? 'Locating...' : geo.city}</p>
          <p className="text-xs text-white/40">{geo.country}</p>
          <p className="text-[9px] text-white/20 mt-1 font-mono">{geo.lat.toFixed(2)}°N, {geo.lng.toFixed(2)}°E</p>
        </div>
        <div className="glass rounded-2xl p-4 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#22d3ee]" />
              <p className="text-[10px] text-white/30 font-mono">LOCAL TIME</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <p className="text-[10px] text-white/30 font-mono">WEATHER</p>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-xl font-black text-white tabular-nums">{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</p>
            <div className="text-right">
              <p className="text-xl font-black text-white">{weather?.temp || '--'}°C</p>
              <p className="text-[10px] text-white/30">{weather?.condition?.split(' ').slice(1).join(' ') || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lifestyle action cards */}
      <div className="grid grid-cols-2 gap-3">
        {LIFESTYLE_ACTIONS.map(a => (
          <motion.button key={a.label}
            onClick={() => { navigate('andy'); setTimeout(() => sendChat(a.q(geo.city)), 400); }}
            className="glass rounded-2xl p-4 text-left border border-white/[0.06] hover:border-white/10 transition-all"
            whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: a.color + '15' }}>
              <a.Icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <p className="font-bold text-white text-sm">{a.label}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{a.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Market quick view */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-white/30 font-mono uppercase">Live Market Snapshot</p>
          <button onClick={() => navigate('market')} className="text-[10px] text-[#00ff88]/50 hover:text-[#00ff88]">View All →</button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.entries(market).slice(0, 6).map(([sym, d]: any) => (
            <div key={sym} className="p-2 rounded-lg bg-white/[0.03]">
              <p className="text-[9px] text-white/30 font-mono">{sym}</p>
              <p className="text-sm font-black text-white">${d.c?.toFixed(0)}</p>
              <p className={`text-[10px] font-bold ${d.dp >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>{d.dp >= 0 ? '+' : ''}{d.dp?.toFixed(2)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission objective */}
      <div className="glass rounded-2xl p-4 border border-[#00ff88]/08">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] text-[#00ff88]/50 font-mono uppercase">Mission Objective</p>
          <div className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-[#00ff88] animate-pulse" /><span className="text-[9px] text-[#00ff88]/40">Live Web Search Enabled</span></div>
        </div>
        <div className="flex gap-2">
          <input id="concierge-mission" value={mission} onChange={e => setMission(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleMission()}
            placeholder={`e.g., 'Plan a budget party for 5 friends this Friday evening in ${geo.city}...'`}
            className="flex-1 px-3 py-2.5 rounded-xl glass border border-white/[0.07] text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#00ff88]/20" />
          <motion.button onClick={handleMission} whileTap={{ scale: 0.95 }}
            className="px-3 py-2.5 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-xs font-bold">
            <Send className="w-3.5 h-3.5" />
          </motion.button>
        </div>
        <p className="text-[9px] text-white/15 mt-1.5">Press Enter to submit · Awaiting Instructions</p>
      </div>
    </div>
  );
});
