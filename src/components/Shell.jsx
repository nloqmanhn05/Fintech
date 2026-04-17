/* ═══════════════════════════════════════════════════════════════
   SHELL — Phone simulator wrapper
═══════════════════════════════════════════════════════════════ */
export default function Shell({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:"#e2e8f0", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:16 }}>
      <div style={{ width:"100%", maxWidth:390, background:"#fdf8fa", borderRadius:24, overflow:"hidden", display:"flex", flexDirection:"column", position:"relative", boxShadow:"0 20px 60px rgba(0,0,0,.18)", minHeight:700, maxHeight:900 }}>
        {children}
      </div>
    </div>
  );
}
