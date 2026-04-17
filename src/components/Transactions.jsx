/* ═══════════════════════════════════════════════════════════════
   TRANSACTIONS PAGE — Refined 'Net Balance' Design
   ═══════════════════════════════════════════════════════════════ */
import { useState } from "react";
import TxnRow from './TxnRow';
import { fmtRM, fmtDate } from '../utils/helpers';
import { useCalcs } from '../hooks/useCalcs';

export default function Transactions({ txns, bal, onAdd, onEdit, onDel }) {
  const [filter, setFilter] = useState("all");

  const filtered = txns.filter(t => {
    if (filter === "income") return t.type === "income";
    if (filter === "expense") return t.type === "expense";
    return true; // "all"
  });

  const calcs = useCalcs(txns, bal);

  const groups = filtered.reduce((acc, t) => {
    (acc[t.date] = acc[t.date] || []).push(t);
    return acc;
  }, {});

  const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const chips = ["All Time", "Income", "Expenses", "Recurring"];

  const getDateLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return `Yesterday, ${fmtDate(dateStr, { month: 'short', day: 'numeric' })}`;
    return fmtDate(dateStr, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-[#fdf8fa] text-[#1c1b1d] min-h-screen pb-44 selection:bg-[#d6e3ff]">
      
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-50 bg-[#fdf8fa]/80 backdrop-blur-xl">
        <div className="flex justify-between items-center px-4 py-4 w-full">
          <div className="flex items-center gap-4">
            <button className="hover:bg-[#f2ecee]/50 p-2 rounded-full transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined text-[#1565C0]">menu</span>
            </button>
            <h1 className="font-headline tracking-tight text-3xl font-bold text-[#1c1b1d]">Transactions</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="hover:bg-[#f2ecee]/50 p-2 rounded-full transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined text-[#1565C0]">filter_list</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-6 px-4 max-w-3xl mx-auto">
        
        {/* Summary Card: Net Balance */}
        <section className="mb-10">
          <div className="bg-white rounded-xl p-8 shadow-[0_-8px_40px_-10px_rgba(28,27,29,0.04)] border border-[#c2c6d4]/10">
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#424752] mb-3 opacity-60">Current Net Balance</span>
              <div className="text-5xl font-extrabold tracking-tighter text-[#001b3d] mb-4">
                {fmtRM(calcs.balance)}
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-[#d6e3ff]/30 rounded-full">
                <span className="material-symbols-outlined text-sm text-[#004d99]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                <span className="text-[11px] font-bold text-[#004d99] tracking-tight">+4.2% from last month</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-8 scrollbar-hide no-scrollbar -mx-2 px-2">
          {chips.map(c => {
            const lowC = c.toLowerCase().includes('expense') ? 'expense' : c.toLowerCase();
            const isActive = (filter === "all" && c === "All Time") || (filter === lowC);
            return (
              <button
                key={c}
                onClick={() => setFilter(c === "All Time" ? "all" : lowC)}
                className={`whitespace-nowrap px-7 py-3 rounded-full font-bold text-sm transition-all ${
                  isActive 
                    ? "bg-[#1565C0] text-white shadow-lg shadow-[#1565C0]/20" 
                    : "bg-[#ece7e9] text-[#424752] hover:bg-[#e6e1e3]"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Transaction List Grouped by Day */}
        <div className="space-y-6">
          {dates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <span className="material-symbols-outlined text-5xl mb-4">history</span>
              <p className="font-bold tracking-widest uppercase text-xs">No Records Yet</p>
            </div>
          ) : (
            dates.map(date => (
              <div key={date}>
                <div className="sticky top-20 z-10 py-3 mb-6 bg-[#fdf8fa]/80 backdrop-blur-sm">
                  <h2 className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#424752]/60 flex items-center gap-4">
                    {getDateLabel(date)}
                    <span className="h-[1px] flex-grow bg-[#c2c6d4]/20"></span>
                  </h2>
                </div>
                <div className="space-y-1">
                  {groups[date].map(txn => (
                    <TxnRow key={txn.id} txn={txn} onEdit={onEdit} layout="premium" />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
