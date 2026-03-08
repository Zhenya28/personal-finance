import { MobileScreen } from "@/components/antigravity/Scaffold";

export default function AntigravityInvestmentsPage() {
  return (
    <MobileScreen fab={false}>
      <header className="ag-top">
        <div className="ag-brand">
          <span className="ag-brand-dot" />
          MyFinance Inwestycje
        </div>
        <span className="ag-avatar">MK</span>
      </header>

      <div className="ag-grid">
        <section className="ag-card ag-span-2" style={{ paddingBottom: 0 }}>
          <p className="ag-overline">Wartość portfela</p>
          <h1 className="ag-title-xl ag-mono">128 450,20 zł</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span className="ag-kpi up">+2 140,50 (Dziś)</span>
            <span className="ag-kpi" style={{ color: "#6366F1", background: "rgba(99,102,241,.1)" }}>+18.4% Total P&amp;L</span>
          </div>
          <div className="ag-spark-wrap" style={{ height: 118, marginTop: 20 }}>
            <svg className="ag-spark" preserveAspectRatio="none" viewBox="0 0 100 40">
              <defs>
                <linearGradient id="agInvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,35 Q15,30 30,32 T50,20 T75,10 T100,5 V40 H0 Z" fill="url(#agInvGrad)" />
              <path d="M0,35 Q15,30 30,32 T50,20 T75,10 T100,5" fill="none" stroke="#10B981" strokeWidth="2" />
            </svg>
          </div>
        </section>

        <section className="ag-card">
          <p className="ag-overline">Ryzyko (Beta)</p>
          <p className="ag-mono" style={{ marginTop: 4, fontSize: 16, fontWeight: 700 }}>0.84 <span style={{ fontSize: 10, color: "#10B981" }}>LOW</span></p>
          <div className="ag-progress" style={{ marginTop: 12 }}><span style={{ width: "35%", background: "#10B981" }} /></div>
        </section>

        <section className="ag-card">
          <p className="ag-overline">Stopa zwrotu</p>
          <p className="ag-mono" style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: "#10B981" }}>+14.2% r/r</p>
          <div className="ag-progress" style={{ marginTop: 12 }}><span style={{ width: "72%", background: "#6366F1" }} /></div>
        </section>

        <section className="ag-card ag-span-2">
          <div className="ag-inline-row" style={{ marginBottom: 10 }}>
            <p className="ag-overline">Twoje pozycje</p>
            <span className="ag-overline" style={{ color: "#6366F1" }}>Edytuj</span>
          </div>

          {[{ t: "VUSA.L", sub: "S&P 500 ETF • 42 szt.", value: "14 230,00", pct: "+1.24%", color: "#10B981" },
            { t: "AAPL.US", sub: "Apple Inc • 12 szt.", value: "8 120,40", pct: "-0.45%", color: "#F43F5E" },
            { t: "VWRL.AS", sub: "All-World ETF • 85 szt.", value: "38 900,10", pct: "+2.10%", color: "#10B981" }].map((asset, idx) => (
            <article key={asset.t} className="ag-inline-row" style={{ padding: "11px 0", borderBottom: idx === 2 ? "none" : "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ minWidth: 0 }}>
                <p className="ag-item-name">{asset.t}</p>
                <p className="ag-item-meta">{asset.sub}</p>
              </div>
              <svg viewBox="0 0 50 20" width="60" height="24" style={{ margin: "0 12px" }}>
                <path d={idx === 1 ? "M0,5 L15,18 L30,12 L50,15" : idx === 0 ? "M0,15 L10,12 L20,16 L30,8 L40,10 L50,5" : "M0,18 Q15,15 25,10 T50,2"} fill="none" stroke={asset.color} strokeWidth="1.5" />
              </svg>
              <div style={{ textAlign: "right" }}>
                <p className="ag-mono" style={{ fontSize: 13 }}>{asset.value}</p>
                <p className="ag-text-xs" style={{ color: asset.color }}>{asset.pct}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </MobileScreen>
  );
}
