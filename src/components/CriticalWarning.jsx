/* ═══════════════════════════════════════════════════════════════
   CRITICAL WARNING OVERLAY
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect, useRef } from "react";
import { I } from './Icons';
import { fmtRM } from '../utils/helpers';
import { WARN_STREAK } from '../utils/constants';

export default function CriticalWarning({ data, onAcknowledge }) {
  const [phase, setPhase]     = useState("shock");
  const [countdown, setCount] = useState(5);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) { clearInterval(timerRef.current); setPhase("solutions"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const { pct, totalInc, totalExp, topCat, changePct, targetSpend, priceRaise } = data;
  const over = Math.max(0, Math.round(topCat[1] - targetSpend));

  const s = {
    overlay: { position:"absolute", inset:0, zIndex:50, display:"flex", flexDirection:"column", justifyContent:"flex-end", background:"rgba(10,10,10,0.85)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)" },
    sheet:   { background:"#fff", borderRadius:"28px 28px 0 0", padding:"20px 20px 36px", maxHeight:"90%", overflowY:"auto" },
    handle:  { width:36, height:4, background:"#e2e8f0", borderRadius:99, margin:"0 auto 20px" },
    iconWrap:{ display:"flex", justifyContent:"center", marginBottom:16 },
    icon:    { width:64, height:64, borderRadius:"50%", background:"#fef2f2", border:"3px solid #fca5a5", display:"flex", alignItems:"center", justifyContent:"center", animation:"cfPulse 1.8s ease-in-out infinite" },
    hl:      { fontSize:22, fontWeight:900, color:"#1e293b", textAlign:"center", lineHeight:1.2, marginBottom:6 },
    sub:     { fontSize:13, color:"#64748b", textAlign:"center", lineHeight:1.5, marginBottom:14 },
    pill:    { background:"#fef2f2", borderRadius:12, padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
    drain:   { borderLeft:"3px solid #c62828", borderRadius:"0 10px 10px 0", background:"#fef2f2", padding:"10px 14px", marginBottom:14 },
    barWrap: { marginBottom:16 },
    barRow:  { display:"flex", justifyContent:"space-between", fontSize:11, fontWeight:600, color:"#475569", marginBottom:5 },
    barTrack:{ height:10, background:"#f1f5f9", borderRadius:99, overflow:"hidden" },
    barFill: { height:"100%", background:"#c62828", borderRadius:99, transition:"width 1.2s ease", width:`${Math.min(pct, 100)}%` },
    lock:    { background:"#f8fafc", borderRadius:14, padding:14, textAlign:"center" },
    dots:    { display:"flex", justifyContent:"center", gap:6, marginTop:8 },
    dot:     (d) => ({ width:8, height:8, borderRadius:"50%", background:"#cbd5e1", animation:`cfBounce 1.2s ease-in-out ${d * 0.2}s infinite` }),
    aCard:   (c) => ({ borderLeft:`3px solid ${c.border}`, borderRadius:"0 12px 12px 0", background:c.bg, padding:"12px 14px", marginBottom:8 }),
    aTitle:  (c) => ({ fontSize:13, fontWeight:800, color:c.text, marginBottom:3 }),
    aBody:   (c) => ({ fontSize:11, color:c.body, lineHeight:1.5, marginBottom:6 }),
    chip:    (c) => ({ display:"inline-block", background:c.chip, color:c.text, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:99 }),
    ackBtn:  { width:"100%", padding:14, borderRadius:14, fontWeight:800, fontSize:14, border:"none", cursor:"pointer", background:"#c62828", color:"#fff", marginBottom:10 },
    caption: { textAlign:"center", fontSize:10, color:"#94a3b8", lineHeight:1.5 },
  };

  return (
    <div style={s.overlay}>
      <style>{`
        @keyframes cfPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(198,40,40,.3)}50%{transform:scale(1.06);box-shadow:0 0 0 8px rgba(198,40,40,0)}}
        @keyframes cfBounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}}
        @keyframes cfFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cfSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .cf-fadeup{animation:cfFadeUp .35s ease both}
        .cf-slideup{animation:cfSlideUp .4s cubic-bezier(.34,1.56,.64,1) both}
      `}</style>
      <div style={s.sheet} className="cf-slideup">
        <div style={s.handle} />

        {phase === "shock" && (
          <div className="cf-fadeup">
            <div style={s.iconWrap}><div style={s.icon}><I.Warn style={{ width:30, height:30, color:"#c62828" }} /></div></div>

            <div style={s.hl}>Your stall is bleeding money.</div>
            <div style={s.sub}>
              You've spent <strong style={{ color:"#c62828" }}>{pct}%</strong> of your income on expenses —{" "}
              <strong>{WARN_STREAK} days in a row.</strong>
            </div>

            <div style={s.pill}>
              <div><div style={{ fontSize:9, color:"#94a3b8", marginBottom:2 }}>SPENT</div><div style={{ fontSize:18, fontWeight:800, color:"#c62828" }}>{fmtRM(totalExp)}</div></div>
              <div style={{ width:1, height:32, background:"#fca5a5" }} />
              <div style={{ textAlign:"right" }}><div style={{ fontSize:9, color:"#94a3b8", marginBottom:2 }}>EARNED</div><div style={{ fontSize:18, fontWeight:800, color:"#475569" }}>{fmtRM(totalInc)}</div></div>
            </div>

            <div style={s.drain}>
              <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>Biggest drain</div>
              <div style={{ fontSize:15, fontWeight:800, color:"#1e293b" }}>{topCat[0]} — {fmtRM(topCat[1])}</div>
              {changePct !== null && <div style={{ fontSize:11, color:"#c62828", marginTop:2 }}>↑ {Math.abs(changePct)}% vs last period</div>}
            </div>

            <div style={s.barWrap}>
              <div style={s.barRow}><span>Expense ratio</span><span style={{ color:"#c62828", fontWeight:800 }}>{pct}%</span></div>
              <div style={s.barTrack}><div style={s.barFill} /></div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>80% threshold · {WARN_STREAK}-day streak detected</div>
            </div>

            <div style={s.lock}>
              <div style={{ fontSize:12, color:"#94a3b8" }}>Personalised solutions loading <strong style={{ color:"#c62828" }}>({countdown}s)</strong></div>
              <div style={s.dots}>{[0,1,2].map(d => <div key={d} style={s.dot(d)} />)}</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:6, fontStyle:"italic" }}>Read this carefully before continuing.</div>
            </div>
          </div>
        )}

        {phase === "solutions" && (
          <div className="cf-fadeup">
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <I.Warn style={{ width:18, height:18, color:"#c62828" }} />
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:"#1e293b" }}>Here's what you can do</div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>Based on your last {WARN_STREAK} days of spending</div>
              </div>
            </div>

            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#fef2f2", borderRadius:99, padding:"4px 10px", marginBottom:14 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#c62828" }} />
              <span style={{ fontSize:11, fontWeight:700, color:"#c62828" }}>{pct}% ratio · {WARN_STREAK}-day streak</span>
            </div>

            {[
              { border:"#16a34a", bg:"#f0fdf4", text:"#15803d", body:"#166534", chip:"#dcfce7",
                title:`Cut ${topCat[0].toLowerCase()} spending`,
                body_:`Target max ${fmtRM(targetSpend)} over 3 days. You're ${fmtRM(over)} over.`,
                chip_:`Potential saving: ${fmtRM(over)}` },
              { border:"#1565c0", bg:"#eff6ff", text:"#1d4ed8", body:"#1e40af", chip:"#dbeafe",
                title:"Raise your prices by 10%",
                body_:`On ${fmtRM(totalInc)} income, that adds ${fmtRM(priceRaise)} extra.`,
                chip_:"Low effort · high impact" },
              { border:"#d97706", bg:"#fffbeb", text:"#b45309", body:"#92400e", chip:"#fef3c7",
                title:"Track expenses every day",
                body_:"Daily logging catches overruns before they become crises.",
                chip_:"Takes less than 30 seconds" },
            ].map((c, i) => (
              <div key={i} style={s.aCard(c)}>
                <div style={s.aTitle(c)}>{c.title}</div>
                <div style={s.aBody(c)}>{c.body_}</div>
                <div style={s.chip(c)}>{c.chip_}</div>
              </div>
            ))}

            <div style={{ height:12 }} />
            <button style={s.ackBtn} onClick={onAcknowledge}>I understand — I'll act on this</button>
            <div style={s.caption}>This warning returns if the pattern continues for {WARN_STREAK} more days.</div>
          </div>
        )}
      </div>
    </div>
  );
}
