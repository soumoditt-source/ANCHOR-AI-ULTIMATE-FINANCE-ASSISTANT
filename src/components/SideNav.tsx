// @ts-nocheck
// SideNav.tsx — Desktop sidebar + mobile bottom bar navigation
// Shows on dashboard only. 9 pages + user info + mode switcher
import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, Sword, Rocket, BarChart3, CalendarDays, Grid3x3, TrendingUp,
  Clock, Bot, LogOut, Settings, ChevronRight, Anchor, Crown, Briefcase
} from 'lucide-react';
import { useStore, LANGUAGES, CURRENCIES, type PageKey, type LangCode, type CurrencyCode, type AppMode } from '../store/useStore';

const NAV_ITEMS: { key: PageKey; label: string; Icon: any; color: string; shortLabel: string }[] = [
  { key: 'home',      label: 'Home',       shortLabel: 'Home',    Icon: Home,         color: '#00ff88' },
  { key: 'concierge', label: 'Concierge',  shortLabel: 'AI',      Icon: Users,        color: '#0088ff' },
  { key: 'warroom',   label: 'War Room',   shortLabel: 'War',     Icon: Sword,        color: '#ef4444' },
  { key: 'infinity',  label: 'Infinity',   shortLabel: 'FIRE',    Icon: Rocket,       color: '#22d3ee' },
  { key: 'market',    label: 'Market',     shortLabel: 'Market',  Icon: BarChart3,    color: '#f59e0b' },
  { key: 'planner',   label: 'Planner',    shortLabel: 'Plan',    Icon: CalendarDays, color: '#8b5cf6' },
  { key: 'services',  label: 'Services',   shortLabel: 'Service', Icon: Grid3x3,      color: '#06b6d4' },
  { key: 'kpis',      label: 'KPIs',       shortLabel: 'KPIs',    Icon: TrendingUp,   color: '#10b981' },
  { key: 'history',   label: 'History',    shortLabel: 'History', Icon: Clock,        color: '#a855f7' },
  { key: 'andy',      label: 'Andy AI',    shortLabel: 'Andy',    Icon: Bot,          color: '#f0abfc' },
];

const MODE_OPTIONS: { key: AppMode; label: string; Icon: any; desc: string }[] = [
  { key: 'standard', label: 'Standard', Icon: Anchor,   desc: 'Default mode' },
  { key: 'ceo',      label: 'CEO Mode', Icon: Crown,    desc: 'Big picture view' },
  { key: 'cfo',      label: 'CFO Mode', Icon: Briefcase,desc: 'Deep analytics' },
];

