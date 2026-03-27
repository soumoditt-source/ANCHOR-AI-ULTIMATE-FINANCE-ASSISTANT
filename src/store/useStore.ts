// @ts-nocheck
// useStore.ts — Ultimate Anchor AI enterprise store
// Navigation: 9 pages, full-screen panel system
// Features: voice, language, currency, CEO mode, micro-wins, debts, FIRE, chat
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────
export type PageKey =
  | 'home' | 'concierge' | 'warroom' | 'infinity'
  | 'market' | 'planner' | 'services' | 'kpis' | 'history' | 'andy';

export type AppMode = 'standard' | 'ceo' | 'cfo';
export type LangCode = 'en' | 'hi' | 'es' | 'fr' | 'ar' | 'zh' | 'pt' | 'de' | 'ja';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  language: LangCode;
  monthlyIncome: number;
  monthlyExpenses: number;
  mode: AppMode;
  firstVisit: boolean;
  totalNetWorth: number;
}

export interface Debt {
  id: string; name: string; balance: number; apr: number; minPayment: number; type: string;
}

export interface MicroWin {
  id: string; amount: number; debt: string; timestamp: number;
}

export interface ChatMessage {
  role: 'user' | 'andy'; text: string; ts: number; lang?: string;
}

export interface MarketQuote { c: number; d: number; dp: number; }

export interface HistoryEntry {
  id: string; type: 'payment' | 'income' | 'expense' | 'win'; amount: number; label: string; ts: number;
}

export interface WeatherData { temp: number; condition: string; city: string; }

// ─── Languages ────────────────────────────────────────────────────────────────
export const LANGUAGES: Record<LangCode, { label: string; flag: string; code: string }> = {
  en: { label: 'English', flag: '🇬🇧', code: 'en-US' },
  hi: { label: 'हिन्दी', flag: '🇮🇳', code: 'hi-IN' },
  es: { label: 'Español', flag: '🇪🇸', code: 'es-ES' },
  fr: { label: 'Français', flag: '🇫🇷', code: 'fr-FR' },
  ar: { label: 'العربية', flag: '🇸🇦', code: 'ar-SA' },
  zh: { label: '中文', flag: '🇨🇳', code: 'zh-CN' },
  pt: { label: 'Português', flag: '🇧🇷', code: 'pt-BR' },
  de: { label: 'Deutsch', flag: '🇩🇪', code: 'de-DE' },
  ja: { label: '日本語', flag: '🇯🇵', code: 'ja-JP' },
};

// ─── Currencies ───────────────────────────────────────────────────────────────
export const CURRENCIES = {
  USD: { symbol: '$',  name: 'US Dollar',    rate: 1 },
  EUR: { symbol: '€',  name: 'Euro',          rate: 0.92 },
  GBP: { symbol: '£',  name: 'Brit Pound',    rate: 0.79 },
  INR: { symbol: '₹',  name: 'Indian Rupee',  rate: 83.12 },
  JPY: { symbol: '¥',  name: 'Japanese Yen',  rate: 153.2 },
  AED: { symbol: 'د.إ',name: 'UAE Dirham',    rate: 3.67 },
  CAD: { symbol: 'C$', name: 'Canadian $',    rate: 1.36 },
  AUD: { symbol: 'A$', name: 'Australian $',  rate: 1.53 },
  CHF: { symbol: '₣',  name: 'Swiss Franc',   rate: 0.91 },
  SGD: { symbol: 'S$', name: 'Singapore $',   rate: 1.35 },
  CNY: { symbol: '¥',  name: 'Chinese Yuan',  rate: 7.24 },
  BRL: { symbol: 'R$', name: 'Brazilian Real', rate: 5.05 },
};
export type CurrencyCode = keyof typeof CURRENCIES;

