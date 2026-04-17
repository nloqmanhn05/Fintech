/* ═══════════════════════════════════════════════════════════════
   TRANSACTION ROW — Premium 'Active Dot' Design
   ═══════════════════════════════════════════════════════════════ */
import { fmtRM } from '../utils/helpers';

export default function TxnRow({ txn, onEdit, layout = "standard" }) {
  const isInc = txn.type === 'income';
  
  return (
    <div 
      onClick={() => onEdit && onEdit(txn)}
      className="group flex items-center justify-between p-4 hover:bg-[#f7f2f4] rounded-2xl transition-all cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        {/* Large Rounded Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
          isInc ? 'bg-[#ffdeff]/30 text-[#6349bf]' : 'bg-[#d6e3ff]/30 text-[#004d99]'
        }`}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isInc ? 'payments' : (txn.category?.toLowerCase().includes('food') || txn.category?.toLowerCase().includes('produce') || txn.category?.toLowerCase().includes('groceries') ? 'shopping_bag' : 'restaurant')}
          </span>
        </div>
        
        <div className="min-w-0">
          <p className="font-headline font-bold text-[#1c1b1d] leading-tight truncate">
            {txn.note || txn.category}
          </p>
          <p className="text-xs text-[#424752] font-medium mt-0.5 opacity-70">
            {txn.category} • 10:45 AM
          </p>
        </div>
      </div>
      
      <div className="text-right flex flex-col items-end gap-1">
        <p className={`font-headline font-extrabold text-lg tracking-tight ${isInc ? 'text-[#004d99]' : 'text-[#1c1b1d]'}`}>
          {isInc ? '+ ' : '- '}{fmtRM(txn.amount)}
        </p>
        <span className={`w-2 h-2 rounded-full ${isInc ? 'bg-[#004d99]' : 'bg-[#ba1a1a]'}`}></span>
      </div>
    </div>
  );
}
