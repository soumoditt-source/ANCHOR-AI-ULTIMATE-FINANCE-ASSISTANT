// @ts-nocheck
// pages/Home.tsx — Dashboard home with micro-wins, wealth velocity, quick nav
import { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Anchor, Zap, TrendingUp, ArrowRight, Sword, Rocket, BarChart3, Clock, Crown, Briefcase } from 'lucide-react';
import { useStore, formatMoney, LANGUAGES } from '../store/useStore';

const Card = memo(({ children, className = '' }: any) => (
  <div className={`glass rounded-2xl ${className}`}>{children}</div>
));

export const Home = memo(function Home() {
  const user = useStore((s) => s.user);
  const navigate = useStore((s) => s.navigate);
  const debts = useStore((s) => s.debts);
  const streak = useStore((s) => s.streak);
  const dailyTarget = useStore((s) => s.dailyTarget);
  const microWins = useStore((s) => s.microWins);
  const crushDay = useStore((s) => s.crushDay);
  const ostriched = useStore((s) => s.ostriched);
  const toggleOstrich = useStore((s) => s.toggleOstrich);
  const currency = useStore((s) => s.currency);
  const appMode = useStore((s) => s.appMode);
  const language = useStore((s) => s.language);
  const fetchMarket = useStore((s) => s.fetchMarket);
  const fetchWeather = useStore((s) => s.fetchWeather);
  const weather = useStore((s) => s.weather);
  const firstGreetingDone = useStore((s) => s.firstGreetingDone);
  const andySpeak = useStore((s) => s.andySpeak);

  useEffect(() => { fetchMarket(); fetchWeather(); }, []);

  // Auto AI Greeting on first load of dashboard
  useEffect(() => {
    if (!firstGreetingDone && user?.name) {
      useStore.setState({ firstGreetingDone: true, voiceEnabled: true });
      const names = user.name.split(' ')[0];
      const msgs: Record<string, string> = {
        en: `Welcome to the dashboard, ${names}. I am Andy, your personal C F O.`,
        hi: `डैशबोर्ड में आपका स्वागत है, ${names}। मैं एंडी हूँ।`,
        es: `Bienvenido al panel, ${names}. Soy Andy, su C F O personal.`,
        fr: `Bienvenue sur le tableau de bord, ${names}. Je suis Andy.`,
        ar: `مرحبًا بك في لوحة القيادة، ${names}. أنا آندي، المدير المالي الشخصي لك.`,
        zh: `欢迎进入首页，${names}。我是安迪，您的个人首席财务官。`,
        pt: `Bem-vindo ao painel, ${names}. Eu sou Andy, seu C F O pessoal.`,
        de: `Willkommen auf dem Dashboard, ${names}. Ich bin Andy, Ihr persönlicher C F O.`,
        ja: `ダッシュボードへようこそ、${names}。私はアンディ、あなたの個人的なCFOです。`
      };
      setTimeout(() => andySpeak(msgs[language] || msgs.en), 1200);
    }
  }, [firstGreetingDone, user?.name, language, andySpeak]);

  const totalDebt = debts.reduce((a, d) => a + d.balance, 0);
  const highestApr = [...debts].sort((a, b) => b.apr - a.apr)[0];
  const dailyInterestSaved = microWins.reduce((a, w) => a + (w.amount * 0.0005), 0);

  const MODE_BADGE: Record<string, { label: string; Icon: any; color: string }> = {
    standard: { label: 'Standard Mode', Icon: Anchor, color: '#00ff88' },
    ceo: { label: 'CEO Mode — Big Picture', Icon: Crown, color: '#f59e0b' },
    cfo: { label: 'CFO Mode — Deep Analytics', Icon: Briefcase, color: '#22d3ee' },
  };
  const badge = MODE_BADGE[appMode] || MODE_BADGE.standard;

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening';
  const langGreet = {
    en: greeting, hi: 'नमस्ते', es: 'Buenos días', fr: 'Bonjour',
    ar: 'مرحباً', zh: '你好', pt: 'Bom dia', de: 'Guten Tag', ja: 'こんにちは',
  };

  const QUICK_NAV = [
    { label: 'War Room', Icon: Sword, page: 'warroom', color: '#ef4444', desc: 'Crush your debt' },
    { label: 'FIRE Engine', Icon: Rocket, page: 'infinity', color: '#22d3ee', desc: 'Early retirement' },
    { label: 'Markets', Icon: BarChart3, page: 'market', color: '#f59e0b', desc: 'Live prices' },
    { label: 'History', Icon: Clock, page: 'history', color: '#a855f7', desc: 'Past moves' },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-white/40 text-sm">{langGreet[language] || greeting},</p>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Commander'} 👋</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-white/[0.08]">
              <badge.Icon className="w-3 h-3" style={{ color: badge.color }} />
              <span className="text-[10px] font-mono" style={{ color: badge.color }}>{badge.label}</span>
            </div>
            {weather && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-white/[0.08]">
                <span className="text-[10px] text-white/40">{weather.condition} {weather.temp}°C · {weather.city}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-white/30 font-mono">STREAK</p>
          <p className="text-2xl font-black text-[#00ff88]">🔥 {streak}</p>
        </div>
      </div>

      {/* Micro-Win Card — Key original feature */}
      <Card className="p-5 border border-[#00ff88]/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 to-transparent pointer-events-none" />
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-[#00ff88]/60 font-mono uppercase mb-1">🎯 Daily Micro-Win</p>
            <p className="text-white font-bold text-sm">Don't look at the mountain. Just kick this pebble.</p>
            {highestApr && <p className="text-xs text-white/30 mt-1">Auto-targeting: {highestApr.name} ({highestApr.apr}% APR)</p>}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs text-white/30">Ostrich Mode:</span>
            <button onClick={toggleOstrich}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${ostriched ? 'bg-orange-500/20 text-orange-400' : 'bg-white/[0.06] text-white/30'}`}>
              {ostriched ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-white/40 text-xs">Today's Target</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#00ff88]">{formatMoney(dailyTarget, currency)}</span>
              <span className="text-white/30 text-sm">/ {formatMoney(totalDebt, currency)} total</span>
            </div>
          </div>
          <p className="text-xs text-white/25">Streak: {streak} days</p>
        </div>
        <motion.button onClick={crushDay}
          className="w-full py-3.5 rounded-xl text-black font-black tracking-wide relative overflow-hidden text-sm"
          style={{ background: 'linear-gradient(135deg, #00ff88, #0088ff)' }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <motion.div className="absolute inset-0 bg-white/20"
            animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity }} />
          🚀 BLAST {formatMoney(dailyTarget, currency)} NOW
        </motion.button>
      </Card>

      {/* Wealth Velocity */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Wealth Velocity', value: 'ACTIVE', sub: 'Last payment recorded', color: '#00ff88', Icon: Zap },
          { label: 'Daily Interest Saved', value: formatMoney(dailyInterestSaved, currency), sub: 'From micro-wins', color: '#22d3ee', Icon: TrendingUp },
          { label: '5Y Projection', value: formatMoney((user?.monthlyIncome || 5000) * 60 * 0.7, currency), sub: 'At current savings rate', color: '#8b5cf6', Icon: Rocket },
        ].map((s, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.Icon className="w-4 h-4" style={{ color: s.color }} />
              <p className="text-[10px] text-white/35 uppercase tracking-wider font-mono">{s.label}</p>
            </div>
            <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-white/25 mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Quick nav grid — from original */}
      <div>
        <p className="text-[10px] text-white/30 font-mono uppercase mb-3">Quick Navigate</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_NAV.map(n => (
            <motion.button key={n.page} onClick={() => navigate(n.page as any)}
              className="p-4 rounded-2xl glass border border-white/[0.06] text-left group hover:border-white/10 transition-all"
              whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
              <n.Icon className="w-5 h-5 mb-3" style={{ color: n.color }} />
              <p className="font-bold text-white text-sm">{n.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{n.desc}</p>
              <ArrowRight className="w-3.5 h-3.5 text-white/20 mt-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent wins */}
      {microWins.length > 0 && (
        <Card className="p-4">
          <p className="text-[10px] text-[#00ff88]/50 font-mono uppercase mb-3">Recent Wins</p>
          <div className="space-y-2">
            {microWins.slice(0, 4).map(w => (
              <div key={w.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                  <span className="text-sm text-white/60">{w.debt}</span>
                </div>
                <span className="text-sm font-bold text-[#00ff88]">+{formatMoney(w.amount, currency)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
});
