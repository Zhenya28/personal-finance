import { MobileScreen } from "@/components/antigravity/Scaffold";

const today = [
  { icon: "🚕", name: "Uber Poland", meta: "Transport • 14:20", amount: "-24,50 zł", color: "#F43F5E" },
  { icon: "☕", name: "Starbucks Coffee", meta: "Jedzenie • 09:15", amount: "-18,00 zł", color: "#06B6D4" },
];

const yesterday = [
  { icon: "💸", name: "Przelew przychodzący", meta: "Wynagrodzenie • 16 Mar", amount: "+5 400,00 zł", positive: true, color: "#10B981" },
  { icon: "🎬", name: "Netflix Subscription", meta: "Rozrywka • 16 Mar", amount: "-43,00 zł", color: "#6366F1" },
  { icon: "🛒", name: "Biedronka Sklep", meta: "Zakupy • 16 Mar", amount: "-124,60 zł", color: "#F59E0B" },
];

export default function AntigravityTransactionsPage() {
  return (
    <MobileScreen fab={false}>
      <header className="ag-top" style={{ marginBottom: 14 }}>
        <button className="ag-menu-btn" aria-label="Wstecz">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>Transakcje</h2>
        <span style={{ width: 40 }} />
      </header>

      <div className="ag-search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#6B7280" }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input placeholder="Szukaj transakcji..." />
      </div>

      <div className="ag-filters">
        <span className="ag-filter active">Wszystkie</span>
        <span className="ag-filter">Kategorie</span>
        <span className="ag-filter">Data: Marzec</span>
        <span className="ag-filter">Typ: Wydatki</span>
      </div>

      <section style={{ marginBottom: 18 }}>
        <p className="ag-overline" style={{ marginBottom: 10 }}>Dzisiaj</p>
        <div className="ag-card" style={{ padding: 0 }}>
          {today.map((item, idx) => (
            <article key={item.name} className="ag-item" style={{ padding: 16, borderBottom: idx === today.length - 1 ? "none" : "1px solid rgba(255,255,255,.08)" }}>
              <div className="ag-item-main">
                <div className="ag-item-ico" style={{ color: item.color }}>{item.icon}</div>
                <div>
                  <p className="ag-item-name">{item.name}</p>
                  <p className="ag-item-meta">{item.meta}</p>
                </div>
              </div>
              <span className="ag-amount minus">{item.amount}</span>
            </article>
          ))}
        </div>
      </section>

      <section>
        <p className="ag-overline" style={{ marginBottom: 10 }}>Wczoraj</p>
        <div className="ag-card" style={{ padding: 0 }}>
          {yesterday.map((item, idx) => (
            <article key={item.name} className="ag-item" style={{ padding: 16, borderBottom: idx === yesterday.length - 1 ? "none" : "1px solid rgba(255,255,255,.08)" }}>
              <div className="ag-item-main">
                <div className="ag-item-ico" style={{ color: item.color }}>{item.icon}</div>
                <div>
                  <p className="ag-item-name">{item.name}</p>
                  <p className="ag-item-meta">{item.meta}</p>
                </div>
              </div>
              <span className={`ag-amount ${item.positive ? "plus" : "minus"}`}>{item.amount}</span>
            </article>
          ))}
        </div>
      </section>
    </MobileScreen>
  );
}
