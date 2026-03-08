import { DesktopScreen, LabLinks } from "@/components/antigravity/Scaffold";

export default function AntigravityIndexPage() {
  return (
    <DesktopScreen>
      <header className="ag-guide-header">
        <div>
          <div className="ag-guide-title">
            <div className="ag-brand-dot" />
            <h1>Antigravity Lab</h1>
          </div>
          <p className="ag-text-sm" style={{ marginTop: 8 }}>
            Komplet widoków UI odtworzonych z dostarczonych makiet HTML.
          </p>
        </div>
      </header>

      <section className="ag-guide-section">
        <h3>Nawigacja widoków</h3>
        <LabLinks />
      </section>
    </DesktopScreen>
  );
}
