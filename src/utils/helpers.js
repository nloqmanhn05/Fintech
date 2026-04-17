/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
export const genId = () => crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
export const todayStr = () => new Date().toISOString().slice(0, 10);
export const fmtRM = (n) => `RM ${Math.abs(Number(n)).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtDate = (d) => {
  const dt = new Date(d + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const diff = Math.round((now - dt) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return dt.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" });
};
export const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
export const weekStart = () => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10); };
