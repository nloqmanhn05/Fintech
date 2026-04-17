/* ═══════════════════════════════════════════════════════════════
   BUSINESS LOGIC — CALCULATIONS
═══════════════════════════════════════════════════════════════ */
import { useMemo } from "react";
import { daysAgo, weekStart } from "../utils/helpers";

export function useCalcs(txns, ob) {
  return useMemo(() => {
    const s7 = daysAgo(7);
    const totalIncome  = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const balance      = ob + totalIncome - totalExpense;
    const last7Exp     = txns.filter(t => t.date >= s7 && t.type === "expense" && !t.isPersonal).reduce((s, t) => s + t.amount, 0);
    const avgDaily     = last7Exp / 7;
    
    // User request: runway is 0 unless there is a transaction today.
    const today        = new Date().toISOString().slice(0, 10);
    const hasTxToday   = txns.some(t => t.date === today);
    
    let daysLeft = 0;
    if (hasTxToday) {
      daysLeft = avgDaily > 0 ? Math.floor(balance / avgDaily) : 999;
      // "start to count with 1" — ensure at least 1 if there's activity
      if (daysLeft < 1) daysLeft = 1;
    }

    const wStr         = weekStart();
    const weekIncome   = txns.filter(t => t.date >= wStr && t.type === "income").reduce((s, t) => s + t.amount, 0);
    const weekExpense  = txns.filter(t => t.date >= wStr && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const bizExpense   = txns.filter(t => t.type === "expense" && !t.isPersonal).reduce((s, t) => s + t.amount, 0);
    const realProfit   = totalIncome - bizExpense;
    return { totalIncome, totalExpense, balance, daysLeft, weekIncome, weekExpense, weekLoss: weekExpense > weekIncome, bizExpense, realProfit, isSafe: daysLeft >= 7, avgDaily };
  }, [txns, ob]);
}
