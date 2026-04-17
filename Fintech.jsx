import { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const genId = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtRM = (n) => `RM ${Math.abs(Number(n)).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => {
  const dt = new Date(d + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((now - dt) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return dt.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" });
};
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const weekStart = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10); };

const INCOME_CATS  = ["Sales", "Catering", "Advance", "Other"];
const EXPENSE_CATS = ["Ingredients", "Gas", "Packaging", "Rent", "Transport", "Staff", "Utilities", "Other"];
const WARN_THRESHOLD = 0.80;
const WARN_STREAK    = 3;

/* ═══════════════════════════════════════════════════════════════
   SEED DATA  (realistic food-stall scenario, triggers warning)
═══════════════════════════════════════════════════════════════ */
const SEED = [
  { id:"t01", type:"income",  category:"Sales",       amount:280, date:todayStr(),  isPersonal:false, note:"Morning sales"    },
  { id:"t02", type:"expense", category:"Ingredients", amount:235, date:todayStr(),  isPersonal:false, note:"Daily restock"    },
  { id:"t03", type:"income",  category:"Sales",       amount:195, date:daysAgo(1),  isPersonal:false, note:""                 },
  { id:"t04", type:"expense", category:"Ingredients", amount:162, date:daysAgo(1),  isPersonal:false, note:"Supplier restock" },
  { id:"t05", type:"expense", category:"Gas",         amount:30,  date:daysAgo(1),  isPersonal:false, note:""                 },
  { id:"t06", type:"income",  category:"Sales",       amount:220, date:daysAgo(2),  isPersonal:false, note:""                 },
  { id:"t07", type:"expense", category:"Ingredients", amount:185, date:daysAgo(2),  isPersonal:false, note:""                 },
  { id:"t08", type:"expense", category:"Packaging",   amount:18,  date:daysAgo(2),  isPersonal:false, note:""                 },
  { id:"t09", type:"income",  category:"Sales",       amount:310, date:daysAgo(3),  isPersonal:false, note:"Weekend"          },
  { id:"t10", type:"expense", category:"Rent",        amount:150, date:daysAgo(3),  isPersonal:false, note:"Monthly rent"     },
  { id:"t11", type:"expense", category:"Staff",       amount:80,  date:daysAgo(4),  isPersonal:false, note:""                 },
  { id:"t12", type:"income",  category:"Sales",       amount:260, date:daysAgo(4),  isPersonal:false, note:""                 },
  { id:"t13", type:"expense", category:"Ingredients", amount:110, date:daysAgo(5),  isPersonal:false, note:""                 },
  { id:"t14", type:"income",  category:"Sales",       amount:175, date:daysAgo(5),  isPersonal:false, note:""                 },
  { id:"t15", type:"expense", category:"Transport",   amount:25,  date:daysAgo(6),  isPersonal:false, note:""                 },
  { id:"t16", type:"income",  category:"Sales",       amount:190, date:daysAgo(6),  isPersonal:false, note:""                 },
  { id:"t17", type:"expense", category:"Utilities",   amount:40,  date:daysAgo(7),  isPersonal:true,  note:"Personal electric"},
];

/* ═══════════════════════════════════════════════════════════════
   LOCALSTORAGE HOOK
═══════════════════════════════════════════════════════════════ */
function useLs(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

/* ═══════════════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════════════ */
const I = {
  Home:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  List:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>,
  Chart:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zM16.2 13h2.8v6h-2.8z"/></svg>,
  Gear:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  Plus:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  Warn:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>,
  Check:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  Back:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  Edit:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  Trash:   (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  Shield:  (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>,
  Chevron: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>,
  Bell:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
  Download:(p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>,
  Info:    (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
};

/* ═══════════════════════════════════════════════════════════════
   BUSINESS LOGIC HOOKS
═══════════════════════════════════════════════════════════════ */
function useCalcs(txns, ob) {
  return useMemo(() => {
    const s7 = daysAgo(7);
    const totalIncome  = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance      = ob + totalIncome - totalExpense;
    const last7Exp     = txns.filter(t => t.date >= s7 && t.type === "expense" && !t.isPersonal).reduce((s, t) => s + t.amount, 0);
    const avgDaily     = last7Exp / 7;
    const daysLeft     = avgDaily > 0 ? Math.floor(balance / avgDaily) : 999;
    const wStr         = weekStart();
    const weekIncome   = txns.filter(t => t.date >= wStr && t.type === "income").reduce((s, t) => s + t.amount, 0);
    const weekExpense  = txns.filter(t => t.date >= wStr && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const bizExpense   = txns.filter(t => t.type === "expense" && !t.isPersonal).reduce((s, t) => s + t.amount, 0);
    const realProfit   = totalIncome - bizExpense;
    return { totalIncome, totalExpense, balance, daysLeft, weekIncome, weekExpense, weekLoss: weekExpense > weekIncome, bizExpense, realProfit, isSafe: daysLeft >= 7, avgDaily };
  }, [txns, ob]);
}

function useWarningEngine(txns) {
  return useMemo(() => {
    const dayRatios = Array.from({ length: WARN_STREAK }, (_, i) => {
      const ds  = daysAgo(i);
      const inc = txns.filter(t => t.date === ds && t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = txns.filter(t => t.date === ds && t.type === "expense" && !t.isPersonal).reduce((s, t) => s + t.amount, 0);
      return { date: ds, inc, exp, ratio: inc > 0 ? exp / inc : 0 };
    });

    const streakActive = dayRatios.every(d => d.inc > 0 && d.ratio >= WARN_THRESHOLD);
    const totalInc = dayRatios.reduce((s, d) => s + d.inc, 0);
    const totalExp = dayRatios.reduce((s, d) => s + d.exp, 0);
    const ratio    = totalInc > 0 ? totalExp / totalInc : 0;
    const pct      = Math.round(ratio * 100);

    const catTotals = txns.filter(t => t.date >= daysAgo(WARN_STREAK) && t.type === "expense" && !t.isPersonal)
      .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
    const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
    const topCat     = sortedCats[0] || ["Unknown", 0];

    const prevPeriod = txns.filter(t => t.date >= daysAgo(WARN_STREAK * 2) && t.date < daysAgo(WARN_STREAK) && t.type === "expense" && t.category === topCat[0]).reduce((s, t) => s + t.amount, 0);
    const changePct  = prevPeriod > 0 ? Math.round(((topCat[1] - prevPeriod) / prevPeriod) * 100) : null;

    return { streakActive, totalInc, totalExp, ratio, pct, topCat, changePct, targetSpend: Math.round(topCat[1] * 0.7), priceRaise: Math.round(totalInc * 0.1) };
  }, [txns]);
}

/* ═══════════════════════════════════════════════════════════════
   CSV / PDF EXPORT (pure client-side)
═══════════════════════════════════════════════════════════════ */
function exportCSV(txns, stallName) {
  const header = ["Date", "Type", "Category", "Amount (RM)", "Note", "Personal"].join(",");
  const rows = txns.map(t => [
    t.date, t.type, t.category, t.amount.toFixed(2), `"${t.note || ""}"`, t.isPersonal ? "Yes" : "No"
  ].join(","));
  const csv  = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `${stallName}-transactions.csv` });
  a.click(); URL.revokeObjectURL(url);
}

function exportTXT(txns, stallName, calcs) {
  const lines = [
    `Fintech — ${stallName}`,
    `Generated: ${new Date().toLocaleDateString("en-MY")}`,
    "─".repeat(40),
    `Total Income:    ${fmtRM(calcs.totalIncome)}`,
    `Total Expenses:  ${fmtRM(calcs.totalExpense)}`,
    `Net Profit:      ${fmtRM(calcs.realProfit)}`,
    `Balance:         ${fmtRM(calcs.balance)}`,
    `Days Left:       ${calcs.daysLeft > 99 ? "99+" : calcs.daysLeft}`,
    "─".repeat(40),
    "TRANSACTIONS",
    ...txns.map(t => `${t.date}  ${t.type.padEnd(7)}  ${t.category.padEnd(12)}  ${fmtRM(t.amount).padStart(12)}  ${t.note || ""}`),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `${stallName}-report.txt` });
  a.click(); URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════════════════
   CRITICAL WARNING OVERLAY
═══════════════════════════════════════════════════════════════ */
function CriticalWarning({ data, onAcknowledge }) {
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

/* ═══════════════════════════════════════════════════════════════
   ONBOARDING
═══════════════════════════════════════════════════════════════ */
function Onboarding({ onComplete }) {
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
        <div style={S.sub}>Know if your stall is surviving<br />— before it's too late.</div>
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

/* ═══════════════════════════════════════════════════════════════
   TRANSACTION ROW
═══════════════════════════════════════════════════════════════ */
function TxnRow({ txn, onEdit, onDel }) {
  const [hov, setHov] = useState(false);
  const inc = txn.type === "income";
  return (
    <div style={{ display:"flex", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #f8fafc" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ width:8, height:8, borderRadius:"50%", background: inc ? "#4ade80" : "#f87171", marginRight:10, flexShrink:0 }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#334155", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{txn.category}</div>
        <div style={{ fontSize:11, color:"#94a3b8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{txn.note || fmtDate(txn.date)}{txn.isPersonal ? " · Personal" : ""}</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        <div style={{ fontSize:13, fontWeight:700, color: inc ? "#16a34a" : "#dc2626" }}>{inc ? "+" : "−"}{fmtRM(txn.amount)}</div>
        {onEdit && hov && <>
          <button onClick={() => onEdit(txn)} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:4, display:"flex" }}><I.Edit style={{ width:14, height:14 }} /></button>
          <button onClick={() => onDel(txn.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:4, display:"flex" }}><I.Trash style={{ width:14, height:14 }} /></button>
        </>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */
function Dashboard({ txns, name, bal, onAdd, warnBanner, onBannerClick }) {
  const { daysLeft, isSafe, balance, weekIncome, weekExpense, weekLoss } = useCalcs(txns, bal);
  const dd = Math.min(Math.max(0, daysLeft), 999);

  return (
    <div>
      {warnBanner && (
        <div onClick={onBannerClick} style={{ background:"#fef2f2", borderLeft:"3px solid #c62828", padding:"10px 14px", display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <I.Warn style={{ width:14, height:14, color:"#c62828", flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <span style={{ fontSize:12, fontWeight:700, color:"#991b1b" }}>Budget warning active</span>
            <span style={{ fontSize:11, color:"#b91c1c" }}> — tap to review</span>
          </div>
          <I.Chevron style={{ width:14, height:14, color:"#c62828" }} />
        </div>
      )}

      <div style={{ padding:"24px 16px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #f8fafc", background:"#fff", position:"sticky", top:0, zIndex:10 }}>
        <div>
          <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:"0.12em", textTransform:"uppercase" }}>Your stall</div>
          <div style={{ fontSize:16, fontWeight:800, color:"#1e293b" }}>{name || "My Stall"}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <I.Bell style={{ width:20, height:20, color:"#1565c0" }} />
          <div style={{ width:34, height:34, borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"#1d4ed8", fontWeight:800, fontSize:13 }}>{(name || "M")[0].toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:12 }}>
        {/* HERO */}
        <div style={{ borderRadius:20, padding:"20px 22px", background: isSafe ? "#1565c0" : "#fff", border: isSafe ? "none" : "2px solid #c62828" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background: isSafe ? "rgba(255,255,255,.2)" : "#fef2f2", borderRadius:99, padding:"4px 10px" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background: isSafe ? "#4ade80" : "#c62828" }} />
              <span style={{ fontSize:10, fontWeight:700, color: isSafe ? "#fff" : "#c62828", letterSpacing:"0.06em" }}>{isSafe ? "SAFE SCENARIO" : "DANGER SCENARIO"}</span>
            </div>
            {isSafe ? <I.Shield style={{ width:20, height:20, fill:"rgba(255,255,255,.7)" }} />
                    : <I.Warn  style={{ width:20, height:20, color:"#c62828" }} />}
          </div>

          <div style={{ fontSize:11, color: isSafe ? "rgba(255,255,255,.7)" : "#64748b", marginBottom:2 }}>
            {isSafe ? "Estimated Survival" : "Survival Remaining"}
          </div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
            <div style={{ fontSize:72, fontWeight:900, lineHeight:1, color: isSafe ? "#fff" : "#c62828" }}>{dd > 99 ? "99+" : dd}</div>
            <div style={{ fontSize:22, fontWeight:700, color: isSafe ? "rgba(255,255,255,.85)" : "#c62828" }}>Days</div>
          </div>
          <div style={{ fontSize:10, color: isSafe ? "rgba(255,255,255,.5)" : "#94a3b8", marginBottom:14 }}>Based on last 7 days of spending</div>

          {!isSafe && (
            <div style={{ background:"#fff5f5", border:"1px solid #fecaca", borderRadius:10, padding:"10px 12px", marginBottom:12 }}>
              <div style={{ fontSize:11, color:"#c62828", lineHeight:1.5 }}>
                <strong>Critical:</strong> At current burn rate, funds will be exhausted in under a week.
              </div>
            </div>
          )}

          <div style={{ borderTop: isSafe ? "1px solid rgba(255,255,255,.2)" : "1px solid #fee2e2", paddingTop:12, display:"flex", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color: isSafe ? "rgba(255,255,255,.6)" : "#94a3b8", marginBottom:2 }}>BURN RATE</div>
              <div style={{ fontSize:15, fontWeight:800, color: isSafe ? "#fff" : "#c62828" }}>
                {fmtRM(useCalcs(txns, bal).avgDaily)}<span style={{ fontSize:11, fontWeight:400 }}>/day</span>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color: isSafe ? "rgba(255,255,255,.6)" : "#94a3b8", marginBottom:2 }}>BALANCE</div>
              <div style={{ fontSize:15, fontWeight:800, color: isSafe ? "#fff" : "#c62828" }}>{fmtRM(balance)}</div>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ background:"#f0fdf4", borderRadius:14, padding:"12px 14px", border:"1px solid #bbf7d0" }}>
            <div style={{ fontSize:9, color:"#64748b", marginBottom:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>This week income</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#15803d" }}>{fmtRM(weekIncome)}</div>
          </div>
          <div style={{ background:"#fff1f2", borderRadius:14, padding:"12px 14px", border:"1px solid #fecaca" }}>
            <div style={{ fontSize:9, color:"#64748b", marginBottom:2, textTransform:"uppercase", letterSpacing:"0.06em" }}>This week expenses</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#be123c" }}>{fmtRM(weekExpense)}</div>
          </div>
        </div>

        {/* WEEKLY LOSS BANNER */}
        {weekLoss && (
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:14, padding:"12px 14px", display:"flex", gap:10 }}>
            <I.Warn style={{ width:15, height:15, color:"#d97706", flexShrink:0, marginTop:2 }} />
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#92400e" }}>Spending more than you earn</div>
              <div style={{ fontSize:11, color:"#b45309", marginTop:2, lineHeight:1.5 }}>
                Expenses exceeded income by {fmtRM(weekExpense - weekIncome)} this week.
              </div>
            </div>
          </div>
        )}

        {/* RECENT TXNS */}
        <div>
          <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8 }}>Recent transactions</div>
          {txns.length === 0
            ? <div style={{ textAlign:"center", padding:"24px 0", color:"#94a3b8", fontSize:13 }}>No transactions yet.<br /><span style={{ fontSize:11 }}>Tap + to add your first one.</span></div>
            : txns.slice(0, 6).map(t => <TxnRow key={t.id} txn={t} />)
          }
        </div>
      </div>

      <button onClick={onAdd} style={{ position:"absolute", bottom:76, right:16, background:"#1565c0", border:"none", cursor:"pointer", width:46, height:46, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 4px 16px rgba(21,101,192,.45)", zIndex:20 }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
        <I.Plus style={{ width:22, height:22 }} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRANSACTIONS
═══════════════════════════════════════════════════════════════ */
function Transactions({ txns, onAdd, onEdit, onDel }) {
  const [filter, setFilter] = useState("all");
  const filtered = txns.filter(t => filter === "all" || t.type === (filter === "income" ? "income" : "expense"));
  const totalIn  = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net      = totalIn - totalOut;
  const groups   = filtered.reduce((acc, t) => { (acc[t.date] = acc[t.date] || []).push(t); return acc; }, {});
  const dates    = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <div style={{ padding:"24px 16px 12px", background:"#fff", position:"sticky", top:0, zIndex:10, borderBottom:"1px solid #f8fafc" }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#1e293b", marginBottom:10 }}>Transactions</div>
        <div style={{ display:"flex", gap:6 }}>
          {["all", "income", "expenses"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding:"5px 12px", borderRadius:99, fontSize:11, fontWeight:700, border:"none", cursor:"pointer", textTransform:"capitalize", background: filter === f ? "#1565c0" : "#f1f5f9", color: filter === f ? "#fff" : "#64748b", transition:"all .15s" }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ padding:"12px 16px" }}>
        <div style={{ background:"#f8fafc", borderRadius:14, padding:"10px 12px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", textAlign:"center", marginBottom:12 }}>
          <div><div style={{ fontSize:9, color:"#94a3b8" }}>Total in</div><div style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>{fmtRM(totalIn)}</div></div>
          <div style={{ borderLeft:"1px solid #e2e8f0", borderRight:"1px solid #e2e8f0" }}><div style={{ fontSize:9, color:"#94a3b8" }}>Total out</div><div style={{ fontSize:12, fontWeight:700, color:"#dc2626" }}>{fmtRM(totalOut)}</div></div>
          <div><div style={{ fontSize:9, color:"#94a3b8" }}>Net</div><div style={{ fontSize:12, fontWeight:700, color: net >= 0 ? "#1565c0" : "#dc2626" }}>{fmtRM(net)}</div></div>
        </div>

        {filtered.length === 0 && <div style={{ textAlign:"center", padding:"32px 0", color:"#94a3b8", fontSize:13 }}>No transactions found.</div>}

        {dates.map(d => (
          <div key={d}>
            <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6, marginTop:4 }}>{fmtDate(d)}</div>
            {groups[d].map(t => <TxnRow key={t.id} txn={t} onEdit={onEdit} onDel={onDel} />)}
          </div>
        ))}
      </div>

      <button onClick={onAdd} style={{ position:"absolute", bottom:76, right:16, background:"#1565c0", border:"none", cursor:"pointer", width:46, height:46, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 4px 16px rgba(21,101,192,.45)", zIndex:20 }}
        onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
        <I.Plus style={{ width:22, height:22 }} />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REPORTS
═══════════════════════════════════════════════════════════════ */
function Reports({ txns, bal }) {
  const { daysLeft, totalIncome, bizExpense, realProfit, totalExpense } = useCalcs(txns, bal);
  const dd = Math.min(Math.max(0, daysLeft), 999);
  const ratio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d  = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    const inc = txns.filter(t => t.date === ds && t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = txns.filter(t => t.date === ds && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { label: d.toLocaleDateString("en-MY", { weekday:"short" }).slice(0, 3), inc, exp };
  });
  const maxBar = Math.max(...days7.flatMap(d => [d.inc, d.exp]), 1);

  const expCats  = txns.filter(t => t.type === "expense" && !t.isPersonal).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});
  const sorted   = Object.entries(expCats).sort((a, b) => b[1] - a[1]);
  const maxCat   = sorted[0]?.[1] || 1;
  const ratioClr = ratio >= 80 ? "#c62828" : ratio >= 60 ? "#d97706" : "#16a34a";
  const card     = { background:"#fff", borderRadius:16, border:"1px solid #f1f5f9", padding:"14px 16px" };

  return (
    <div>
      <div style={{ padding:"24px 16px 12px", background:"#fff", borderBottom:"1px solid #f8fafc", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#1e293b" }}>Reports</div>
      </div>

      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:12, paddingBottom:24 }}>
        {/* forecast */}
        <div style={{ background:"#1565c0", borderRadius:20, padding:"18px 20px", color:"#fff" }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#93c5fd", marginBottom:4 }}>Cash Forecast</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:2 }}>
            <div style={{ fontSize:52, fontWeight:900, lineHeight:1 }}>{dd > 99 ? "99+" : dd}</div>
            <div style={{ fontSize:18, fontWeight:700, color:"rgba(255,255,255,.7)" }}>Days</div>
          </div>
          <div style={{ fontSize:13, color:"#bfdbfe" }}>at current spending rate</div>
          <div style={{ fontSize:10, color:"#93c5fd", marginTop:3 }}>Based on last 7 days average</div>
        </div>

        {/* ratio */}
        <div style={card}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:700, color:"#334155", marginBottom:8 }}>
            <span>Expense ratio</span>
            <span style={{ color: ratioClr, fontWeight:800 }}>{ratio}%</span>
          </div>
          <div style={{ height:10, background:"#f1f5f9", borderRadius:99, overflow:"hidden", marginBottom:4 }}>
            <div style={{ height:"100%", background: ratioClr, borderRadius:99, width:`${Math.min(ratio, 100)}%`, transition:"width 1s" }} />
          </div>
          <div style={{ fontSize:10, color:"#94a3b8" }}>80% = danger threshold</div>
          {ratio >= 80 && (
            <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:6, background:"#fef2f2", borderRadius:8, padding:"6px 10px" }}>
              <I.Warn style={{ width:12, height:12, color:"#c62828" }} />
              <span style={{ fontSize:11, color:"#c62828", fontWeight:600 }}>Warning: expense ratio exceeds threshold</span>
            </div>
          )}
        </div>

        {/* bar chart */}
        <div style={card}>
          <div style={{ fontSize:12, fontWeight:700, color:"#334155", marginBottom:12 }}>Income vs expenses — 7 days</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:80 }}>
            {days7.map((d, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
                <div style={{ width:"100%", display:"flex", gap:2, alignItems:"flex-end", height:68 }}>
                  <div style={{ flex:1, background:"#3b82f6", borderRadius:"3px 3px 0 0", height:`${Math.max((d.inc / maxBar) * 68, d.inc > 0 ? 3 : 0)}px` }} />
                  <div style={{ flex:1, background:"#e2e8f0", borderRadius:"3px 3px 0 0", height:`${Math.max((d.exp / maxBar) * 68, d.exp > 0 ? 3 : 0)}px` }} />
                </div>
                <div style={{ fontSize:9, color:"#94a3b8", marginTop:3 }}>{d.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:12, marginTop:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:10, height:10, borderRadius:2, background:"#3b82f6" }} /><span style={{ fontSize:10, color:"#94a3b8" }}>Income</span></div>
            <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:10, height:10, borderRadius:2, background:"#e2e8f0" }} /><span style={{ fontSize:10, color:"#94a3b8" }}>Expenses</span></div>
          </div>
        </div>

        {/* breakdown */}
        {sorted.length > 0 && (
          <div style={card}>
            <div style={{ fontSize:12, fontWeight:700, color:"#334155", marginBottom:12 }}>Expense breakdown</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {sorted.slice(0, 6).map(([cat, amt]) => (
                <div key={cat}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#475569", marginBottom:4 }}>
                    <span>{cat}</span><span style={{ fontWeight:600 }}>{fmtRM(amt)}</span>
                  </div>
                  <div style={{ height:6, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:"#1565c0", borderRadius:99, width:`${(amt / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* profit */}
        <div style={card}>
          <div style={{ fontSize:12, fontWeight:700, color:"#334155", marginBottom:12 }}>Real business profit</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}><span style={{ color:"#94a3b8" }}>Total income</span><span style={{ color:"#16a34a", fontWeight:700 }}>{fmtRM(totalIncome)}</span></div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}><span style={{ color:"#94a3b8" }}>Business expenses</span><span style={{ color:"#dc2626", fontWeight:700 }}>− {fmtRM(bizExpense)}</span></div>
            <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:8, display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:800 }}>
              <span style={{ color:"#1e293b" }}>Net profit</span>
              <span style={{ color: realProfit >= 0 ? "#16a34a" : "#dc2626" }}>{fmtRM(realProfit)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════════════════ */
function Settings({ name, bal, txns, onName, onBal, onReset }) {
  const [editN, setEditN]   = useState(false);
  const [editB, setEditB]   = useState(false);
  const [nv, setNv]         = useState(name);
  const [bv, setBv]         = useState(String(bal));
  const [confirm, setConfirm] = useState(false);
  const calcs = useCalcs(txns, bal);

  const sec  = (title, children) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:9, fontWeight:700, color:"#94a3b8", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:6, padding:"0 2px" }}>{title}</div>
      <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:14, overflow:"hidden" }}>{children}</div>
    </div>
  );
  const row = (label, val) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderBottom:"1px solid #f8fafc" }}>
      <span style={{ fontSize:13, color:"#475569" }}>{label}</span><div>{val}</div>
    </div>
  );

  return (
    <div>
      <div style={{ padding:"24px 16px 12px", background:"#fff", borderBottom:"1px solid #f8fafc", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ fontSize:16, fontWeight:800, color:"#1e293b" }}>Settings</div>
      </div>

      <div style={{ padding:"14px 16px", paddingBottom:24 }}>
        {/* profile */}
        <div style={{ background:"#fff", border:"1px solid #f1f5f9", borderRadius:16, padding:14, display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:"#dbeafe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ color:"#1d4ed8", fontWeight:800, fontSize:15 }}>{(name || "M")[0].toUpperCase()}</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            {editN
              ? <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input style={{ flex:1, border:"1px solid #e2e8f0", borderRadius:8, padding:"4px 8px", fontSize:12, outline:"none", fontFamily:"inherit" }} value={nv} onChange={e => setNv(e.target.value)} autoFocus />
                  <button onClick={() => { onName(nv); setEditN(false); }} style={{ fontSize:11, color:"#1565c0", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>Save</button>
                </div>
              : <div style={{ fontSize:14, fontWeight:700, color:"#1e293b" }}>{name || "My Stall"}</div>
            }
            <div style={{ fontSize:11, color:"#94a3b8" }}>Stall owner</div>
          </div>
          {!editN && <button onClick={() => setEditN(true)} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", display:"flex", padding:4 }}><I.Edit style={{ width:14, height:14 }} /></button>}
        </div>

        {sec("Stall", <>
          {row("Opening balance",
            editB
              ? <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:"#94a3b8" }}>RM</span>
                  <input style={{ width:72, border:"1px solid #e2e8f0", borderRadius:6, padding:"3px 6px", fontSize:11, outline:"none", fontFamily:"inherit" }} type="number" value={bv} onChange={e => setBv(e.target.value)} autoFocus />
                  <button onClick={() => { onBal(parseFloat(bv) || 0); setEditB(false); }} style={{ fontSize:11, color:"#1565c0", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>Save</button>
                </div>
              : <button onClick={() => setEditB(true)} style={{ fontSize:12, color:"#1565c0", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>{fmtRM(bal)}</button>
          )}
          {row("Total transactions", <span style={{ fontSize:12, color:"#94a3b8" }}>{txns.length}</span>)}
          {row("Current balance",    <span style={{ fontSize:12, fontWeight:700, color: calcs.balance >= 0 ? "#16a34a" : "#dc2626" }}>{fmtRM(calcs.balance)}</span>)}
        </>)}

        {sec("Export", <>
          {row("Export as CSV",
            <button onClick={() => exportCSV(txns, name)} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#1565c0", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>
              <I.Download style={{ width:14, height:14 }} /> Export
            </button>
          )}
          {row("Export as report (.txt)",
            <button onClick={() => exportTXT(txns, name, calcs)} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#1565c0", fontWeight:700, background:"none", border:"none", cursor:"pointer" }}>
              <I.Download style={{ width:14, height:14 }} /> Export
            </button>
          )}
        </>)}

        {sec("Data", <>
          {row(
            <span style={{ color:"#ef4444" }}>Clear all data</span>,
            confirm
              ? <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => { onReset(); setConfirm(false); }} style={{ fontSize:11, color:"#dc2626", fontWeight:700, border:"1px solid #fca5a5", borderRadius:6, padding:"2px 8px", background:"none", cursor:"pointer" }}>Yes, clear</button>
                  <button onClick={() => setConfirm(false)} style={{ fontSize:11, color:"#94a3b8", background:"none", border:"none", cursor:"pointer" }}>Cancel</button>
                </div>
              : <button onClick={() => setConfirm(true)} style={{ fontSize:11, color:"#f87171", fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>Clear</button>
          )}
        </>)}

        {sec("About", <>
          {row("App version",  <span style={{ fontSize:12, color:"#94a3b8" }}>1.0.0</span>)}
          {row("Built for",    <span style={{ fontSize:12, color:"#94a3b8" }}>Food stall owners, MY</span>)}
          {row("Storage",      <span style={{ fontSize:12, color:"#94a3b8" }}>Local device only</span>)}
        </>)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ADD / EDIT MODAL
═══════════════════════════════════════════════════════════════ */
function AddModal({ initial, onSave, onClose }) {
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
      <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", padding:"16px 18px 32px", maxHeight:"88%", overflowY:"auto" }}>
        <div style={{ width:36, height:4, background:"#e2e8f0", borderRadius:99, margin:"0 auto 14px" }} />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#1e293b" }}>{isEdit ? "Edit transaction" : "Add transaction"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:20, lineHeight:1, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>

        {/* type toggle */}
        <div style={{ display:"flex", background:"#f1f5f9", borderRadius:12, padding:4, marginBottom:14 }}>
          {["income", "expense"].map(t => (
            <button key={t} onClick={() => { setType(t); setCat(""); }}
              style={{ flex:1, padding:"8px", borderRadius:9, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", textTransform:"capitalize", transition:"all .15s",
                background: type === t ? (t === "income" ? "#22c55e" : "#ef4444") : "transparent",
                color:      type === t ? "#fff" : "#94a3b8" }}>{t}</button>
          ))}
        </div>

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

        <button onClick={save} disabled={!valid}
          style={{ width:"100%", padding:"13px", borderRadius:12, fontWeight:800, fontSize:13, border:"none", cursor: valid ? "pointer" : "not-allowed", background: valid ? "#1565c0" : "#e2e8f0", color: valid ? "#fff" : "#94a3b8", transition:"all .2s" }}>
          {isEdit ? "Save changes" : `Save ${type}`}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM NAV
═══════════════════════════════════════════════════════════════ */
function BottomNav({ active, onChange }) {
  const tabs = [
    { id:"dashboard",    label:"Dashboard",    Icon: I.Home  },
    { id:"transactions", label:"Txns",         Icon: I.List  },
    { id:"reports",      label:"Reports",      Icon: I.Chart },
    { id:"settings",     label:"Settings",     Icon: I.Gear  },
  ];
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #f1f5f9", display:"flex", zIndex:10 }}>
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onChange(id)}
          style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"8px 4px", background:"none", border:"none", cursor:"pointer", color: active === id ? "#1565c0" : "#94a3b8", transition:"color .15s", gap:2 }}>
          <Icon style={{ width:20, height:20 }} />
          <span style={{ fontSize:9, fontWeight:700 }}>{label}</span>
          {active === id && <div style={{ width:12, height:2, borderRadius:99, background:"#1565c0" }} />}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */
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

      <div style={{ flex:1, overflowY:"auto", overscrollBehavior:"contain", paddingBottom:64 }}>
        {tab === "dashboard"    && <Dashboard txns={txns} name={name} bal={bal} onAdd={() => setModal("add")} warnBanner={false} onBannerClick={review} />}
        {tab === "transactions" && <Transactions txns={txns} onAdd={() => setModal("add")} onEdit={t => setModal(t)} onDel={del} />}
        {tab === "reports"      && <Reports txns={txns} bal={bal} />}
        {tab === "settings"     && <Settings name={name} bal={bal} txns={txns} onName={setName} onBal={setBal} onReset={() => { setTxns([]); setWarnAck(null); }} />}
      </div>

      <BottomNav active={tab} onChange={setTab} />

      {modal !== null && (
        <AddModal initial={modal === "add" ? null : modal}
          onSave={t => { modal === "add" ? add(t) : edit(t); setModal(null); }}
          onClose={() => setModal(null)} />
      )}

      {showWarn && <CriticalWarning data={warnData} onAcknowledge={ack} />}
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:"#e2e8f0", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:16 }}>
      <div style={{ width:"100%", maxWidth:390, background:"#f8fafc", borderRadius:24, overflow:"hidden", display:"flex", flexDirection:"column", position:"relative", boxShadow:"0 20px 60px rgba(0,0,0,.18)", minHeight:700, maxHeight:820 }}>
        {children}
      </div>
    </div>
  );
}
