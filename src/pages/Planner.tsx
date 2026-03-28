// @ts-nocheck
// pages/Planner.tsx — Core Financial Planner for ET Hackathon Additions
import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Bot, Target, Calculator, FileText, Heart, Upload, CheckCircle, Users, ScanSearch } from 'lucide-react';
import { useStore, formatMoney } from '../store/useStore';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// ─── FIRE Math ────────────────────────────────────────────────────────────────
function calcCorpus(monthly: number, years: number, rate: number, existing: number): number {
  if (years <= 0) return existing;
  const r = rate / 100 / 12;
  const n = years * 12;
  return existing * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
}

// ─── Tax Regime India ────────────────────────────────────────────────────────
function calcOldRegimeTax(income: number, deductions: number): number {
  const taxable = Math.max(0, income - deductions);
  let tax = 0;
  if (taxable <= 250000) tax = 0;
  else if (taxable <= 500000) tax = (taxable - 250000) * 0.05;
  else if (taxable <= 750000) tax = 12500 + (taxable - 500000) * 0.10;
  else if (taxable <= 1000000) tax = 37500 + (taxable - 750000) * 0.15;
  else if (taxable <= 1250000) tax = 75000 + (taxable - 1000000) * 0.20;
  else if (taxable <= 1500000) tax = 125000 + (taxable - 1250000) * 0.25;
  else tax = 187500 + (taxable - 1500000) * 0.30;
  return Math.round(tax * 1.04); // +4% cess
}

function calcNewRegimeTax(income: number): number {
  const taxable = Math.max(0, income - 75000); // standard deduction new regime
  let tax = 0;
  if (taxable <= 300000) tax = 0;
  else if (taxable <= 600000) tax = (taxable - 300000) * 0.05;
  else if (taxable <= 900000) tax = 15000 + (taxable - 600000) * 0.10;
  else if (taxable <= 1200000) tax = 45000 + (taxable - 900000) * 0.15;
  else if (taxable <= 1500000) tax = 90000 + (taxable - 1200000) * 0.20;
  else tax = 150000 + (taxable - 1500000) * 0.30;
  return Math.round(tax * 1.04);
}

// ─── Life Events ─────────────────────────────────────────────────────────────
const LIFE_EVENTS = [
  { id: 'bonus', icon: '💰', label: 'Received Bonus', prompt: 'I got a bonus of ₹{amount}. I am in the {tax} tax bracket, have {debt} debt, and want to {goal}. How should I optimally allocate this bonus across debt payoff, investment, emergency fund, and tax saving?' },
  { id: 'baby', icon: '👶', label: 'New Baby', prompt: 'I am expecting a baby. My monthly income is ₹{amount}. Guide me on: child insurance, Sukanya Samriddhi Yojana, SIP for education corpus, HRA optimization, and increasing emergency fund.' },
  { id: 'marriage', icon: '💍', label: 'Marriage', prompt: 'I am getting married. My income is ₹{amount}/month, partner earns ₹{partner}. Help me plan: joint vs separate accounts, HRA optimization, NPS matching, combined insurance, joint SIP strategy.' },
  { id: 'inheritance', icon: '🏛️', label: 'Inheritance', prompt: 'I received ₹{amount} as inheritance/windfall. Tax implications in India? Should I pay off debt? Invest in equity/debt? ELSS for tax saving? Index funds? Real estate? Give me a 12-month plan.' },
  { id: 'job_loss', icon: '⚡', label: 'Job Loss', prompt: 'I lost my job. Monthly expenses are ₹{amount}. Emergency fund: ₹{emergency}. Debts: ₹{debt}. How do I survive 6-12 months financially while job hunting? EPFO withdrawal rules? NPS partial withdrawal?' },
  { id: 'home', icon: '🏠', label: 'Buying Home', prompt: 'I want to buy a home worth ₹{amount}. Income: ₹{income}/month. Down payment: ₹{down}. Give me: home loan EMI planning, 80C/24b tax deductions, rent vs buy analysis, and impact on my FIRE timeline.' },
];

