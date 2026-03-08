import type { CSSProperties } from "react";
import { MobileScreen } from "@/components/antigravity/Scaffold";

export default function AntigravityCalculatorPage() {
  return (
    <MobileScreen fab={false}>
      <header className="ag-top" style={{ marginBottom: 16 }}>
        <button className="ag-menu-btn" aria-label="Wstecz">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Kalkulator Wypłat</h2>
        <span style={{ width: 40 }} />
      </header>

      <section className="ag-card">
        <p className="ag-overline" style={{ marginBottom: 12 }}>Okres I (1-15 Marzec)</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="ag-overline">Godziny</span>
            <input defaultValue={84} className="ag-input" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="ag-overline">Stawka (zł/h)</span>
            <input defaultValue={35} className="ag-input" style={inputStyle} />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <span className="ag-text-sm ag-mono">Suma: 2 940,00 zł</span>
        </div>
      </section>

      <section className="ag-card">
        <p className="ag-overline" style={{ marginBottom: 12 }}>Okres II (16-31 Marzec)</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="ag-overline">Godziny</span>
            <input placeholder="0" className="ag-input" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="ag-overline">Stawka (zł/h)</span>
            <input defaultValue={35} className="ag-input" style={inputStyle} />
          </label>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <span className="ag-text-sm ag-mono" style={{ color: "#6366F1" }}>W trakcie...</span>
        </div>
      </section>

      <section className="ag-card" style={{ background: "linear-gradient(180deg, rgba(99,102,241,.07) 0%, rgba(17,24,39,1) 100%)" }}>
        <p className="ag-overline">Podsumowanie miesiąca</p>
        <h1 className="ag-title-xl ag-mono" style={{ marginBottom: 8 }}>2 940,00 zł</h1>

        <div style={{ display: "grid", gap: 8 }}>
          {[["Przepracowane godziny", "84h"], ["Średnia stawka", "35,00 zł"], ["Prognoza do końca", "+3 100,00 zł"]].map(([k, v], idx) => (
            <div key={k} className="ag-inline-row" style={{ paddingBottom: 8, borderBottom: idx === 2 ? "none" : "1px solid rgba(255,255,255,.08)" }}>
              <span className="ag-text-sm">{k}</span>
              <span className="ag-text-sm ag-mono" style={{ color: idx === 2 ? "#10B981" : "#fff" }}>{v}</span>
            </div>
          ))}
        </div>

        <button style={{ marginTop: 10, width: "100%", border: 0, borderRadius: 12, padding: "15px 14px", fontWeight: 600, fontSize: 15, background: "#fff", color: "#0A0F1E" }}>
          ZAMKNIJ MIESIĄC
        </button>
      </section>

      <section>
        <p className="ag-overline" style={{ margin: "8px 0 10px 4px" }}>Historia rozliczeń</p>
        <div className="ag-card" style={{ paddingTop: 8, paddingBottom: 8 }}>
          {["Luty 2024", "Styczeń 2024", "Grudzień 2023"].map((month, idx) => (
            <article key={month} className="ag-inline-row" style={{ padding: "12px 0", borderBottom: idx === 2 ? "none" : "1px solid rgba(255,255,255,.08)" }}>
              <div>
                <p className="ag-item-name">{month} <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(16,185,129,.1)", color: "#10B981", fontWeight: 700 }}>WYPŁACONE</span></p>
                <p className="ag-item-meta">{["168h • 32.50 zł/h", "176h • 32.50 zł/h", "152h • 30.00 zł/h"][idx]}</p>
              </div>
              <span className="ag-mono" style={{ fontSize: 16, fontWeight: 600 }}>{["5 460,00", "5 720,00", "4 560,00"][idx]}</span>
            </article>
          ))}
        </div>
      </section>
    </MobileScreen>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid rgba(255,255,255,.08)",
  background: "rgba(255,255,255,.03)",
  borderRadius: 8,
  color: "white",
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "SF Mono, Menlo, monospace",
};
