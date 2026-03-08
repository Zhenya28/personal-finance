import { MobileScreen } from "@/components/antigravity/Scaffold";

export default function AntigravityExpensesPage() {
  return (
    <MobileScreen fab={false}>
      <header className="ag-top">
        <div className="ag-brand">
          <span className="ag-brand-dot" />
          Wydatki
        </div>
        <span className="ag-avatar">MK</span>
      </header>

      <section className="ag-card">
        <p className="ag-overline" style={{ marginBottom: 14 }}>Rozkład kategorii</p>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative", width: 120, height: 120 }}>
            <svg viewBox="0 0 42 42" width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#F43F5E" strokeWidth="8" strokeDasharray="40 60" />
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#06B6D4" strokeWidth="8" strokeDasharray="25 75" strokeDashoffset="-40" />
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#6366F1" strokeWidth="8" strokeDasharray="20 80" strokeDashoffset="-65" />
              <circle cx="21" cy="21" r="15.915" fill="none" stroke="#F59E0B" strokeWidth="8" strokeDasharray="10 90" strokeDashoffset="-85" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
              <div>
                <p className="ag-mono" style={{ fontSize: 16, fontWeight: 700 }}>8.2k</p>
                <p className="ag-overline" style={{ fontSize: 9 }}>PLN</p>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, display: "grid", gap: 8, fontSize: 12 }}>
            {[["Jedzenie", "40%", "#F43F5E"], ["Transport", "25%", "#06B6D4"], ["Rozrywka", "20%", "#6366F1"], ["Rachunki", "10%", "#F59E0B"]].map(([name, pct, color]) => (
              <div key={name} className="ag-inline-row">
                <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: color as string, marginRight: 6 }} />{name}</span>
                <span className="ag-text-sm">{pct}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ag-card">
        <p className="ag-overline" style={{ marginBottom: 10 }}>Wydatki powtarzalne</p>
        {["Netflix 4K", "Siłownia"].map((name, idx) => (
          <div key={name} className="ag-inline-row" style={{ padding: "10px 0", borderBottom: idx === 0 ? "1px solid rgba(255,255,255,.08)" : "none" }}>
            <div>
              <p className="ag-item-name">{name}</p>
              <p className="ag-item-meta">Co miesiąc • {idx === 0 ? "15.03" : "01.03"}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="ag-mono" style={{ fontSize: 13 }}>{idx === 0 ? "-60,00" : "-149,00"}</span>
              <span style={{ width: 36, height: 20, borderRadius: 99, background: "#6366F1", display: "inline-flex", padding: 2, justifyContent: "flex-end" }}>
                <span style={{ width: 16, height: 16, borderRadius: 99, background: "white" }} />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="ag-card">
        <p className="ag-overline" style={{ marginBottom: 10 }}>Szczegółowa lista</p>
        <table className="ag-table">
          <tbody>
            {[
              ["Uber Trip", "Transport", "-32,50 zł"],
              ["Starbucks Coffee", "Jedzenie", "-18,00 zł"],
              ["Czynsz marzec", "Rachunki", "-2 400,00 zł"],
              ["Steam Games", "Rozrywka", "-89,99 zł"],
            ].map(([name, cat, value]) => (
              <tr key={name}>
                <td>
                  <p className="ag-item-name">{name}</p>
                  <span className="ag-badge">{cat}</span>
                </td>
                <td style={{ textAlign: "right" }} className="ag-mono">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </MobileScreen>
  );
}