export const SideNav = memo(function SideNav() {
  const activePage = useStore((s) => s.activePage);
  const navigate = useStore((s) => s.navigate);
  const user = useStore((s) => s.user);
  const clearData = useStore((s) => s.clearData);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const currency = useStore((s) => s.currency);
  const setCurrency = useStore((s) => s.setCurrency);
  const appMode = useStore((s) => s.appMode);
  const setAppMode = useStore((s) => s.setAppMode);

  const [showSettings, setShowSettings] = useState(false);

  const activeItem = NAV_ITEMS.find(n => n.key === activePage);

  return (
    <>
      {/* ── Desktop Side Nav ── */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 z-40 w-[72px] xl:w-[200px] border-r border-white/[0.06]"
        style={{ background: 'rgba(2,2,9,0.85)', backdropFilter: 'blur(24px)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#0088ff] flex items-center justify-center flex-shrink-0">
            <Anchor className="w-4 h-4 text-black" strokeWidth={3} />
          </div>
          <div className="hidden xl:block">
            <p className="text-xs font-black text-white tracking-wider">ANCHOR AI</p>
            <p className="text-[9px] text-white/30 font-mono capitalize">{appMode} mode</p>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-1.5">
          {NAV_ITEMS.map(item => {
            const isActive = activePage === item.key;
            return (
              <button key={item.key} onClick={() => navigate(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${isActive ? 'text-white' : 'text-white/35 hover:text-white/70 hover:bg-white/[0.04]'}`}
                style={isActive ? { background: item.color + '15', color: item.color } : undefined}>
                <item.Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18, color: isActive ? item.color : undefined }} />
                <span className="hidden xl:block text-sm font-semibold truncate">{item.label}</span>
                {isActive && <div className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />}
              </button>
            );
          })}
        </div>

        {/* Bottom: mode + settings + user */}
        <div className="border-t border-white/[0.06] p-2 space-y-1">
          {/* Mode switcher */}
          <div className="hidden xl:flex gap-1 mb-2">
            {MODE_OPTIONS.map(m => (
              <button key={m.key} onClick={() => setAppMode(m.key)} title={m.desc}
                className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${appMode === m.key ? 'bg-[#00ff88]/15 text-[#00ff88]' : 'text-white/25 hover:text-white/50'}`}>
                {m.label.split(' ')[0]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowSettings(s => !s)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white/25 hover:text-white/60 transition-all text-sm">
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span className="hidden xl:block">Settings</span>
          </button>
          <div className="flex items-center gap-2 px-1.5 py-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00ff88]/30 to-[#8b5cf6]/30 flex items-center justify-center flex-shrink-0 text-xs font-black text-[#00ff88]">
              {(user?.name || 'C')[0].toUpperCase()}
            </div>
            <div className="hidden xl:block flex-1 truncate">
              <p className="text-[10px] font-bold text-white/60 truncate">{user?.name || 'Commander'}</p>
              <p className="text-[9px] text-white/25 font-mono">{CURRENCIES[currency]?.symbol} · {LANGUAGES[language]?.flag}</p>
            </div>
            <button onClick={clearData} className="hidden xl:block ml-auto text-white/15 hover:text-red-400 transition-colors p-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="hidden md:block fixed left-[72px] xl:left-[200px] bottom-0 top-0 z-40 w-72 border-r border-white/[0.08]"
            style={{ background: 'rgba(4,4,15,0.95)', backdropFilter: 'blur(24px)' }}
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-black text-white">Settings</p>
                <button onClick={() => setShowSettings(false)} className="text-white/30 hover:text-white text-xs">✕</button>
              </div>

              {/* Language */}
              <div className="mb-5">
                <p className="text-[10px] text-white/40 font-mono uppercase mb-2.5">Language</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <button key={code} onClick={() => { setLanguage(code as LangCode); setShowSettings(false); }}
                      className={`p-2 rounded-xl text-center transition-all text-[11px] ${language === code ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]' : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70'}`}>
                      <div className="text-lg mb-0.5">{lang.flag}</div>
                      <div className="truncate text-[9px]">{lang.label.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div className="mb-5">
                <p className="text-[10px] text-white/40 font-mono uppercase mb-2.5">Currency</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(CURRENCIES).map(([code, c]) => (
                    <button key={code} onClick={() => { setCurrency(code as CurrencyCode); setShowSettings(false); }}
                      className={`p-2 rounded-xl text-center transition-all ${currency === code ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]' : 'bg-white/[0.03] border border-white/[0.06] text-white/35 hover:text-white/60'}`}>
                      <div className="text-base font-black">{c.symbol}</div>
                      <div className="text-[9px]">{code}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* App Mode */}
              <div>
                <p className="text-[10px] text-white/40 font-mono uppercase mb-2.5">App Mode</p>
                <div className="space-y-1.5">
                  {MODE_OPTIONS.map(m => (
                    <button key={m.key} onClick={() => { setAppMode(m.key); setShowSettings(false); }}
                      className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all ${appMode === m.key ? 'bg-[#00ff88]/10 border border-[#00ff88]/20' : 'bg-white/[0.03] border border-white/[0.05] hover:border-white/10'}`}>
                      <m.Icon className={`w-4 h-4 ${appMode === m.key ? 'text-[#00ff88]' : 'text-white/30'}`} />
                      <div>
                        <p className={`text-xs font-bold ${appMode === m.key ? 'text-[#00ff88]' : 'text-white/50'}`}>{m.label}</p>
                        <p className="text-[10px] text-white/25">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06]"
        style={{ background: 'rgba(2,2,9,0.92)', backdropFilter: 'blur(24px)' }}>
        <div className="flex items-center justify-around px-1 py-2">
          {NAV_ITEMS.slice(0, 9).map(item => {
            const isActive = activePage === item.key;
            return (
              <button key={item.key} onClick={() => navigate(item.key)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition-all min-w-0 flex-1"
                style={isActive ? { color: item.color } : { color: 'rgba(255,255,255,0.25)' }}>
                <item.Icon style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 8, fontWeight: 600, lineHeight: 1 }}>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
});
