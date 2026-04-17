/* ═══════════════════════════════════════════════════════════════
   REPORTS PAGE — Refactored to Modern Premium Design
   ═══════════════════════════════════════════════════════════════ */
import { useState } from "react";
import { fmtRM } from '../utils/helpers';
import { useCalcs } from '../hooks/useCalcs';

export default function Reports({ txns, bal }) {
  const [period, setPeriod] = useState("week");
  const { daysLeft, totalIncome, bizExpense, realProfit, totalExpense } = useCalcs(txns, bal);
  const dd = Math.min(Math.max(0, daysLeft), 999);

  // Chart data for last 7 days
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    const inc = txns.filter(t => t.date === ds && t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = txns.filter(t => t.date === ds && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const label = d.toLocaleDateString("en-MY", { weekday: "short" }).slice(0, 3);
    return { label, inc, exp };
  });

  const maxBar = Math.max(...days7.flatMap(d => [d.inc, d.exp]), 1);

  // Category breakdown
  const expCats = txns.filter(t => t.type === "expense" && !t.isPersonal).reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const sortedCats = Object.entries(expCats).sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCats[0]?.[1] || 1;

  return (
    <div className="bg-surface text-on-surface min-h-full pb-8">
      {/* Top App Bar */}
      <nav className="bg-surface/80 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center w-full px-4 py-4">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface">menu</span>
        </div>
        <h1 className="text-lg font-bold text-on-surface font-headline tracking-tight">Reports</h1>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface">calendar_today</span>
        </div>
      </nav>

      <main className="px-4 space-y-6 mt-4 max-w-2xl mx-auto">
        {/* Period Selector */}
        <section>
          <div className="flex p-1 bg-surface-container rounded-full w-full">
            <button 
              onClick={() => setPeriod("week")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${period === "week" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            >
              This week
            </button>
            <button 
              onClick={() => setPeriod("month")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${period === "month" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            >
              This month
            </button>
            <button 
              onClick={() => setPeriod("last")}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${period === "last" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant"}`}
            >
              Last month
            </button>
          </div>
        </section>

        {/* Forecast Card */}
        <section className="bg-primary-container text-on-primary-container p-8 rounded-xl relative overflow-hidden shadow-lg shadow-primary-container/20">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider font-label">Cash forecast</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-6xl font-bold tracking-tighter">{dd > 99 ? "99+" : dd} days</span>
            </div>
            <p className="mt-2 text-lg font-medium">at current spending rate</p>
            <div className="mt-8 flex items-center gap-2 text-sm opacity-70">
              <span className="material-symbols-outlined text-base">info</span>
              <span>Based on last 7 days average</span>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </section>

        {/* Bar Chart Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold tracking-tight font-headline">Income vs expenses</h2>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-primary-container"></span>
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-outline-variant"></span>
                <span>Expense</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-low p-6 rounded-lg h-64 flex flex-col justify-between">
            <div className="flex-1 flex items-end justify-around gap-2 mb-4">
              {days7.map((day, idx) => (
                <div key={idx} className="flex items-end gap-1 h-full w-full max-w-[40px]">
                  <div 
                    className="bg-primary-container w-1/2 rounded-t-sm transition-all duration-500" 
                    style={{ height: `${(day.inc / maxBar) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-outline-variant w-1/2 rounded-t-sm transition-all duration-500" 
                    style={{ height: `${(day.exp / maxBar) * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-around text-[10px] font-bold text-on-surface-variant/60 uppercase">
              {days7.map(day => <span key={day.label}>{day.label}</span>)}
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold tracking-tight font-headline">Expense breakdown</h2>
          <div className="space-y-6">
            {sortedCats.length > 0 ? sortedCats.slice(0, 5).map(([cat, amt]) => (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-on-surface">{cat}</span>
                  <span className="text-on-surface">{fmtRM(amt)}</span>
                </div>
                <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-container rounded-full transition-all duration-700" 
                    style={{ width: `${(amt / maxCat) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <p className="text-center text-on-surface-variant py-4">No business expenses yet.</p>
            )}
          </div>
        </section>

        {/* Profit Card */}
        <section className="bg-surface-container-highest p-8 rounded-lg space-y-4 shadow-inner">
          <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant font-label">Real business profit</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium">Total income</span>
              <span className="text-on-surface font-semibold">{fmtRM(totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium">Business expenses</span>
              <span className="text-on-surface font-semibold">{fmtRM(bizExpense)}</span>
            </div>
            <div className="pt-4 mt-2 flex justify-between items-center">
              <span className="text-lg font-bold font-headline">Net profit</span>
              <span className={`text-2xl font-extrabold ${realProfit >= 0 ? "text-[#2e7d32]" : "text-error"}`}>
                {fmtRM(realProfit)}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
