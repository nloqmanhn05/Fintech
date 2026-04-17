/* ═══════════════════════════════════════════════════════════════
   LOCALSTORAGE HOOK
═══════════════════════════════════════════════════════════════ */
import { useState, useEffect } from "react";

export function useLs(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}
