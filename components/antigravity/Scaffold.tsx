import type { ReactNode } from "react";
import Link from "next/link";

export function AuroraBackground() {
  return (
    <div className="ag-aurora" aria-hidden>
      <div className="ag-blob b1" />
      <div className="ag-blob b2" />
      <div className="ag-blob b3" />
    </div>
  );
}

export function MobileScreen({ children, fab = true, lightFab = false }: { children: ReactNode; fab?: boolean; lightFab?: boolean }) {
  return (
    <div className="ag-screen">
      <AuroraBackground />
      <div className="ag-mobile">{children}</div>
      {fab ? <button className={`ag-fab ${lightFab ? "light" : ""}`.trim()} aria-label="Dodaj">+</button> : null}
    </div>
  );
}

export function DesktopScreen({ children }: { children: ReactNode }) {
  return (
    <div className="ag-screen">
      <AuroraBackground />
      <div className="ag-desktop">{children}</div>
    </div>
  );
}

export function LabLinks() {
  const links = [
    ["/antigravity/design-guide", "Design Guide", "System wizualny"],
    ["/antigravity/dashboard", "Dashboard", "Główny widok mobilny"],
    ["/antigravity/transactions", "Transakcje", "Lista + filtry"],
    ["/antigravity/income", "Przychody", "Historia wpływów"],
    ["/antigravity/expenses", "Wydatki", "Kategorie i recurring"],
    ["/antigravity/savings", "Oszczędności", "Cele i waluty"],
    ["/antigravity/investments", "Inwestycje", "Portfel i pozycje"],
    ["/antigravity/calculator", "Kalkulator", "Rozliczenia miesięczne"],
  ] as const;

  return (
    <div className="ag-link-grid">
      {links.map(([href, title, subtitle]) => (
        <Link key={href} href={href} className="ag-link-card">
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </Link>
      ))}
    </div>
  );
}
