// @ts-nocheck
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

export function Onboarding() {
  const { setUser, addDebt } = useStore();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: '', email: '', currency: 'USD', monthlyIncome: '', monthlyExpenses: '' });
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', apr: '', minPayment: '' });
  const [localDebts, setLocalDebts] = useState<any[]>([]);

  const handleProfileNext = () => {
    if (!profile.name || !profile.monthlyIncome) return;
    setStep(1);
  };

  const addLocalDebt = () => {
    if (!newDebt.name || !newDebt.balance) return;
    setLocalDebts(prev => [...prev, { ...newDebt, id: Date.now() }]);
    setNewDebt({ name: '', balance: '', apr: '', minPayment: '' });
  };

  const handleFinish = () => {
    localDebts.forEach(d => addDebt({ name: d.name, balance: +d.balance, apr: +(d.apr || 0), minPayment: +(d.minPayment || 0) }));
    setUser({ name: profile.name, email: profile.email, currency: profile.currency, monthlyIncome: +profile.monthlyIncome, monthlyExpenses: +profile.monthlyExpenses });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020209]">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#0088ff] flex items-center justify-center">
            <Anchor className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold">ANCHOR AI</p>
            <p className="text-white/40 text-xs font-mono">Step {step + 1} of 2</p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1 bg-white/5 rounded-full mb-8">
          <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#0088ff] rounded-full transition-all duration-700"
            style={{ width: step === 0 ? '50%' : '100%' }} />
        </div>

        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <h2 className="text-3xl font-black text-white mb-6">Your Financial Profile</h2>
            {[
              { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Alex Johnson' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'alex@example.com' },
              { label: 'Monthly Income ($) *', key: 'monthlyIncome', type: 'number', placeholder: '6000' },
              { label: 'Monthly Expenses ($)', key: 'monthlyExpenses', type: 'number', placeholder: '3500' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-white/60 text-sm mb-1">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={profile[field.key]}
                  onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/25 focus:outline-none focus:border-[#00ff88]/50 border border-white/10 focus:border-opacity-100 transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-white/60 text-sm mb-1">Currency</label>
              <select
                value={profile.currency}
                onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl glass text-white border border-white/10 focus:outline-none focus:border-[#00ff88]/50 bg-transparent"
              >
                {CURRENCIES.map(c => <option key={c} className="bg-gray-900">{c}</option>)}
              </select>
            </div>
            <button
              onClick={handleProfileNext}
              disabled={!profile.name || !profile.monthlyIncome}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#0088ff] text-black font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-40 hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] transition-shadow"
            >
              Next: Add Debts <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-3xl font-black text-white mb-2">Debt Targets</h2>
            <p className="text-white/50 text-sm mb-6">Add your debts to begin the annihilation protocol. Skip to use our defaults.</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Debt Name', key: 'name', placeholder: 'Credit Card' },
                { label: 'Balance ($)', key: 'balance', placeholder: '5200' },
                { label: 'APR (%)', key: 'apr', placeholder: '18.99' },
                { label: 'Min Payment ($)', key: 'minPayment', placeholder: '200' },
              ].map(f => (
                <input
                  key={f.key}
                  placeholder={f.label}
                  value={newDebt[f.key]}
                  onChange={e => setNewDebt(p => ({ ...p, [f.key]: e.target.value }))}
                  className="px-3 py-2.5 rounded-lg glass text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:border-[#00ff88]/40"
                />
              ))}
            </div>
            <button onClick={addLocalDebt} className="flex items-center gap-2 text-sm text-[#00ff88] hover:text-white transition-colors font-semibold">
              <Plus className="w-4 h-4" /> Add Debt
            </button>

            {localDebts.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                {localDebts.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg glass border border-white/5 text-sm">
                    <span className="text-white font-medium">{d.name}</span>
                    <span className="text-red-400 font-bold">${Number(d.balance).toLocaleString()}</span>
                    <button onClick={() => setLocalDebts(prev => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4 text-white/30 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:border-white/30 transition-colors">
                Back
              </button>
              <button onClick={handleFinish} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#0088ff] text-black font-bold hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] transition-shadow">
                Launch Dashboard →
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
