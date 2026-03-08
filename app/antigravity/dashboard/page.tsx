import Link from "next/link";
import { MobileScreen } from "@/components/antigravity/Scaffold";

export default function AntigravityDashboardPage() {
  return (
    <MobileScreen>
      <header className="ag-top">
        <div className="ag-brand">
          <span className="ag-brand-dot" />
          MyFinance
        </div>
        <div className="ag-menu-btn" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="10" y1="12" x2="20" y2="12" />
            <line x1="6" y1="17" x2="20" y2="17" />
          </svg>
        </div>
      </header>

      <nav className="ag-month-scroll">
        <span className="ag-month-pill">Styczeń</span>
        <span className="ag-month-pill">Luty</span>
        <span className="ag-month-pill active">Marzec</span>
        <span className="ag-month-pill">Kwiecień</span>
      </nav>

      <main className="ag-grid">
        <section className="ag-card ag-span-2" style={{ minHeight: 190, background: "linear-gradient(180deg,#111827 0%, rgba(10,15,30,.95) 100%)" }}>
          <span className="ag-overline">Całkowite saldo</span>
          <h1 className="ag-title-xl ag-mono">42 580,00 zł</h1>
          <span className="ag-kpi up" style={{ marginTop: 10 }}>+12.5%</span>
          <div className="ag-spark-wrap" style={{ height: 62, marginTop: 18 }}>
            <svg className="ag-spark" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="agDashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,30 L0,20 C10,18 20,25 30,22 C40,19 50,10 60,12 C70,14 80,5 90,8 C95,9 100,5 100,5 L100,30 Z" fill="url(#agDashGrad)" />
              <path d="M0,20 C10,18 20,25 30,22 C40,19 50,10 60,12 C70,14 80,5 90,8 C95,9 100,5 100,5" fill="none" stroke="#6366F1" strokeWidth="2" />
            </svg>
          </div>
        </section>

        <section className="ag-card">
          <span className="ag-overline">Przychody</span>
          <h2 className="ag-title-lg ag-mono">8 450 zł</h2>
          <span className="ag-kpi up" style={{ marginTop: 8 }}>+4.2%</span>
        </section>

        <section className="ag-card">
          <span className="ag-overline">Wydatki</span>
          <h2 className="ag-title-lg ag-mono">3 210 zł</h2>
          <span className="ag-kpi down" style={{ marginTop: 8 }}>+1.8%</span>
        </section>

        <section className="ag-card ag-span-2">
          <div className="ag-inline-row">
            <span className="ag-overline">Kalkulator Wypłat</span>
            <span className="ag-text-xs" style={{ color: "#6366F1" }}>16-31 aktywne</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 12 }}>
            <div className="ag-card" style={{ padding: 8, borderRadius: 10, background: "rgba(255,255,255,.03)" }}>
              <span className="ag-text-xs">1-15</span>
              <p className="ag-mono" style={{ marginTop: 4, fontSize: 13, fontWeight: 600 }}>4 200 zł</p>
            </div>
            <div className="ag-card" style={{ padding: 8, borderRadius: 10, background: "rgba(99,102,241,.12)", borderColor: "rgba(99,102,241,.4)" }}>
              <span className="ag-text-xs">16-31</span>
              <p className="ag-mono" style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: "#a5b4fc" }}>4 250 zł</p>
            </div>
            <div className="ag-card" style={{ padding: 8, borderRadius: 10, background: "rgba(255,255,255,.03)" }}>
              <span className="ag-text-xs">Bonus</span>
              <p className="ag-mono" style={{ marginTop: 4, fontSize: 13, fontWeight: 600 }}>+500</p>
            </div>
          </div>
        </section>

        <section className="ag-card ag-span-2">
          <div className="ag-inline-row">
            <span className="ag-overline">Ostatnie transakcje</span>
            <Link href="/antigravity/transactions" className="ag-text-xs" style={{ color: "#6366F1", textDecoration: "none" }}>Zobacz wszystko</Link>
          </div>
          <div className="ag-list">
            <article className="ag-item">
              <div className="ag-item-main">
                <div className="ag-item-ico">🛍️</div>
                <div>
                  <p className="ag-item-name">Lidl Market</p>
                  <p className="ag-item-meta">Spożywcze • Dzisiaj</p>
                </div>
              </div>
              <span className="ag-amount minus">-142,50 zł</span>
            </article>
            <article className="ag-item">
              <div className="ag-item-main">
                <div className="ag-item-ico">⛽</div>
                <div>
                  <p className="ag-item-name">Orlen Paliwo</p>
                  <p className="ag-item-meta">Transport • Wczoraj</p>
                </div>
              </div>
              <span className="ag-amount minus">-230,00 zł</span>
            </article>
            <article className="ag-item">
              <div className="ag-item-main">
                <div className="ag-item-ico">💼</div>
                <div>
                  <p className="ag-item-name">Wynagrodzenie</p>
                  <p className="ag-item-meta">Przelew • 10 Mar</p>
                </div>
              </div>
              <span className="ag-amount plus">+8 450,00 zł</span>
            </article>
          </div>
        </section>

        <section className="ag-card">
          <span className="ag-overline">Inwestycje</span>
          <h2 className="ag-title-lg" style={{ color: "#06B6D4" }}>+18%</h2>
          <p className="ag-text-sm">Roczny zwrot</p>
        </section>

        <section className="ag-card">
          <span className="ag-overline">Oszczędności</span>
          <h2 className="ag-title-lg">12k</h2>
          <p className="ag-text-sm">Cel: 20k zł</p>
          <div className="ag-progress" style={{ marginTop: 8 }}><span style={{ width: "60%", background: "#6366F1" }} /></div>
        </section>
      </main>
    </MobileScreen>
  );
}
