import { MobileScreen } from "@/components/antigravity/Scaffold";

export default function AntigravitySavingsPage() {
  return (
    <MobileScreen lightFab>
      <header className="ag-top">
        <div className="ag-brand">
          <span className="ag-brand-dot" />
          Oszczędności
        </div>
        <span className="ag-avatar">MK</span>
      </header>

      <section className="ag-card" style={{ paddingBottom: 10 }}>
        <p className="ag-overline">Suma oszczędności (PLN)</p>
        <h1 className="ag-title-xl ag-mono">78 420,00 zł</h1>
        <div className="ag-spark-wrap" style={{ height: 120, marginTop: 14 }}>
          <svg className="ag-spark" preserveAspectRatio="none" viewBox="0 0 100 40">
            <defs>
              <linearGradient id="agSavingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,35 Q15,30 30,32 T55,20 T80,15 T100,5 V40 H0 Z" fill="url(#agSavingsGrad)" />
            <path d="M0,35 Q15,30 30,32 T55,20 T80,15 T100,5" fill="none" stroke="#10B981" strokeWidth="2" />
          </svg>
        </div>
        <div className="ag-inline-row" style={{ marginTop: 8, fontSize: 11, color: "#6B7280" }}>
          {"WRZ PAŹ LIS GRU STY LUT MAR".split(" ").map((m) => <span key={m}>{m}</span>)}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 16 }}>
        {[["🇵🇱", "PLN", "45 200"], ["🇪🇺", "EUR", "6 450"], ["🇺🇸", "USD", "1 280"]].map(([flag, c, amount]) => (
          <div key={c} className="ag-card" style={{ borderRadius: 12, padding: 12, textAlign: "center", background: "rgba(255,255,255,.03)" }}>
            <div style={{ width: 24, height: 24, borderRadius: 99, margin: "0 auto 8px", display: "grid", placeItems: "center", background: "rgba(255,255,255,.1)" }}>{flag}</div>
            <p className="ag-overline">{c}</p>
            <p className="ag-mono" style={{ marginTop: 4, fontSize: 13 }}>{amount}</p>
          </div>
        ))}
      </div>

      <section className="ag-card">
        <div className="ag-inline-row" style={{ marginBottom: 14 }}>
          <p className="ag-overline">Cele oszczędnościowe</p>
          <span className="ag-overline" style={{ color: "#6366F1" }}>Edytuj</span>
        </div>

        {[{ name: "Nowy Dom", current: "125k", target: "350k zł", w: "35.7%", hint: "Pozostało: 225 000 zł • 36 miesięcy", fill: "linear-gradient(90deg,#6366F1,#06B6D4)" },
          { name: "Wakacje 2024", current: "12,4k", target: "15k zł", w: "82.6%", hint: "Cel blisko realizacji! Brakuje 2 600 zł", fill: "linear-gradient(90deg,#10B981,#D1FAE5)" },
          { name: "Poduszka Bezp.", current: "25k", target: "25k zł", w: "100%", hint: "Cel osiągnięty! ✨", fill: "#10B981" }].map((goal, idx) => (
          <article key={goal.name} style={{ marginBottom: idx === 2 ? 0 : 18 }}>
            <div className="ag-inline-row" style={{ marginBottom: 8 }}>
              <p className="ag-item-name">{goal.name}</p>
              <p className="ag-text-sm ag-mono">{goal.current} / {goal.target}</p>
            </div>
            <div className="ag-progress"><span style={{ width: goal.w, background: goal.fill }} /></div>
            <p className="ag-text-xs" style={{ marginTop: 6, color: idx === 2 ? "#10B981" : "#6B7280" }}>{goal.hint}</p>
          </article>
        ))}
      </section>
    </MobileScreen>
  );
}
