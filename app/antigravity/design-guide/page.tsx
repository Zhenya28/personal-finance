import Link from "next/link";
import { DesktopScreen } from "@/components/antigravity/Scaffold";

export default function AntigravityDesignGuidePage() {
  return (
    <DesktopScreen>
      <header className="ag-guide-header">
        <div>
          <div className="ag-guide-title">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2L2 22H22L12 2Z" fill="url(#logo-gradient)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 6L16 18H8L12 6Z" fill="#0A0F1E" />
              <defs>
                <linearGradient id="logo-gradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <h1>Antigravity</h1>
          </div>
          <p className="ag-text-sm" style={{ marginTop: 8 }}>Personal Finance, Elevated.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p className="ag-overline">Design System</p>
          <p className="ag-text-sm">v1.0 • 2024</p>
        </div>
      </header>

      <main className="ag-guide-grid">
        <section className="ag-guide-section">
          <h3>01. Color Palette</h3>
          <div className="row"><span>Slate BG</span><code>#0A0F1E</code></div>
          <div className="row"><span>Card BG</span><code>#111827</code></div>
          <div className="row"><span>Indigo</span><code>#6366F1</code></div>
          <div className="row"><span>Cyan</span><code>#06B6D4</code></div>
          <div className="row"><span>Emerald</span><code>#10B981</code></div>
          <div className="row"><span>Red</span><code>#F87171</code></div>
        </section>

        <section className="ag-guide-section">
          <h3>02. Typography</h3>
          <div className="row"><span style={{ fontSize: 40, fontWeight: 700 }}>Display</span><code>48px</code></div>
          <div className="row"><span style={{ fontSize: 30, fontWeight: 600 }}>Heading 1</span><code>32px</code></div>
          <div className="row"><span style={{ fontSize: 22, fontWeight: 500 }}>Heading 2</span><code>24px</code></div>
          <div className="row"><span>Body text aligns here.</span><code>14px</code></div>
          <div className="row"><span className="ag-overline">Caption</span><code>12px</code></div>
        </section>

        <section className="ag-guide-section">
          <h3>03. Components</h3>
          <button style={{ border: 0, borderRadius: 10, padding: "10px 14px", background: "#6366F1", color: "white", fontWeight: 600, marginRight: 8 }}>Primary</button>
          <button style={{ border: "1px solid rgba(255,255,255,.14)", borderRadius: 10, padding: "10px 14px", background: "rgba(255,255,255,.08)", color: "white" }}>Secondary</button>
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            <div className="row"><span>Badge Gain</span><span style={{ color: "#10B981" }}>+24.5%</span></div>
            <div className="row"><span>Badge Loss</span><span style={{ color: "#F87171" }}>-12.2%</span></div>
            <div className="row"><span>Badge Pending</span><span style={{ color: "#9CA3AF" }}>Pending</span></div>
          </div>
        </section>
      </main>

      <footer style={{ marginTop: 28, borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 18, display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: 12 }}>
        <span>© 2024 Antigravity Finance Inc.</span>
        <Link href="/antigravity" style={{ color: "#9ca3af", textDecoration: "none" }}>Powrót do listy</Link>
      </footer>
    </DesktopScreen>
  );
}
