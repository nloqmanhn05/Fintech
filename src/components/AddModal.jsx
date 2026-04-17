/* ═══════════════════════════════════════════════════════════════
   ADD / EDIT TRANSACTION MODAL
═══════════════════════════════════════════════════════════════ */
import { useState } from "react";
import { INCOME_CATS, EXPENSE_CATS } from '../utils/constants';
import { todayStr } from '../utils/helpers';

export default function AddModal({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [type,     setType]     = useState(initial?.type || "income");
  const [amt,      setAmt]      = useState(initial ? String(initial.amount) : "");
  const [cat,      setCat]      = useState(initial?.category || "");
  const [note,     setNote]     = useState(initial?.note || "");
  const [date,     setDate]     = useState(initial?.date || todayStr());
  const [personal, setPersonal] = useState(initial?.isPersonal || false);
  const cats  = type === "income" ? INCOME_CATS : EXPENSE_CATS;
  const valid = amt && parseFloat(amt) > 0 && cat;

  const save = () => {
    if (!valid) return;
    onSave({ ...(initial || {}), type, amount: parseFloat(amt), category: cat, note, date, isPersonal: personal });
  };

  return (
    <div style={{ position:"absolute", inset:0, zIndex:30, display:"flex", flexDirection:"column", justifyContent:"flex-end", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(2px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      
      <div style={{ 
        background:"#fff", 
        borderRadius:"24px 24px 0 0", 
        maxHeight:"calc(100% - 80px)", 
        display:"flex", 
        flexDirection:"column",
        overflow:"hidden"
      }}>
        {/* Section 1: Fixed Header */}
        <div style={{ padding:"16px 18px 0" }}>
          <div style={{ width:36, height:4, background:"#e2e8f0", borderRadius:99, margin:"0 auto 14px" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#1e293b" }}>{isEdit ? "Edit transaction" : "Add transaction"}</div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:20, lineHeight:1, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
        </div>

        {/* Section 2: Fixed Toggle */}
        <div style={{ padding:"0 18px 14px" }}>
          <div style={{ display:"flex", background:"#f1f5f9", borderRadius:12, padding:4 }}>
            {["income", "expense"].map(t => (
              <button key={t} onClick={() => { setType(t); setCat(""); }}
                style={{ flex:1, padding:"8px", borderRadius:9, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", textTransform:"capitalize", transition:"all .15s",
                  background: type === t ? (t === "income" ? "#22c55e" : "#ef4444") : "transparent",
                  color:      type === t ? "#fff" : "#94a3b8" }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Section 3: Scrollable Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 18px 16px", scrollbarWidth:"none" }}>
          <div style={{ paddingBottom:1 }}> {/* Prevents small clipping */}
            {/* amount */}
            <div style={{ display:"flex", alignItems:"center", background:"#f8fafc", borderRadius:12, padding:"12px 16px", marginBottom:12 }}>
              <span style={{ color:"#94a3b8", fontWeight:700, marginRight:8, fontSize:16 }}>RM</span>
              <input style={{ flex:1, fontSize:24, fontWeight:900, background:"transparent", border:"none", outline:"none", color:"#1e293b", fontFamily:"inherit" }}
                type="number" inputMode="decimal" placeholder="0.00" value={amt} onChange={e => setAmt(e.target.value)} autoFocus />
            </div>

            <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Category</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
              {cats.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  style={{ padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:700, border:`2px solid ${cat === c ? "#1565c0" : "#e2e8f0"}`, background: cat === c ? "#1565c0" : "#fff", color: cat === c ? "#fff" : "#64748b", cursor:"pointer", transition:"all .15s" }}>{c}</button>
              ))}
            </div>

            <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Date</div>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ width:"100%", border:"1px solid #e2e8f0", borderRadius:10, padding:"9px 12px", fontSize:12, outline:"none", marginBottom:12, fontFamily:"inherit", background:"#fff", boxSizing:"border-box" }} />

            <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6 }}>Note (optional)</div>
            <input style={{ width:"100%", border:"1px solid #e2e8f0", borderRadius:10, padding:"9px 12px", fontSize:12, outline:"none", marginBottom:12, fontFamily:"inherit", boxSizing:"border-box" }}
              placeholder="e.g. Monday restock" value={note} onChange={e => setNote(e.target.value)} />

            {type === "expense" && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f8fafc", borderRadius:12, padding:"10px 14px", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#334155" }}>Personal expense</div>
                  <div style={{ fontSize:10, color:"#94a3b8" }}>Won't count toward business profit</div>
                </div>
                <button onClick={() => setPersonal(v => !v)}
                  style={{ width:40, height:22, borderRadius:99, background: personal ? "#1565c0" : "#e2e8f0", border:"none", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
                  <div style={{ position:"absolute", top:2, left: personal ? "calc(100% - 20px)" : 2, width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,.2)", transition:"left .2s" }} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Fixed Footer */}
        <div style={{ padding:"0 18px 32px" }}>
          <button onClick={save} disabled={!valid}
            style={{ width:"100%", padding:"13px", borderRadius:12, fontWeight:800, fontSize:13, border:"none", cursor: valid ? "pointer" : "not-allowed", background: valid ? "#1565c0" : "#e2e8f0", color: valid ? "#fff" : "#94a3b8", transition:"all .2s" }}>
            {isEdit ? "Save changes" : `Save ${type}`}
          </button>
        </div>
      </div>
    </div>
  );
}
