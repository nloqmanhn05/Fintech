/* ═══════════════════════════════════════════════════════════════
   SETTINGS PAGE — Refined Minimalist Design
   ═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { fmtRM } from '../utils/helpers';
import { useCalcs } from '../hooks/useCalcs';
import { exportCSV, exportTXT } from '../utils/exportUtils';
import { I } from './Icons';

export default function Settings({ name, bal, txns, onName, onBal, onReset }) {
  const [editN, setEditN] = useState(false);
  const [editB, setEditB] = useState(false);
  const [nv, setNv] = useState(name);
  const [bv, setBv] = useState(String(bal));
  const [confirm, setConfirm] = useState(false);
  const calcs = useCalcs(txns, bal);

  // Sync props to local edit state
  useEffect(() => { setNv(name); }, [name]);
  useEffect(() => { setBv(String(bal)); }, [bal]);

  return (
    <div className="bg-[#fdf8fa] text-[#1c1b1d] min-h-screen pb-40 font-body selection:bg-[#d6e3ff]">
      
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-50 bg-[#fdf8fa]/80 backdrop-blur-md">
        <div className="flex items-center justify-center px-4 py-6 w-full max-w-xl mx-auto">
          <h1 className="font-headline text-2xl font-extrabold tracking-tight text-[#1c1b1d]">Settings</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 pt-10 pb-20 space-y-6">
        
        {/* Profile Info Section */}
        <section>
          <div className="space-y-2 mb-10">
            {editN ? (
              <div className="flex items-center justify-between gap-3 w-full animate-in fade-in duration-300">
                <input 
                  className="flex-1 min-w-0 h-11 px-3 py-1.5 bg-white border-[1.5px] border-[#c2c6d4] rounded-lg font-body text-base text-[#1c1b1d] focus:outline-none focus:border-[#2e7d32] transition-colors placeholder-[#1c1b1d]/30"
                  value={nv} 
                  onChange={e => setNv(e.target.value)}
                  autoFocus
                  placeholder="Enter shop name"
                />
                <button 
                  onClick={() => { onName(nv); setEditN(false); }} 
                  className="w-11 h-11 bg-[#2e7d32] text-white rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center shrink-0"
                  title="Save Name"
                >
                  <I.Check className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setEditN(true)}
                className="group flex items-center justify-between cursor-pointer"
              >
                <h2 className="font-headline text-4xl font-bold tracking-tighter text-[#1c1b1d] group-hover:text-[#2e7d32] transition-colors">
                  {name || "Warung Mak Jah"}
                </h2>
                <span className="material-symbols-outlined text-[#727783] group-hover:text-[#2e7d32] transition-all opacity-40 group-hover:opacity-100">edit</span>
              </div>
            )}
          </div>
        </section>

        {/* Financials Section */}
        <section className="space-y-8">
          <h3 className="font-headline text-2xl font-bold tracking-tight text-[#1c1b1d]">Financials</h3>
          <div className="space-y-[2px] overflow-hidden rounded-xl">
            <div className="flex items-center justify-between p-6 bg-[#f7f2f4]">
              <span className="text-[#424752] font-medium">Opening balance</span>
              {editB ? (
                <div className="flex items-center gap-2">
                   <input 
                    type="number"
                    className="bg-white/50 border-none rounded px-2 py-1 font-headline font-bold text-right outline-none w-24"
                    value={bv}
                    onChange={e => setBv(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => { onBal(parseFloat(bv) || 0); setEditB(false); }} className="text-[#004d99] font-bold text-[10px] uppercase">Save</button>
                </div>
              ) : (
                <span 
                  onClick={() => setEditB(true)}
                  className="font-headline font-bold text-[#1c1b1d] cursor-pointer"
                >
                  {fmtRM(bal)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between p-6 bg-[#f7f2f4]">
              <span className="text-[#424752] font-medium">Total transactions</span>
              <span className="font-headline font-bold text-[#1c1b1d]">{txns.length}</span>
            </div>
            <div className="flex items-center justify-between p-6 bg-[#1565c0]/5 border-t border-[#1565c0]/10">
              <span className="text-[#004d99] font-bold">Current balance</span>
              <span className="font-headline font-extrabold text-[#004d99] text-xl">{fmtRM(calcs.balance)}</span>
            </div>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-4">
          <h3 className="font-headline text-2xl font-bold tracking-tight text-[#1c1b1d]">Preferences</h3>
          <div className="flex items-center justify-between p-6 bg-[#f7f2f4] rounded-xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#727783] text-[20px]">language</span>
              <span className="text-[#424752] font-medium">Language</span>
            </div>
            <span className="text-[#1c1b1d] font-bold">English (US)</span>
          </div>
        </section>

        {/* Export Section */}
        <section className="space-y-4">
          <h3 className="font-headline text-2xl font-bold tracking-tight text-[#1c1b1d]">Data Exports</h3>
          <div className="divide-y divide-[#e6e1e3]/20">
            <button 
              onClick={() => exportCSV(txns, name)}
              className="w-full flex items-center justify-between py-8 group transition-all"
            >
              <span className="text-lg font-semibold text-[#1c1b1d] group-hover:text-[#004d99] transition-colors">Spreadsheet (CSV)</span>
              <div className="px-4 py-2 bg-[#f2ecee] rounded-lg text-[#727783] group-hover:bg-[#004d99] group-hover:text-white transition-all flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase">Download</span>
                <span className="material-symbols-outlined text-[16px]">download</span>
              </div>
            </button>
            <button 
              onClick={() => exportTXT(txns, name, calcs)}
              className="w-full flex items-center justify-between py-8 group transition-all"
            >
              <span className="text-lg font-semibold text-[#1c1b1d] group-hover:text-[#004d99] transition-colors">Full Report (TXT)</span>
              <div className="px-4 py-2 bg-[#f2ecee] rounded-lg text-[#727783] group-hover:bg-[#004d99] group-hover:text-white transition-all flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase">Download</span>
                <span className="material-symbols-outlined text-[16px]">download</span>
              </div>
            </button>
          </div>
        </section>

        {/* Maintenance Section */}
        <section className="space-y-8">
          <h3 className="font-headline text-2xl font-bold tracking-tight text-[#ba1a1a]">Danger Zone</h3>
          <div className="p-8 bg-[#ba1a1a]/5 rounded-xl border border-[#ba1a1a]/10">
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="text-lg font-bold text-[#ba1a1a]">Wipe All Records</h4>
                <p className="text-sm text-[#ba1a1a]/70 font-medium">Permanently deletes all transaction history and balance data from this device.</p>
              </div>
              
              {confirm ? (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => { onReset(); setConfirm(false); }}
                    className="w-full py-4 bg-[#ba1a1a] text-white font-bold rounded-lg tracking-wide shadow-lg shadow-[#ba1a1a]/20"
                  >
                    CONFIRM DELETE
                  </button>
                  <button onClick={() => setConfirm(false)} className="text-[#ba1a1a] font-bold text-sm">Cancel</button>
                </div>
              ) : (
                <button 
                  onClick={() => setConfirm(true)}
                  className="w-full py-4 bg-[#ba1a1a] text-white font-bold rounded-lg tracking-wide hover:bg-[#ba1a1a]/90 active:scale-[0.98] transition-all"
                >
                  Reset Database
                </button>
              )}
            </div>
          </div>
        </section>

        {/* System Info Section */}
        <section className="pt-12 border-t border-[#e6e1e3]/20 flex justify-center text-center">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#727783] font-bold">Software Version</span>
            <p className="text-[#1c1b1d] font-semibold text-sm">1.0.0 Stable</p>
          </div>
        </section>
      </main>
    </div>
  );
}
