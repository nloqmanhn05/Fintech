/* ═══════════════════════════════════════════════════════════════
   BOTTOM NAVIGATION BAR — Refined 'Active Circle' Design
   ═══════════════════════════════════════════════════════════════ */

export default function BottomNav({ active, onChange }) {
  const tabs = [
    { id: "dashboard",    label: "Dashboard",    icon: "dashboard" },
    { id: "transactions", label: "Transactions", icon: "receipt_long" },
    { id: "reports",      label: "Reports",      icon: "analytics" },
    { id: "settings",     label: "Settings",     icon: "settings" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 w-full z-50 bg-[#fdf8fa]/80 backdrop-blur-3xl flex justify-around items-end pb-8 pt-4 px-6 border-t border-[#e6e1e3]/10 shadow-[0_-8px_40px_-10px_rgba(28,27,29,0.08)]">
      {tabs.map(({ id, label, icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 tap-highlight-transparent ${
              isActive ? "text-[#1565C0] -translate-y-1" : "text-[#484554] hover:opacity-80 active:scale-95"
            }`}
          >
            {isActive ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center bg-[#1565C0] text-white rounded-full w-12 h-12 mb-1.5 shadow-lg shadow-[#1565C0]/30 transition-all">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {icon}
                  </span>
                </div>
                <span className="font-body text-[10px] font-bold uppercase tracking-widest leading-none">
                  {label}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2">
                <span className="material-symbols-outlined text-[26px] mb-1.5">
                  {icon}
                </span>
                <span className="font-body text-[10px] font-bold uppercase tracking-widest leading-none opacity-60">
                  {label}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}