export const formatMoney = (amount: number, currency: CurrencyCode = 'USD') => {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amount * c.rate;
  return `${c.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_MARKET: Record<string, MarketQuote> = {
  AAPL:  { c: 213.49, d: 1.23,  dp: 0.58  },
  NVDA:  { c: 875.00, d: 22.50, dp: 2.64  },
  MSFT:  { c: 420.31, d: -0.88, dp: -0.21 },
  TSLA:  { c: 172.82, d: -3.11, dp: -1.77 },
  AMZN:  { c: 195.57, d: 3.41,  dp: 1.78  },
  GOOGL: { c: 178.25, d: 2.10,  dp: 1.19  },
  META:  { c: 521.00, d: 8.40,  dp: 1.64  },
  NFLX:  { c: 628.50, d: -4.20, dp: -0.66 },
};
const MOCK_CRYPTO = {
  bitcoin:  { usd: 67800, usd_24h_change: 2.3  },
  ethereum: { usd: 3520,  usd_24h_change: 1.4  },
  solana:   { usd: 149,   usd_24h_change: -2.8 },
  ripple:   { usd: 0.58,  usd_24h_change: 0.7  },
};
const AI_RESPONSES = [
  "Focus on the avalanche method: highest APR first while paying minimums on others. Saves the most interest! 🎯",
  "Emergency fund first: $1,000 set aside prevents new debt when life happens. Then aggressively attack balances!",
  "FIRE number = annual expenses × 25. At 4% withdrawal rate, your portfolio sustains you forever. 🔥",
  "Dollar-cost averaging into index funds beats timing the market 98% of the time. Automate it and forget it! 📈",
  "Keep total debt payments under 36% of gross income for long-term financial stability.",
  "Balance transfer to 0% APR card gives 12-18 months of pure principal paydown — check eligibility! 💪",
];

// ─── Store ────────────────────────────────────────────────────────────────────
interface AppState {
  // Navigation
  activePage: PageKey;
  prevPage: PageKey | null;
  transitioning: boolean;

  // User
  user: UserProfile | null;
  onboarded: boolean;
  view: 'intro' | 'onboard' | 'dashboard';

  // App config
  currency: CurrencyCode;
  language: LangCode;
  appMode: AppMode;
  voiceEnabled: boolean;
  andyTalking: boolean;
  tutorialComplete: boolean;

  // Financial data
  debts: Debt[];
  history: HistoryEntry[];
  microWins: MicroWin[];
  dailyTarget: number;
  streak: number;
  ostriched: boolean;
  fireTarget: number;
  fireMonthly: number;
  fireTargetAge: number;
  currentAge: number;

  // Market
  market: Record<string, MarketQuote>;
  crypto: Record<string, { usd: number; usd_24h_change: number }>;
  marketLoading: boolean;
  lastFetch: number;
  weather: WeatherData | null;

  // Andy AI chat
  chatMessages: ChatMessage[];
  chatLoading: boolean;

  // Document scan
  scannedDoc: string | null;
  scanLoading: boolean;

  // AI Voice
  firstGreetingDone: boolean;
  andySpeak: (text: string) => void;

  // Actions
  navigate: (page: PageKey) => void;
  setView: (v: 'intro' | 'onboard' | 'dashboard') => void;
  setUser: (u: Partial<UserProfile>) => void;
  setCurrency: (c: CurrencyCode) => void;
  setLanguage: (l: LangCode) => void;
  setAppMode: (m: AppMode) => void;
  toggleVoice: () => void;
  setAndyTalking: (v: boolean) => void;
  completeTutorial: () => void;
  addDebt: (d: Omit<Debt, 'id'>) => void;
  removeDebt: (id: string) => void;
  makePayment: (debtId: string, amount: number) => void;
  crushDay: () => void;
  toggleOstrich: () => void;
  updateFire: (age: number, monthly: number, targetAge: number) => void;
  fetchMarket: () => Promise<void>;
  fetchWeather: () => Promise<void>;
  sendChat: (msg: string, geminiKey?: string) => Promise<void>;
  scanDocument: (base64: string, geminiKey?: string) => Promise<void>;
  clearData: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'guest', name: 'Commander', email: '', currency: 'USD',
  language: 'en', monthlyIncome: 5000, monthlyExpenses: 3200, mode: 'standard',
  firstVisit: true, totalNetWorth: 0,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activePage: 'home',
      prevPage: null,
      transitioning: false,
      user: null,
      onboarded: false,
      view: 'intro',
      currency: 'USD',
      language: 'en',
      appMode: 'standard',
      voiceEnabled: false,
      andyTalking: false,
      tutorialComplete: false,
      debts: [
        { id: '1', name: 'Credit Card',   balance: 5200,  apr: 18.99, minPayment: 200, type: 'credit'  },
        { id: '2', name: 'Student Loan',  balance: 15000, apr: 5.5,   minPayment: 450, type: 'student' },
        { id: '3', name: 'Car Loan',      balance: 8900,  apr: 7.2,   minPayment: 320, type: 'auto'    },
      ],
      history: [],
      microWins: [],
      dailyTarget: 25,
      streak: 0,
      ostriched: false,
      fireTarget: 1_250_000,
      fireMonthly: 2500,
      fireTargetAge: 45,
      currentAge: 28,
      market: MOCK_MARKET,
      crypto: MOCK_CRYPTO,
      marketLoading: false,
      lastFetch: 0,
      weather: null,
      chatMessages: [
        {
          role: 'andy',
          text: "Hey! I'm Andy AI 🤖 — your personal CFO. Chat with me or tap the mic and talk! I handle your debts, FIRE path, and investments. What's your money goal today?",
          ts: Date.now(),
        }
      ],
      chatLoading: false,
      scannedDoc: null,
      scanLoading: false,
      firstGreetingDone: false,

      andySpeak: (text) => {
        const { voiceEnabled, language, setAndyTalking } = get();
        if (!voiceEnabled || !('speechSynthesis' in window)) return;
        
        setAndyTalking(true);
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = LANGUAGES[language]?.code || 'en-US';
        
        const voices = window.speechSynthesis.getVoices();
        const shortLang = utt.lang.split('-')[0];
        // Try to find a premium/natural voice for the language
        const premium = voices.find(v => v.lang.startsWith(shortLang) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Premium')));
        const fallback = voices.find(v => v.lang.startsWith(shortLang));
        
        if (premium) utt.voice = premium;
        else if (fallback) utt.voice = fallback;
        
        utt.rate = 1.0;
        utt.pitch = 1.05;
        utt.onend = () => setAndyTalking(false);
        utt.onerror = () => setAndyTalking(false);
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
      },

      // ─── Navigation ────────────────────────────────────────────────────
      navigate: (page) => {
        const { activePage, transitioning } = get();
        if (activePage === page || transitioning) return;
        set({ transitioning: true, prevPage: activePage });
        setTimeout(() => set({ activePage: page, transitioning: false }), 300);
      },

      // ─── View / Auth ───────────────────────────────────────────────────
      setView: (v) => set({ view: v }),
      setUser: (u) => {
        const current = get().user || DEFAULT_USER;
        const next = { ...current, ...u };
        set({ user: next, onboarded: true, view: 'dashboard', currency: (next.currency as CurrencyCode), language: (next.language as LangCode) });
      },

      // ─── Config ────────────────────────────────────────────────────────
      setCurrency: (c) => { set({ currency: c }); if (get().user) set((s) => ({ user: { ...s.user!, currency: c } })); },
      setLanguage: (l) => { set({ language: l }); if (get().user) set((s) => ({ user: { ...s.user!, language: l } })); },
      setAppMode: (m) => { set({ appMode: m }); if (get().user) set((s) => ({ user: { ...s.user!, mode: m } })); },
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      setAndyTalking: (v) => set({ andyTalking: v }),
      completeTutorial: () => set({ tutorialComplete: true }),

      // ─── Debt ──────────────────────────────────────────────────────────
      addDebt: (d) => set((s) => ({ debts: [...s.debts, { ...d, id: String(Date.now()) }] })),
      removeDebt: (id) => set((s) => ({ debts: s.debts.filter(d => d.id !== id) })),
      makePayment: (debtId, amount) => {
        const debt = get().debts.find(d => d.id === debtId);
        if (!debt) return;
        const newBalance = Math.max(0, debt.balance - amount);
        const entry: HistoryEntry = { id: String(Date.now()), type: 'payment', amount, label: `Payment → ${debt.name}`, ts: Date.now() };
        const win: MicroWin = { id: String(Date.now()), amount, debt: debt.name, timestamp: Date.now() };
        set((s) => ({
          debts: s.debts.map(d => d.id === debtId ? { ...d, balance: newBalance } : d),
          history: [entry, ...s.history],
          microWins: [win, ...s.microWins],
          streak: s.streak + 1,
        }));
      },
      crushDay: () => {
        const { debts, dailyTarget, makePayment } = get();
        const highestApr = [...debts].sort((a, b) => b.apr - a.apr)[0];
        if (highestApr) makePayment(highestApr.id, dailyTarget);
      },
      toggleOstrich: () => set((s) => ({ ostriched: !s.ostriched })),

      // ─── FIRE ──────────────────────────────────────────────────────────
      updateFire: (age, monthly, targetAge) => set({ currentAge: age, fireMonthly: monthly, fireTargetAge: targetAge }),

      // ─── Market fetch ──────────────────────────────────────────────────
      fetchMarket: async () => {
        const { lastFetch, marketLoading } = get();
        if (marketLoading || Date.now() - lastFetch < 60_000) return;
        set({ marketLoading: true });
        try {
          const syms = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN', 'GOOGL', 'META', 'NFLX'];
          const results = await Promise.all(syms.map(async sym => {
            try {
              const r = await fetch(`/api/market?symbol=${sym}`);
              if (!r.ok) throw new Error();
              return [sym, (await r.json()).data];
            } catch { return [sym, MOCK_MARKET[sym]]; }
          }));
          let crypto = MOCK_CRYPTO;
          try {
            const cr = await fetch('/api/crypto?ids=bitcoin,ethereum,solana,ripple');
            if (cr.ok) crypto = (await cr.json()).data;
          } catch {}
          set({ market: Object.fromEntries(results), crypto, marketLoading: false, lastFetch: Date.now() });
        } catch {
          set({ market: MOCK_MARKET, crypto: MOCK_CRYPTO, marketLoading: false, lastFetch: Date.now() });
        }
      },

      fetchWeather: async () => {
        try {
          const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6&longitude=77.2&current_weather=true');
          const d = await r.json();
          const cond = d.current_weather?.weathercode;
          const condMap: Record<number, string> = { 0: '☀️ Clear', 1: '🌤 Mostly Clear', 2: '⛅ Partly Cloudy', 3: '☁️ Overcast', 61: '🌧 Rain', 80: '🌦 Showers' };
          set({ weather: { temp: Math.round(d.current_weather?.temperature || 28), condition: condMap[cond] || '🌡 Live', city: 'New Delhi' } });
        } catch {
          set({ weather: { temp: 28, condition: '☀️ Clear', city: 'Your City' } });
        }
      },

      // ─── Andy AI chat ──────────────────────────────────────────────────
      sendChat: async (msg, geminiKey = '') => {
        const userMsg: ChatMessage = { role: 'user', text: msg, ts: Date.now() };
        set(s => ({ chatMessages: [...s.chatMessages, userMsg], chatLoading: true }));
        const finish = (text: string) => {
          set(s => ({ chatMessages: [...s.chatMessages, { role: 'andy', text, ts: Date.now() }], chatLoading: false }));
          get().andySpeak(text.replace(/[\*\#]/g, '')); // remove markdown for speech
        };

        const key = geminiKey || 'ac8ce05ba9ab3479b568fd3e29f558f12434db5d4282a2770c391ca08c666414';
        try {
          const { user, debts, currency } = get();
          const totalDebt = debts.reduce((a, d) => a + d.balance, 0);
          const ctx = `User: ${user?.name || 'Commander'}, Income $${user?.monthlyIncome || 5000}/mo, ${debts.length} debts totaling $${totalDebt.toLocaleString()}, Currency: ${currency}, Mode: ${get().appMode} mode.`;
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: `You are Andy AI, an expert CFO/financial advisor in ${LANGUAGES[get().language]?.label || 'English'}. Context: ${ctx}\n\nUser: ${msg}\n\nRespond in 2-3 sentences max, be specific and actionable. Respond in ${LANGUAGES[get().language]?.label || 'English'}.` }] }] }) }
          );
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          finish(text || AI_RESPONSES[0]);
        } catch {
          await new Promise(r => setTimeout(r, 600));
          finish(AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]);
        }
      },

      // ─── Document scan ─────────────────────────────────────────────────
      scanDocument: async (base64, geminiKey = '') => {
        set({ scanLoading: true, scannedDoc: null });
        const key = geminiKey || 'ac8ce05ba9ab3479b568fd3e29f558f12434db5d4282a2770c391ca08c666414';
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: 'You are a financial document analyzer. Extract and summarize: amounts, dates, account names, debts owed, interest rates, payment due dates. Format as bullet points.' },
                    { inline_data: { mime_type: 'image/jpeg', data: base64 } }
                  ]
                }]
              })
            }
          );
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not extract data from document.';
          set({ scannedDoc: text, scanLoading: false });
        } catch {
          set({ scannedDoc: '• Could not process document. Please try a clearer image.\n• Supported: bank statements, loan letters, credit card bills.', scanLoading: false });
        }
      },

      clearData: () => set({ user: null, onboarded: false, view: 'intro', activePage: 'home', history: [], microWins: [], streak: 0 }),
    }),
    {
      name: 'anchor-ai-v5',
      partialize: (s) => ({
        user: s.user, onboarded: s.onboarded, debts: s.debts, history: s.history,
        microWins: s.microWins, streak: s.streak, dailyTarget: s.dailyTarget,
        fireTarget: s.fireTarget, fireMonthly: s.fireMonthly, fireTargetAge: s.fireTargetAge,
        currentAge: s.currentAge, chatMessages: s.chatMessages, currency: s.currency,
        language: s.language, appMode: s.appMode, tutorialComplete: s.tutorialComplete,
        ostriched: s.ostriched, firstGreetingDone: s.firstGreetingDone
      }),
    }
  )
);
