import { MobileScreen } from "@/components/antigravity/Scaffold";

export default function AntigravityIncomePage() {
  return (
    <MobileScreen fab={false}>
      <header className="ag-top">
        <div className="ag-brand">
          <span className="ag-brand-dot" />
          Przychody
        </div>
        <span className="ag-month-pill active">Marzec 2024</span>
      </header>

      <section className="ag-card" style={{ background: "linear-gradient(180deg,#111827 0%, #0A0F1E 100%)" }}>
        <p className="ag-overline">Suma przychodów</p>
        <h1 className="ag-title-xl ag-mono" style={{ color: "#10B981" }}>+18 450,00 zł</h1>
        <div className="ag-spark-wrap" style={{ height: 120, marginTop: 12 }}>
          <svg className="ag-spark" preserveAspectRatio="none" viewBox="0 0 100 40">
            <defs>
              <linearGradient id="agIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,35 Q15,38 30,20 T60,25 T100,5 L100,40 L0,40 Z" fill="url(#agIncomeGrad)" />
            <path d="M0,35 Q15,38 30,20 T60,25 T100,5" fill="none" stroke="#10B981" strokeWidth="2" />
          </svg>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 16 }}>
        {["Wypłata 1", "Wypłata 2", "Inne"].map((label, idx) => (
          <div key={label} className="ag-card" style={{ padding: 12, borderRadius: 12, textAlign: "left", background: "rgba(255,255,255,.03)" }}>
            <p className="ag-overline">{label}</p>
            <p className="ag-mono" style={{ marginTop: 4, fontSize: 14, fontWeight: 600 }}>{["8 200 zł", "7 500 zł", "2 750 zł"][idx]}</p>
          </div>
        ))}
      </div>

      <section className="ag-card">
        <div className="ag-inline-row" style={{ marginBottom: 12 }}>
          <p className="ag-overline">Historia wpływów</p>
          <span className="ag-overline" style={{ color: "#6366F1" }}>Filtruj</span>
        </div>
        <div className="ag-list" style={{ gap: 12 }}>
          <article className="ag-item" style={{ borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 12 }}>
            <div className="ag-item-main">
              <div className="ag-item-ico" style={{ color: "#10B981" }}>↗</div>
              <div>
                <p className="ag-item-name">Wypłata Marzec (1/2)</p>
                <p className="ag-item-meta">12 Mar 2024 • TechCorp SA</p>
              </div>
            </div>
            <span className="ag-amount plus">+8 200,00</span>
          </article>
          <article className="ag-item" style={{ borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 12 }}>
            <div className="ag-item-main">
              <div className="ag-item-ico" style={{ color: "#06B6D4" }}>◎</div>
              <div>
                <p className="ag-item-name">Dywidenda</p>
                <p className="ag-item-meta">08 Mar 2024 • Broker</p>
              </div>
            </div>
            <span className="ag-amount plus">+1 250,00</span>
          </article>
          <article className="ag-item">
            <div className="ag-item-main">
              <div className="ag-item-ico" style={{ color: "#10B981" }}>↗</div>
              <div>
                <p className="ag-item-name">Bonus roczny</p>
                <p className="ag-item-meta">01 Mar 2024 • TechCorp SA</p>
              </div>
            </div>
            <span className="ag-amount plus">+1 500,00</span>
          </article>
        </div>
      </section>
    </MobileScreen>
  );
}
