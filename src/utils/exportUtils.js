/* ═══════════════════════════════════════════════════════════════
   CSV / PDF EXPORT (pure client-side)
═══════════════════════════════════════════════════════════════ */
import { fmtRM } from './helpers';

export function exportCSV(txns, stallName) {
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

export function exportTXT(txns, stallName, calcs) {
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