// ─── Tab Components ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'fire', Icon: Rocket, label: 'FIRE' },
  { id: 'tax', Icon: Calculator, label: 'Tax Wizard' },
  { id: 'couple', Icon: Users, label: 'Couples' },
  { id: 'xray', Icon: ScanSearch, label: 'MF X-Ray' },
  { id: 'life', Icon: Heart, label: 'Events' },
];

export const Planner = memo(function Planner() {
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const currency = useStore((s) => s.currency);
  const user = useStore((s) => s.user);

  const [tab, setTab] = useState<'fire' | 'tax' | 'couple' | 'xray' | 'life'>('fire');

  // ─── FIRE state ─────────────────────────────────────────────────────
  const [fireParams, setFireParams] = useState({
    currentAge: user?.monthlyIncome ? 30 : 30,
    retireAge: 45, monthlyExpenses: 80000,
    existing: 0, sip: 20000, returnRate: 12,
  });
  const setFP = useCallback((k: string) => (v: number) => setFireParams(p => ({ ...p, [k]: v })), []);
  const yearsToFire = Math.max(0, fireParams.retireAge - fireParams.currentAge);
  const fireTarget = fireParams.monthlyExpenses * 12 * 25;
  const projected = Math.round(calcCorpus(fireParams.sip, yearsToFire, fireParams.returnRate, fireParams.existing));
  const onTrack = projected >= fireTarget;
  const trajectory = Array.from({ length: 7 }, (_, i) => {
    const yr = (yearsToFire / 6) * i;
    return { age: Math.round(fireParams.currentAge + yr), val: Math.round(calcCorpus(fireParams.sip, yr, fireParams.returnRate, fireParams.existing)) };
  });
  const maxVal = Math.max(projected, fireTarget, 1);

  const generateRoadmap = () => {
    navigate('andy');
    setTimeout(() => sendChat(
      `My FIRE plan: Age ${fireParams.currentAge}, retire at ${fireParams.retireAge}. Monthly expenses: ₹${fireParams.monthlyExpenses.toLocaleString()}. Monthly SIP: ₹${fireParams.sip.toLocaleString()}. Existing assets: ₹${fireParams.existing.toLocaleString()}. Return: ${fireParams.returnRate}%. FIRE target (25×): ₹${(fireTarget/100000).toFixed(0)}L. Projected: ₹${(projected/100000).toFixed(0)}L. Status: ${onTrack ? 'ON TRACK' : 'BEHIND'}. Give me a detailed month-by-month actionable roadmap. Include: SIP fund recommendations, asset allocation at each age milestone, tax saving moves (80C, NPS, ELSS), insurance gaps to fix, and emergency fund target.`
    ), 400);
  };

  // ─── Tax state ──────────────────────────────────────────────────────
  const [taxParams, setTaxParams] = useState({
    annualIncome: 1200000, sec80c: 150000,
    nps: 50000, hra: 120000, mediclaim: 25000, homeLoan: 0, others: 0,
  });
  const setTP = (k: string) => (val: number) => setTaxParams(p => ({ ...p, [k]: val }));
  const totalDeductions = taxParams.sec80c + taxParams.nps + taxParams.hra + taxParams.mediclaim + taxParams.homeLoan + taxParams.others + 50000; // standard
  const oldTax = calcOldRegimeTax(taxParams.annualIncome, totalDeductions);
  const newTax = calcNewRegimeTax(taxParams.annualIncome);
  const taxSaving = oldTax - newTax;
  const bestRegime = taxSaving > 0 ? 'New' : 'Old';
  const taxSavingAbs = Math.abs(taxSaving);

  const [taxFile, setTaxFile] = useState<string | null>(null);
  const [taxAnalysis, setTaxAnalysis] = useState('');
  const [taxLoading, setTaxLoading] = useState(false);

  const analyzeTaxDoc = useCallback(async (base64: string) => {
    setTaxLoading(true);
    try {
      const key = GEMINI_KEY;
      // @ts-ignore
      if (!key && window.puter) {
        setTaxLoading(false);
        setTaxAnalysis('⚠️ Form 16 Vision requires Gemini Flash 1.5. Add VITE_GEMINI_API_KEY inside .env.');
        return;
      }
      if (!key) { setTaxAnalysis('Add VITE_GEMINI_API_KEY to enable Form 16 AI analysis.'); setTaxLoading(false); return; }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [
            { text: 'You are a CA-level Indian tax expert. Analyze this Form 16 or salary slip. Extract: gross income, all deductions claimed vs available, tax paid. Then: 1) Identify every missed deduction opportunity (80C, 80D, NPS, HRA, LTA). 2) Compare old vs new tax regime with exact numbers. 3) Suggest top 3 immediate tax-saving actions. Format clearly with ₹ figures.' },
            { inline_data: { mime_type: 'image/jpeg', data: base64 } }
          ]}]})
        }
      );
      const data = await res.json();
      setTaxAnalysis(data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not analyze document.');
    } catch { setTaxAnalysis('Error analyzing document. Please check your API key.'); }
    setTaxLoading(false);
  }, []);

  const handleTaxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      setTaxFile(file.name);
      analyzeTaxDoc(base64);
    };
    reader.readAsDataURL(file);
  };

  const askTaxWizard = () => {
    navigate('andy');
    setTimeout(() => sendChat(
      `Tax Wizard analysis: Annual income ₹${(taxParams.annualIncome/100000).toFixed(1)}L. Deductions: 80C ₹${taxParams.sec80c/1000}K, NPS ₹${taxParams.nps/1000}K, HRA ₹${taxParams.hra/1000}K, Mediclaim ₹${taxParams.mediclaim/1000}K. Old regime tax: ₹${oldTax.toLocaleString()}. New regime tax: ₹${newTax.toLocaleString()}. Best: ${bestRegime} regime saves ₹${taxSavingAbs.toLocaleString()}. Give me a complete tax optimization strategy for FY2024-25 including missing deductions I should be claiming.`
    ), 400);
  };

  // ─── Couple's Planner state ──────────────────────────────────────────
  const [coupleParams, setCoupleParams] = useState({
    income1: 1500000, income2: 1200000, 
    hra1: 200000, hra2: 150000,
    nps1: 50000, nps2: 50000,
    jointSip: 50000
  });
  const setCP = (k: string) => (val: number) => setCoupleParams(p => ({ ...p, [k]: val }));
  
  const askCouplesPlanner = () => {
    navigate('andy');
    setTimeout(() => sendChat(
      `Couple's Planner: Partner 1 makes ₹${coupleParams.income1.toLocaleString()}/yr, HRA ₹${coupleParams.hra1.toLocaleString()}, NPS ₹${coupleParams.nps1.toLocaleString()}. Partner 2 makes ₹${coupleParams.income2.toLocaleString()}/yr, HRA ₹${coupleParams.hra2.toLocaleString()}, NPS ₹${coupleParams.nps2.toLocaleString()}. Joint SIP: ₹${coupleParams.jointSip.toLocaleString()}/mo. Give us a combined tax optimization strategy: who should claim HRA? How should we split the SIP? What joint insurance do we need?`
    ), 400);
  };

  // ─── MF X-Ray state ────────────────────────────────────────────────
  const [mfFile, setMfFile] = useState<string | null>(null);
  const [mfAnalysis, setMfAnalysis] = useState('');
  const [mfLoading, setMfLoading] = useState(false);

  const analyzeMfDoc = useCallback(async (base64: string) => {
    setMfLoading(true);
    try {
      const key = GEMINI_KEY;
      // @ts-ignore
      if (!key && window.puter) {
        setMfLoading(false);
        setMfAnalysis('⚠️ CAMS Document Vision requires Gemini Flash 1.5. Add VITE_GEMINI_API_KEY inside .env.');
        return;
      }
      if (!key) { setMfAnalysis('Add VITE_GEMINI_API_KEY to enable CAMS AI analysis.'); setMfLoading(false); return; }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [
            { text: "You are an expert Indian Mutual Fund analyst. Analyze this CAMS/KFintech statement. 1) Estimate true XIRR and asset allocation. 2) Identify any overlapping funds (e.g., too many large caps). 3) Point out high expense ratio drag. 4) Give a strict AI-generated rebalancing plan." },
            { inline_data: { mime_type: 'image/jpeg', data: base64 } }
          ]}]})
        }
      );
      const data = await res.json();
      setMfAnalysis(data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not analyze document.');
    } catch { setMfAnalysis('Error analyzing document. Please check your API key.'); }
    setMfLoading(false);
  }, []);

  const handleMfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = (ev.target?.result as string).split(',')[1];
      setMfFile(file.name);
      analyzeMfDoc(base64);
    };
    reader.readAsDataURL(file);
  };

  // ─── Life Event state ────────────────────────────────────────────────
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventAmount, setEventAmount] = useState('');
  const [eventExtra, setEventExtra] = useState('');

  const askLifeEvent = () => {
    const ev = LIFE_EVENTS.find(e => e.id === selectedEvent);
    if (!ev) return;
    const filled = ev.prompt
      .replace('{amount}', eventAmount || '0')
      .replace('{tax}', '20-30%')
      .replace('{debt}', 'some')
      .replace('{goal}', eventExtra || 'grow wealth')
      .replace('{partner}', eventExtra || '50000')
      .replace('{emergency}', eventExtra || '3 months')
      .replace('{income}', eventAmount || '100000')
      .replace('{down}', eventExtra || '20%');
    navigate('andy');
    setTimeout(() => sendChat(filled), 400);
  };

  const FIRE_SLIDERS = [
    { k: 'currentAge', label: 'Current Age', min: 18, max: 60, step: 1, fmt: (v: number) => `${v} yrs` },
    { k: 'retireAge', label: 'Target Retirement Age', min: 30, max: 75, step: 1, fmt: (v: number) => `${v} yrs` },
    { k: 'monthlyExpenses', label: 'Monthly Expenses', min: 10000, max: 500000, step: 5000, fmt: (v: number) => `₹${v.toLocaleString()}` },
    { k: 'existing', label: 'Current Invested Assets', min: 0, max: 10000000, step: 50000, fmt: (v: number) => `₹${(v/100000).toFixed(1)}L` },
    { k: 'sip', label: 'Monthly SIP Investment', min: 500, max: 200000, step: 500, fmt: (v: number) => `₹${v.toLocaleString()}` },
    { k: 'returnRate', label: 'Expected Return (CAGR)', min: 6, max: 20, step: 0.5, fmt: (v: number) => `${v}%` },
  ];

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Financial Planner</h1>
        <p className="text-[10px] text-white/30 font-mono uppercase mt-0.5">FIRE · Tax · Couples · MF X-Ray</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 overflow-x-auto scroller-hide touch-manipulation">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${tab === t.id ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/20' : 'text-white/30 hover:text-white/60'}`}>
            <t.Icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ─── FIRE TAB ─────────────────────────────────────── */}
        {tab === 'fire' && (
          <motion.div key="fire" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/30 font-mono uppercase">FIRE Target (25× Rule)</p>
                <p className="text-2xl font-black text-[#00ff88]">₹{(fireTarget/100000).toFixed(0)}L</p>
                <p className="text-[10px] text-white/30">{yearsToFire} years to achieve</p>
              </div>
              <div className={`px-3 py-2 rounded-xl text-sm font-black border ${onTrack ? 'bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88]' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {onTrack ? '✅ ON TRACK' : '⚠️ BEHIND'}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 space-y-4">
              <p className="text-[10px] text-white/30 font-mono uppercase">Simulation Parameters</p>
              {FIRE_SLIDERS.map(s => (
                <div key={s.k}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/50 text-xs">{s.label}</span>
                    <span className="text-[#00ff88] font-black text-xs">{s.fmt((fireParams as any)[s.k])}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={s.step} value={(fireParams as any)[s.k]}
                    onChange={e => setFP(s.k)(+e.target.value)} className="w-full accent-[#00ff88]" />
                </div>
              ))}
            </div>

            {/* Trajectory chart */}
            <div className="glass rounded-2xl p-4">
              <p className="text-sm font-bold text-white mb-3">Wealth Trajectory</p>
              <div className="flex items-end gap-1 h-28 mb-2 relative">
                <div className="absolute left-0 right-0" style={{ bottom: `${(fireTarget / maxVal) * 112}px` }}>
                  <div className="border-t border-dashed border-amber-400/40">
                    <span className="text-[9px] text-amber-400/60 absolute -top-3 right-0">FIRE</span>
                  </div>
                </div>
                {trajectory.map((pt, i) => {
                  const h = Math.max(4, Math.round((pt.val / maxVal) * 112));
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <motion.div className="w-full rounded-t"
                        initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: i * 0.1, duration: 0.6 }}
                        title={`₹${(pt.val/100000).toFixed(0)}L at age ${pt.age}`}
                        style={{ background: pt.val >= fireTarget ? '#00ff88' : '#0088ff', borderRadius: '3px 3px 0 0', height: h }} />
                      <span className="text-[8px] text-white/25">{pt.age}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4">
                <p className="text-[10px] text-white/30 mb-1">Projected at {fireParams.retireAge}</p>
                <p className="text-xl font-black text-[#00ff88]">₹{(projected/100000).toFixed(0)}L</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-[10px] text-white/30 mb-1">Monthly SIP Needed</p>
                <p className="text-xl font-black text-[#22d3ee]">₹{Math.round(fireTarget * (fireParams.returnRate/100/12) / (Math.pow(1 + fireParams.returnRate/100/12, yearsToFire * 12) - 1)).toLocaleString()}</p>
              </div>
            </div>

            <motion.button onClick={generateRoadmap} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-black"
              style={{ background: 'linear-gradient(135deg, #00ff88, #0088ff)' }}>
              <Bot className="w-4 h-4" />
              Generate AI Month-by-Month Roadmap →
            </motion.button>
          </motion.div>
        )}

        {/* ─── TAX WIZARD TAB ───────────────────────────────── */}
        {tab === 'tax' && (
          <motion.div key="tax" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            {/* Old vs New regime result */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Old Regime Tax', val: oldTax, color: oldTax < newTax ? '#00ff88' : '#ef4444', best: oldTax < newTax },
                { label: 'New Regime Tax', val: newTax, color: newTax < oldTax ? '#00ff88' : '#ef4444', best: newTax < oldTax },
              ].map(r => (
                <div key={r.label} className={`glass rounded-2xl p-4 border ${r.best ? 'border-[#00ff88]/30' : 'border-white/[0.05]'}`}>
                  <p className="text-[10px] text-white/30 mb-1">{r.label}</p>
                  <p className="text-xl font-black" style={{ color: r.color }}>₹{r.val.toLocaleString()}</p>
                  {r.best && <p className="text-[9px] text-[#00ff88] font-mono mt-1">✓ BETTER FOR YOU</p>}
                </div>
              ))}
            </div>

            <div className="glass rounded-xl p-3 border border-amber-400/20 bg-amber-400/[0.04]">
              <p className="text-xs font-bold text-amber-400">
                {bestRegime} Regime saves you ₹{taxSavingAbs.toLocaleString()}/year
                {taxSavingAbs > 0 && ` — that's ₹${Math.round(taxSavingAbs/12).toLocaleString()}/month back in your pocket`}
              </p>
            </div>

            {/* Sliders */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <p className="text-[10px] text-white/30 font-mono uppercase">Income & Deductions (₹)</p>
              {[
                { k: 'annualIncome', label: 'Annual CTC / Income', max: 5000000 },
                { k: 'sec80c', label: '80C (PPF, ELSS, LIC etc.)', max: 150000 },
                { k: 'nps', label: '80CCD(1B) NPS Contribution', max: 50000 },
                { k: 'hra', label: 'HRA Exemption', max: 500000 },
                { k: 'mediclaim', label: '80D Mediclaim Premium', max: 50000 },
                { k: 'homeLoan', label: '24(b) Home Loan Interest', max: 200000 },
              ].map(s => (
                <div key={s.k}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-white/40">{s.label}</span>
                    <span className="text-[10px] text-[#00ff88] font-black">₹{((taxParams as any)[s.k]/1000).toFixed(0)}K</span>
                  </div>
                  <input type="range" min={0} max={s.max} step={1000} value={(taxParams as any)[s.k]}
                    onChange={e => setTP(s.k)(+e.target.value)} className="w-full accent-[#00ff88]" />
                </div>
              ))}
            </div>

            {/* Form 16 Upload */}
            <div className="glass rounded-2xl p-4 border border-dashed border-white/10">
              <p className="text-[10px] text-white/30 font-mono uppercase mb-2">Upload Form 16 / Salary Slip — AI Analysis</p>
              <label className="flex flex-col items-center justify-center gap-2 py-6 cursor-pointer">
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleTaxUpload} />
                {taxFile ? (
                  <div className="flex items-center gap-2 text-[#00ff88]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">{taxFile}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-white/20" />
                    <p className="text-xs text-white/30">Drop Form 16, salary slip, or AIS here</p>
                    <p className="text-[10px] text-white/20">JPG, PNG, PDF supported</p>
                  </>
                )}
              </label>
              {taxLoading && (
                <div className="flex items-center gap-2 text-[#00ff88] text-xs mt-2">
                  <motion.div className="w-3 h-3 border-2 border-[#00ff88] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
                  Gemini Vision analyzing your document...
                </div>
              )}
              {taxAnalysis && !taxLoading && (
                <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-[10px] text-[#00ff88]/60 font-mono mb-2">AI Tax Analysis</p>
                  <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">{taxAnalysis}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <motion.button onClick={askTaxWizard} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-black"
                style={{ background: 'linear-gradient(135deg, #00ff88, #22d3ee)' }}>
                <Bot className="w-4 h-4" /> Deep AI Tax Strategy
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── COUPLE'S PLANNER TAB ───────────────────────── */}
        {tab === 'couple' && (
          <motion.div key="couple" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <div className="glass rounded-xl p-3 border border-amber-400/20 bg-amber-400/[0.04]">
              <p className="text-xs font-bold text-amber-400">
                India's first AI-powered joint financial planning tool. Optimize across both incomes for massive tax savings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-[#00ff88]">Partner 1</p>
                {[
                  { k: 'income1', label: 'Income', max: 5000000 },
                  { k: 'hra1', label: 'HRA', max: 500000 },
                  { k: 'nps1', label: 'NPS', max: 50000 },
                ].map(s => (
                  <div key={s.k}>
                    <p className="text-[9px] text-white/40">{s.label}: ₹{((coupleParams as any)[s.k]/1000).toFixed(0)}K</p>
                    <input type="range" min={0} max={s.max} step={1000} value={(coupleParams as any)[s.k]}
                      onChange={e => setCP(s.k)(+e.target.value)} className="w-full accent-[#00ff88]" />
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-[#22d3ee]">Partner 2</p>
                {[
                  { k: 'income2', label: 'Income', max: 5000000 },
                  { k: 'hra2', label: 'HRA', max: 500000 },
                  { k: 'nps2', label: 'NPS', max: 50000 },
                ].map(s => (
                  <div key={s.k}>
                    <p className="text-[9px] text-white/40">{s.label}: ₹{((coupleParams as any)[s.k]/1000).toFixed(0)}K</p>
                    <input type="range" min={0} max={s.max} step={1000} value={(coupleParams as any)[s.k]}
                      onChange={e => setCP(s.k)(+e.target.value)} className="w-full accent-[#22d3ee]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
               <p className="text-[10px] text-white/40">Joint Monthly SIP Investment: ₹{(coupleParams.jointSip/1000).toFixed(0)}K</p>
               <input type="range" min={5000} max={500000} step={5000} value={coupleParams.jointSip}
                  onChange={e => setCP('jointSip')(+e.target.value)} className="w-full mt-2 accent-white" />
            </div>

            <motion.button onClick={askCouplesPlanner} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-black"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              <Bot className="w-4 h-4 text-white" />
              <span className="text-white">Generate Joint Tax & SIP Strategy</span>
            </motion.button>
          </motion.div>
        )}

        {/* ─── MF X-RAY TAB ─────────────────────────────────── */}
        {tab === 'xray' && (
          <motion.div key="xray" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
             <div className="glass rounded-xl p-3 border border-amber-400/20 bg-amber-400/[0.04]">
              <p className="text-xs font-bold text-amber-400">
                Upload your CAMS / KFintech statement. Andy AI will analyze overlap, expense ratio drag, and true XIRR in 10 seconds.
              </p>
            </div>

            <div className="glass rounded-2xl p-4 border border-dashed border-white/10">
              <label className="flex flex-col items-center justify-center gap-2 py-6 cursor-pointer">
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleMfUpload} />
                {mfFile ? (
                  <div className="flex items-center gap-2 text-[#22d3ee]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-bold">{mfFile}</span>
                  </div>
                ) : (
                  <>
                    <ScanSearch className="w-8 h-8 text-white/20" />
                    <p className="text-xs text-white/30 text-center">Drop Mutual Fund Portfolio (CAMS pdf / image) here</p>
                  </>
                )}
              </label>
              {mfLoading && (
                <div className="flex items-center gap-2 text-[#22d3ee] text-xs mt-2">
                  <motion.div className="w-3 h-3 border-2 border-[#22d3ee] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
                  Processing Portfolio Overlap & XIRR...
                </div>
              )}
              {mfAnalysis && !mfLoading && (
                <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <p className="text-[10px] text-[#22d3ee]/60 font-mono mb-2">MF Portfolio X-Ray Results</p>
                  <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">{mfAnalysis}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── LIFE EVENTS TAB ──────────────────────────────── */}
        {tab === 'life' && (
          <motion.div key="life" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
            <p className="text-xs text-white/40">Select your life event and Andy AI will give you a personalized action plan.</p>
            <div className="grid grid-cols-2 gap-2">
              {LIFE_EVENTS.map(ev => (
                <motion.button key={ev.id} onClick={() => setSelectedEvent(selectedEvent === ev.id ? null : ev.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${selectedEvent === ev.id ? 'border-[#00ff88]/40 bg-[#00ff88]/10' : 'glass border-white/[0.06] hover:border-white/10'}`}
                  whileTap={{ scale: 0.97 }}>
                  <div className="text-2xl mb-1">{ev.icon}</div>
                  <p className="text-xs font-bold text-white">{ev.label}</p>
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {selectedEvent && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-3">
                  {(() => {
                    const ev = LIFE_EVENTS.find(e => e.id === selectedEvent)!;
                    return (
                      <>
                        <div className="glass rounded-2xl p-4">
                          <p className="text-[10px] text-white/30 mb-2">{ev.icon} {ev.label} — Key Figure (₹)</p>
                          <input type="number" placeholder="e.g. 500000"
                            value={eventAmount} onChange={e => setEventAmount(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl glass border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00ff88]/30 mb-3" />
                          <p className="text-[10px] text-white/30 mb-2">Additional context (optional)</p>
                          <input type="text"
                            placeholder={selectedEvent === 'marriage' ? "Partner's monthly income" : selectedEvent === 'home' ? 'Down payment amount' : 'Your goal or risk tolerance'}
                            value={eventExtra} onChange={e => setEventExtra(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl glass border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00ff88]/30" />
                        </div>
                        <motion.button onClick={askLifeEvent} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm text-black"
                          style={{ background: 'linear-gradient(135deg, #00ff88, #22d3ee)' }}>
                          <Bot className="w-4 h-4 text-black" />
                          <span className="text-black">Get My {ev.label} Plan</span>
                        </motion.button>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
