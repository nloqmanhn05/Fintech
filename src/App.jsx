/* ═══════════════════════════════════════════════════════════════
   APP ROOT — Assembles all components
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";
import { I } from './components/Icons';
import { genId } from './utils/helpers';
import { WARN_STREAK } from './utils/constants';
import { SEED } from './utils/seedData';
import { useLs } from './hooks/useLs';
import { useWarningEngine } from './hooks/useWarningEngine';

import Shell from './components/Shell';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Settings from './components/Settings';
import AddModal from './components/AddModal';
import CriticalWarning from './components/CriticalWarning';
import Onboarding from './components/Onboarding';

export default function App() {
  const [onboarded, setOnboarded] = useLs("cf5_ob",   false);
  const [name,      setName]      = useLs("cf5_name", "");
  const [bal,       setBal]       = useLs("cf5_bal",  0);
  const [txns,      setTxns]      = useLs("cf5_txns", SEED);
  const [tab,       setTab]       = useState("dashboard");
  const [modal,     setModal]     = useState(null);

  // warning state
  const [warnAck,   setWarnAck]   = useLs("cf5_warn", null);
  const [showWarn,  setShowWarn]  = useState(false);
  const [showBanner,setShowBanner]= useState(false);
  const warnData = useWarningEngine(txns);

  useEffect(() => {
    if (!warnData.streakActive) { setShowBanner(false); setShowWarn(false); return; }
    if (warnAck) {
      const daysSince = Math.floor((Date.now() - warnAck) / 86400000);
      if (daysSince >= WARN_STREAK) { setShowWarn(true); setShowBanner(false); }
      else { setShowBanner(true); setShowWarn(false); }
    } else { setShowWarn(true); setShowBanner(false); }
  }, [warnData.streakActive, warnAck]);

  if (!onboarded) return (
    <Shell>
      <Onboarding onComplete={(n, b) => { setName(n); setBal(b); setOnboarded(true); }} />
    </Shell>
  );

  const add    = (t) => setTxns(p => [{ ...t, id: genId() }, ...p]);
  const edit   = (t) => setTxns(p => p.map(x => x.id === t.id ? t : x));
  const del    = (id) => setTxns(p => p.filter(x => x.id !== id));
  const ack    = () => { setWarnAck(Date.now()); setShowWarn(false); setShowBanner(true); };
  const review = () => { setWarnAck(null); setShowWarn(true); setShowBanner(false); };

  return (
    <Shell>
      {showBanner && warnData.streakActive && (
        <div onClick={review} style={{ background:"#fef2f2", borderLeft:"3px solid #c62828", padding:"10px 14px", display:"flex", alignItems:"center", gap:8, cursor:"pointer", flexShrink:0, zIndex:15 }}>
          <I.Warn style={{ width:14, height:14, color:"#c62828", flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <span style={{ fontSize:12, fontWeight:700, color:"#991b1b" }}>Budget warning active</span>
            <span style={{ fontSize:11, color:"#b91c1c" }}> — {warnData.pct}% ratio · tap to review</span>
          </div>
          <I.Chevron style={{ width:14, height:14, color:"#c62828" }} />
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto", overscrollBehavior:"contain", paddingBottom:80 }}>
        {tab === "dashboard"    && <Dashboard txns={txns} name={name} bal={bal} onAdd={() => setModal("add")} onSeeAll={() => setTab("transactions")} warnBanner={false} onBannerClick={review} />}
        {tab === "transactions" && <Transactions txns={txns} bal={bal} onAdd={() => setModal("add")} onEdit={t => setModal(t)} onDel={del} />}
        {tab === "reports"      && <Reports txns={txns} bal={bal} />}
        {tab === "settings"     && <Settings name={name} bal={bal} txns={txns} onName={setName} onBal={setBal} onReset={() => { setTxns([]); setBal(0); setWarnAck(null); }} />}
      </div>

      <BottomNav active={tab} onChange={setTab} />

      {/* Floating Action Button (FAB) for Transactions */}
      {tab === "transactions" && (
        <button 
          onClick={() => setModal("add")}
          className="absolute bottom-28 right-6 w-16 h-16 bg-[#1565C0] text-white rounded-full shadow-2xl shadow-[#1565C0]/40 flex items-center justify-center active:scale-90 transition-all z-[60] hover:bg-[#004d99]"
        >
          <span className="material-symbols-outlined text-3xl font-bold">add</span>
        </button>
      )}

      {modal !== null && (
        <AddModal initial={modal === "add" ? null : modal}
          onSave={t => { modal === "add" ? add(t) : edit(t); setModal(null); }}
          onClose={() => setModal(null)} />
      )}

      {showWarn && <CriticalWarning data={warnData} onAcknowledge={ack} />}
    </Shell>
  );
}
