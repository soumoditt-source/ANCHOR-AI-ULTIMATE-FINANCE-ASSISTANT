// @ts-nocheck
// pages/Services.tsx — Enterprise AI Services: OCR scanner + 8 advisory modules
import { memo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt, FileText, Flame, Heart, Baby, Calculator,
  Users, BarChart2, CreditCard, FileHeart, Upload, X, Bot
} from 'lucide-react';
import { useStore } from '../store/useStore';

const MODULES = [
  { Icon: Flame,      label: 'FIRE Path Planner',     desc: 'Financial Independence',     page: 'planner' as const, color: '#22d3ee' },
  { Icon: Heart,      label: 'Money Health Score',     desc: '6-Dimension Audit',          page: 'kpis' as const,    color: '#00ff88' },
  { Icon: Baby,       label: 'Life Event Advisor',     desc: 'Marriage, Baby, Bonus',      page: 'andy' as const,    q: 'Guide me through financial planning for a major life event like marriage or a baby.',   color: '#f59e0b' },
  { Icon: Calculator, label: 'Tax Wizard',            desc: 'Regime Optimization',         page: 'andy' as const,    q: 'Help me optimize my taxes. Explain old vs new tax regime and which suits me better.',    color: '#a855f7' },
  { Icon: Users,      label: "Couple's Planner",      desc: 'Joint Financial Goals',       page: 'andy' as const,    q: 'Help me and my partner plan joint finances, shared goals, and emergency fund.',           color: '#f0abfc' },
  { Icon: BarChart2,  label: 'MF Portfolio X-Ray',    desc: 'Overlap & Rebalancing',       page: 'andy' as const,    q: 'Analyze my mutual fund portfolio for overlaps and suggest how to rebalance.',             color: '#06b6d4' },
  { Icon: CreditCard, label: 'Loan Management',       desc: 'Debt Payoff Strategy',        page: 'warroom' as const, color: '#ef4444' },
  { Icon: FileHeart,  label: 'Will Creation',         desc: 'Estate & Legacy',             page: 'andy' as const,    q: 'Guide me on estate planning, writing a will, and legacy protection basics in India.',      color: '#8b5cf6' },
];

export const Services = memo(function Services() {
  const navigate = useStore((s) => s.navigate);
  const sendChat = useStore((s) => s.sendChat);
  const scanDocument = useStore((s) => s.scanDocument);
  const scannedDoc = useStore((s) => s.scannedDoc);
  const scanLoading = useStore((s) => s.scanLoading);

  const receiptRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{ type: 'receipt' | 'doc'; content: string } | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'receipt' | 'doc') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string)?.split(',')[1];
      if (base64) {
        await scanDocument(base64);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleModule = (m: typeof MODULES[0]) => {
    if (m.q) {
      navigate('andy');
      setTimeout(() => sendChat(m.q!), 400);
    } else {
      navigate(m.page);
    }
  };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">AI Services</h1>
        <p className="text-[10px] text-white/30 font-mono uppercase mt-0.5">Enterprise-Grade Financial Intelligence</p>
      </div>

      {/* Scan result */}
      <AnimatePresence>
        {(scanLoading || scannedDoc) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <p className="text-xs font-bold text-blue-300">Document Analysis Result</p>
              </div>
              <button onClick={() => {}} className="text-white/20 hover:text-white/50"><X className="w-3.5 h-3.5" /></button>
            </div>
            {scanLoading
              ? <div className="flex items-center gap-2 text-white/40 text-sm"><div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> Analyzing document with Gemini Vision...</div>
              : <pre className="text-xs text-white/60 whitespace-pre-wrap leading-relaxed">{scannedDoc}</pre>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scanners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { Icon: Receipt, title: 'Receipt Scanner', sub: 'Optical Expense Audit', desc: 'Upload a receipt. Andy uses Computer Vision to extract data and categorize the expense instantly.', ref: receiptRef, type: 'receipt' as const, color: '#00ff88' },
          { Icon: FileText, title: 'Document Analysis', sub: 'Financial Deep Scan', desc: 'Upload any financial document (tax form, bank statement, contract). Andy will extract key insights.', ref: docRef, type: 'doc' as const, color: '#22d3ee' },
        ].map(s => (
          <div key={s.title} className="glass rounded-2xl p-5 border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + '15' }}>
                <s.Icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{s.title}</p>
                <p className="text-[10px] text-white/30">{s.sub}</p>
              </div>
            </div>
            <p className="text-xs text-white/40 mb-4 leading-relaxed">{s.desc}</p>
            <motion.button onClick={() => s.ref.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all"
              style={{ borderColor: s.color + '30', color: s.color, background: s.color + '08' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Upload className="w-3.5 h-3.5" /> Upload {s.title.split(' ')[0]}
            </motion.button>
            <input ref={s.ref} type="file" accept="image/*,application/pdf" className="hidden"
              onChange={e => handleFile(e, s.type)} />
          </div>
        ))}
      </div>

      {/* Advisory modules */}
      <div>
        <p className="text-[10px] text-white/30 font-mono uppercase mb-3">Advisory Modules</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MODULES.map(m => (
            <motion.button key={m.label} onClick={() => handleModule(m)}
              className="glass rounded-2xl p-4 text-left border border-white/[0.05] hover:border-white/10 transition-all"
              whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: m.color + '15' }}>
                <m.Icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <p className="font-bold text-white text-xs">{m.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{m.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
});
