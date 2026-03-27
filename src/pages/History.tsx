// @ts-nocheck
// pages/History.tsx — Transaction history and micro-win log
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, Trash2, ArrowUpRight, Plus } from 'lucide-react';
import { useStore, formatMoney } from '../store/useStore';

export const History = memo(function History() {
  const history = useStore((s) => s.history);
  const microWins = useStore((s) => s.microWins);
  const streak = useStore((s) => s.streak);
  const currency = useStore((s) => s.currency);
  const navigate = useStore((s) => s.navigate);

  const totalPaid = history.filter(h => h.type === 'payment').reduce((a, h) => a + h.amount, 0);

  const TYPE_COLOR: Record<string, string> = {
    payment: '#00ff88', income: '#22d3ee', expense: '#ef4444', win: '#f59e0b',
  };
  const TYPE_ICON: Record<string, string> = {
    payment: '⚔️', income: '💰', expense: '🔻', win: '🏆',
  };

  return (
    <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-black text-white">History</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-white/[0.08]">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-black text-[#00ff88]">{streak} day streak</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Paid Off', val: formatMoney(totalPaid, currency), color: '#00ff88' },
          { label: 'Micro-Wins', val: `${microWins.length}`, color: '#f59e0b' },
          { label: 'Streak', val: `${streak} days`, color: '#a855f7' },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-3 sm:p-4">
            <p className="text-[10px] text-white/30 mb-1">{s.label}</p>
            <p className="text-lg sm:text-2xl font-black" style={{ color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Micro-wins streak */}
      {microWins.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-bold text-white">Micro-Win Hall of Fame</p>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {microWins.map(w => (
              <div key={w.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏆</span>
                  <span className="text-sm text-white/60">{w.debt}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#00ff88]">+{formatMoney(w.amount, currency)}</span>
                  <p className="text-[9px] text-white/20">{new Date(w.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="glass rounded-2xl p-4">
        <p className="text-[10px] text-white/30 font-mono uppercase mb-3">Transaction Log</p>
        <AnimatePresence>
          {history.length === 0 ? (
            <div className="py-10 text-center">
              <Clock className="w-8 h-8 text-white/10 mx-auto mb-3" />
              <p className="text-white/25 text-sm">No transactions yet.</p>
              <button onClick={() => navigate('warroom')}
                className="mt-3 text-xs text-[#00ff88]/50 hover:text-[#00ff88] flex items-center gap-1 mx-auto">
                <Plus className="w-3 h-3" /> Go to War Room to make a payment
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{TYPE_ICON[h.type] || '📌'}</span>
                    <div>
                      <p className="text-sm text-white/70">{h.label}</p>
                      <p className="text-[10px] text-white/25">{new Date(h.ts).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black" style={{ color: TYPE_COLOR[h.type] || '#fff' }}>
                    {h.type === 'expense' ? '-' : '+'}{formatMoney(h.amount, currency)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
