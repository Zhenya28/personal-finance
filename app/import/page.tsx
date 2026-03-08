import { FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { CsvImporter } from "@/components/import/CsvImporter";
import { FadeInSection } from "@/components/ui/motion-wrappers";
import { Card, CardContent } from "@/components/ui/card";

export const revalidate = 0;

export default function ImportPage() {
  return (
    <div className="ag-page">
      <div className="ag-toolbar">
        <h1 className="ag-toolbar-title">Import CSV</h1>
      </div>

      <FadeInSection>
        <div className="ag-card">
          <p className="ag-overline">Import transakcji</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white">
            Wgraj plik CSV z mBank
          </h2>
          <p className="mt-2 text-sm text-white/65">
            Po wczytaniu pliku system proponuje kategorie (AI + reguly + heurystyki).
            Przed zapisem mozesz recznie poprawic kazda pozycje.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3.5">
              <p className="ag-overline">Krok 1</p>
              <p className="mt-1 text-sm font-semibold text-white">Upload CSV</p>
              <p className="mt-0.5 text-[11px] text-white/55">wczytanie pliku</p>
            </div>
            <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3.5">
              <p className="ag-overline">Krok 2</p>
              <p className="mt-1 text-sm font-semibold text-white">Auto-kategoryzacja</p>
              <p className="mt-0.5 text-[11px] text-white/55">AI + reguly + heurystyki</p>
            </div>
            <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3.5">
              <p className="ag-overline">Krok 3</p>
              <p className="mt-1 text-sm font-semibold text-white">Weryfikacja i import</p>
              <p className="mt-0.5 text-[11px] text-white/55">korekta i zapis do aplikacji</p>
            </div>
          </div>
        </div>
      </FadeInSection>

      <div className="grid items-start gap-7 xl:grid-cols-[1.2fr_0.8fr]">
        <FadeInSection delay={0.1}>
          <CsvImporter />
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <Card className="overflow-hidden">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                  <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Wskazowki CSV</h3>
                  <p className="text-xs text-muted-foreground">Tryb mieszany</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Sprawdz sugestie AI
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    System proponuje kategorie, ale zawsze warto potwierdzic typ i opis.
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Popraw tylko rozjazdy
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Najczesciej wystarczy korekta kilku pozycji przed finalnym zapisem.
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Importuj tylko zaznaczone
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Mozesz odznaczyc pozycje testowe, duplikaty lub niechciane wpisy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeInSection>
      </div>
    </div>
  );
}
