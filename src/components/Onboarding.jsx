/* ═══════════════════════════════════════════════════════════════
   ONBOARDING FLOW
═══════════════════════════════════════════════════════════════ */
import { useState } from "react";
import { I } from './Icons';
import { INCOME_CATS, EXPENSE_CATS } from '../utils/constants';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [bal,  setBal]  = useState("");
  const allCats = [...new Set([...INCOME_CATS, ...EXPENSE_CATS])];
  const [sel, setSel]   = useState(["Ingredients", "Gas", "Sales"]);
  const tog = (c) => setSel(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const S = {
    wrap:   { minHeight:"100%", display:"flex", flexDirection:"column", padding:"28px 20px 20px" },
    logo:   { display:"flex", flexDirection:"column", alignItems:"center", marginBottom:28 },
    shield: { width:52, height:52, borderRadius:16, background:"#1565c0", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:10, boxShadow:"0 6px 20px rgba(21,101,192,.35)" },
    title:  { fontSize:20, fontWeight:800, color:"#1e40af", letterSpacing:"-0.3px" },
    sub:    { fontSize:12, color:"#94a3b8", marginTop:3, textAlign:"center", lineHeight:1.5 },
    bar:    (active) => ({ height:5, flex:1, borderRadius:99, background: active ? "#1565c0" : "#e2e8f0", transition:"background .3s" }),
    eyebrow:{ fontSize:10, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 },
    h2:     { fontSize:18, fontWeight:800, color:"#1e293b", marginBottom:4 },
    p:      { fontSize:13, color:"#94a3b8", marginBottom:20 },
    input:  { width:"100%", border:"2px solid #f1f5f9", borderRadius:12, padding:"12px 16px", fontSize:14, outline:"none", background:"#f8fafc", fontFamily:"inherit", transition:"border .2s", boxSizing:"border-box" },
    chip:   (a) => ({ padding:"6px 14px", borderRadius:99, fontSize:12, fontWeight:600, border:`2px solid ${a ? "#1565c0" : "#e2e8f0"}`, background: a ? "#1565c0" : "#fff", color: a ? "#fff" : "#64748b", cursor:"pointer", transition:"all .15s" }),
    btn:    (ok) => ({ width:"100%", padding:"14px", borderRadius:12, fontWeight:700, fontSize:14, border:"none", cursor: ok ? "pointer" : "not-allowed", background: ok ? "#1565c0" : "#e2e8f0", color: ok ? "#fff" : "#94a3b8", transition:"all .2s", marginTop:16 }),
    back:   { background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:0, display:"flex", marginBottom:12 },
  };

  return (
    <div style={S.wrap}>
      <div style={S.logo}>
        <div style={S.shield}><I.Shield style={{ width:26, height:26, fill:"white" }} /></div>
        <div style={S.title}>Fintech</div>
        <div style={S.sub}>Modern cashflow management<br />for your business.</div>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:24 }}>
        {[1,2,3].map(i => <div key={i} style={S.bar(i <= step)} />)}
      </div>

      {step === 1 && (
        <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
          <div style={S.eyebrow}>Step 1 of 3</div>
          <div style={S.h2}>What's your stall called?</div>
          <div style={S.p}>We'll use this to personalise your dashboard.</div>
          <input style={S.input} placeholder="e.g. Warung Mak Jah" value={name} onChange={e => setName(e.target.value)}
            onFocus={e => e.target.style.borderColor="#1565c0"} onBlur={e => e.target.style.borderColor="#f1f5f9"} autoFocus />
          <div style={{ flex:1 }} />
          <button style={S.btn(name.trim())} disabled={!name.trim()} onClick={() => setStep(2)}>Next →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
          <button style={S.back} onClick={() => setStep(1)}><I.Back style={{ width:20, height:20 }} /></button>
          <div style={S.eyebrow}>Step 2 of 3</div>
          <div style={S.h2}>How much cash do you have?</div>
          <div style={S.p}>Enter your current cash — this is your starting balance.</div>
          <div style={{ display:"flex", alignItems:"center", border:"2px solid #f1f5f9", borderRadius:12, padding:"12px 16px", background:"#f8fafc" }}>
            <span style={{ color:"#94a3b8", fontWeight:700, marginRight:8, fontSize:14 }}>RM</span>
            <input style={{ flex:1, border:"none", background:"transparent", fontSize:14, fontWeight:700, outline:"none", fontFamily:"inherit" }}
              type="number" inputMode="decimal" placeholder="0.00" value={bal} onChange={e => setBal(e.target.value)} autoFocus />
          </div>
          <div style={{ fontSize:11, color:"#94a3b8", marginTop:6 }}>You can update this anytime in Settings.</div>
          <div style={{ flex:1 }} />
          <button style={S.btn(bal)} disabled={!bal} onClick={() => setStep(3)}>Next →</button>
        </div>
      )}

      {step === 3 && (
        <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
          <button style={S.back} onClick={() => setStep(2)}><I.Back style={{ width:20, height:20 }} /></button>
          <div style={S.eyebrow}>Step 3 of 3</div>
          <div style={S.h2}>What do you spend on?</div>
          <div style={S.p}>Pick your common categories.</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
            {allCats.map(c => <button key={c} style={S.chip(sel.includes(c))} onClick={() => tog(c)}>{c}</button>)}
          </div>
          <div style={{ flex:1 }} />
          <button style={S.btn(true)} onClick={() => onComplete(name.trim(), parseFloat(bal) || 0)}>Start tracking →</button>
        </div>
      )}
    </div>
  );
}
