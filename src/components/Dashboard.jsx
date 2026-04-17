/* ═══════════════════════════════════════════════════════════════
   DASHBOARD — 'Simulation Center' Premium Design
   ═══════════════════════════════════════════════════════════════ */
import { fmtRM } from '../utils/helpers';
import { useCalcs } from '../hooks/useCalcs';

const AVATAR_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuB1uSFPkUzqIlA-d-2bPE_eax_IbbSj_UOv8ccnSQVTejoooOf753M4a6OR71O4BXHgy2PPZVdkKF3R-zZHRlEebL_WklSIOt1X2PeXCPB6OfGeIp9T-on9XkLPZry8YbY0XfEQVXgJJpeqwViVm3QWpBv--wTRbSEfOI7gLgwBhYzz4QN51lgPoIL_eMzruOsZarg-DUZqH5QqKWu-aWAlqkdUqMDWjFed_dze4FnuTr8vIljC5PtI8MU4g4oApk7Emca5_ljEfrI";

export default function Dashboard({ txns, bal, name, onAdd, onEdit, onSeeAll }) {
  const calcs = useCalcs(txns, bal);
  const { daysLeft, balance, totalIncome, totalExpense } = calcs;
  const dd = Math.min(Math.max(0, daysLeft), 999);

  return (
    <div className="bg-[#fdf8fa] text-[#1c1b1d] min-h-screen pb-44 selection:bg-[#1565C0]/10">
      
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-50 bg-[#fdf8fa]/80 backdrop-blur-xl flex justify-between items-center px-4 py-4">
        <div className="flex items-center gap-3">
          <h1 className="font-headline tracking-tight text-xl font-bold text-[#1c1b1d]">{name || "Warung Mak Jah"}</h1>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#1565C0] hover:bg-blue-50 transition-all active:scale-90">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 pt-6 pb-8 space-y-6">
        
        {/* Hero: Cash Runway */}
        <section className="relative overflow-hidden bg-[#1565c0] rounded-[2.5rem] p-9 text-white shadow-xl shadow-[#1565c0]/20 group transition-all duration-500">
          <div className="relative z-10 space-y-2">
            <p className="font-label text-xs uppercase tracking-[0.2em] font-bold opacity-80 uppercase">Estimated Runway</p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-7xl font-extrabold tracking-tighter">{dd} Days</span>
            </div>
            <div className="pt-6">
              <span className="text-[13px] font-bold bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                Monday, 27 Oct
              </span>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#004d99] via-transparent to-transparent opacity-40"></div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
        </section>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#f7f2f4] rounded-[1.75rem] p-6 space-y-3 hover:bg-[#ece7e9] transition-all cursor-default">
            <div className="flex items-center gap-2 text-[#004d99]">
              <span className="material-symbols-outlined text-sm font-bold">arrow_downward</span>
              <span className="font-label text-[10px] font-extrabold uppercase tracking-widest opacity-70">Income</span>
            </div>
            <p className="font-headline text-2xl font-extrabold text-[#1c1b1d] leading-none">{fmtRM(totalIncome)}</p>
            <div className="text-[10px] font-extrabold text-[#004d99] px-3 py-1 bg-[#1565c0]/10 rounded-full w-fit">
              +12% Today
            </div>
          </div>
          
          <div className="bg-[#f7f2f4] rounded-[1.75rem] p-6 space-y-3 hover:bg-[#ece7e9] transition-all cursor-default">
            <div className="flex items-center gap-2 text-[#424752]">
              <span className="material-symbols-outlined text-sm font-bold">arrow_upward</span>
              <span className="font-label text-[10px] font-extrabold uppercase tracking-widest opacity-70">Expense</span>
            </div>
            <p className="font-headline text-2xl font-extrabold text-[#1c1b1d] leading-none">{fmtRM(totalExpense)}</p>
            <div className="text-[10px] font-extrabold text-[#424752] px-3 py-1 bg-[#e6e1e3] rounded-full w-fit">
              Within Budget
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-headline text-xl font-bold tracking-tight text-[#1c1b1d]">Recent Transactions</h2>
            <button 
              onClick={onSeeAll}
              className="text-[#004d99] text-sm font-bold uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              See All
            </button>
          </div>
          
          <div className="space-y-6">
            {txns.slice(0, 5).map((txn, idx) => (
              <div 
                key={txn.id || idx} 
                onClick={() => onEdit && onEdit(txn)}
                className="flex items-center justify-between group cursor-pointer active:scale-95 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
                    txn.type === 'income' ? 'bg-[#1565c0]/5 text-[#1565c0]' : 'bg-[#e6e1e3] text-[#424752]'
                  }`}>
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {txn.type === 'income' ? 'payments' : (txn.category?.toLowerCase().includes('food') || txn.category?.toLowerCase().includes('produce') ? 'shopping_cart' : 'restaurant')}
                    </span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-[#1c1b1d] leading-tight">{txn.note || txn.category}</p>
                    <p className="text-[11px] text-[#424752]/60 font-semibold uppercase tracking-wider mt-0.5">
                      {idx === 0 ? 'Today' : (idx === 1 ? 'Yesterday' : 'Recent')} • 09:45 AM
                    </p>
                  </div>
                </div>
                <p className={`font-headline font-bold text-[17px] tracking-tight ${txn.type === 'income' ? 'text-[#004d99]' : 'text-[#ba1a1a]'}`}>
                  {txn.type === 'income' ? '+ ' : '- '}{fmtRM(txn.amount)}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
