/* ═══════════════════════════════════════════════════════════════
   WARNING ENGINE — Detects dangerous spending streaks
═══════════════════════════════════════════════════════════════ */
import { useMemo } from "react";
import { daysAgo } from "../utils/helpers";
import { WARN_THRESHOLD, WARN_STREAK } from "../utils/constants";

export function useWarningEngine(txns) {
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
