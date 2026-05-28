"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileSpreadsheet,
  Check,
  ArrowRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { parseMBankCSV, buildSearchableDescription } from "@/lib/mbank-parser";
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS, formatPLN } from "@/lib/utils";
import { bulkImportTransactions } from "@/actions/import";
import {
  matchCategory,
  matchCategoriesBulk,
  type MatchedCategory,
} from "@/actions/category-rules";
import { toast } from "sonner";

type RowCategorySource = MatchedCategory["source"] | "manual";

interface ParsedRow {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  categorySource: RowCategorySource;
  selected: boolean;
}

const expenseCategories = Object.entries(EXPENSE_CATEGORY_LABELS);
const incomeCategories = Object.entries(INCOME_CATEGORY_LABELS);
const SOURCE_LABELS: Record<RowCategorySource, string> = {
  ai: "AI",
  heuristic: "Heurystyka",
  default: "Domyslna",
  manual: "Recznie",
};

export function CsvImporter() {
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ imported: number; incomes: number; expenses: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    try {
      const text = await decodeCsvText(file);
      const transactions = parseMBankCSV(text);

      if (transactions.length === 0) {
        toast.error("Nie znaleziono transakcji w pliku");
        return;
      }

      const parsed: ParsedRow[] = transactions.map((tx, i) => ({
        id: i,
        date: tx.dateOperation || tx.dateAccounting,
        description: buildSearchableDescription(tx),
        amount: tx.amount,
        type: tx.type,
        category: tx.type === "expense" ? "OTHER" : "INNE",
        categorySource: "default",
        selected: true,
      }));

      const classifyToast = toast.loading("Analizuje kategorie (AI + heurystyka)...");
      try {
        const matches = await matchCategoriesBulk(
          parsed.map((row) => ({
            description: row.description,
            type: row.type,
            date: row.date,
          }))
        );

        for (let i = 0; i < parsed.length; i++) {
          const match = matches[i];
          if (!match) continue;
          parsed[i] = {
            ...parsed[i],
            category: match.category,
            categorySource: match.source,
          };
        }

        const sourceCount = matches.reduce<Record<MatchedCategory["source"], number>>(
          (acc, item) => {
            acc[item.source] += 1;
            return acc;
          },
          { ai: 0, heuristic: 0, default: 0 }
        );

        toast.success(
          `Auto-kategoryzacja: AI ${sourceCount.ai}, heurystyka ${sourceCount.heuristic}`,
          { id: classifyToast }
        );
      } catch {
        toast.error("Nie udalo sie auto-kategoryzowac. Mozesz ustawic kategorie recznie.", {
          id: classifyToast,
        });
      }

      setRows(parsed);
      setStep("preview");
      toast.success(`Znaleziono ${parsed.length} transakcji`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Blad parsowania CSV");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        handleFile(file);
      } else {
        toast.error("Wybierz plik CSV");
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  function toggleRow(id: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)));
  }

  function toggleAll() {
    const allSelected = rows.every((r) => r.selected);
    setRows((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  }

  function updateCategory(id: number, category: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, category, categorySource: "manual" } : r
      )
    );
  }

  async function updateType(id: number, type: "income" | "expense") {
    const current = rows.find((r) => r.id === id);
    if (!current) return;

    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              type,
              category: type === "expense" ? "OTHER" : "INNE",
              categorySource: "default",
            }
          : r
      )
    );

    try {
      const matched = await matchCategory(current.description, type, current.date);
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                type,
                category: matched.category,
                categorySource: matched.source,
              }
            : r
        )
      );
    } catch {
      // Keep default category when server action fails.
    }
  }

  async function handleImport() {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) {
      toast.error("Zaznacz transakcje do importu");
      return;
    }

    setStep("importing");

    try {
      const res = await bulkImportTransactions(
        selected.map((r) => ({
          date: r.date,
          amount: r.amount,
          description: r.description,
          category: r.category,
          type: r.type,
        }))
      );
      setResult(res);
      setStep("done");
      toast.success(`Zaimportowano ${res.imported} transakcji`);
    } catch {
      toast.error("Blad importu");
      setStep("preview");
    }
  }

  function reset() {
    setRows([]);
    setResult(null);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const selectedCount = rows.filter((r) => r.selected).length;
  const selectedIncome = rows.filter((r) => r.selected && r.type === "income").reduce((s, r) => s + r.amount, 0);
  const selectedExpense = rows.filter((r) => r.selected && r.type === "expense").reduce((s, r) => s + r.amount, 0);

  // ─── Upload step ──────────────────────────────────────
  if (step === "upload") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10">
              <Upload className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Import z mBank</h3>
              <p className="text-xs text-muted-foreground">Wgraj plik CSV z historii transakcji</p>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-11 transition-colors cursor-pointer
              ${dragActive ? "border-blue-500 bg-blue-500/5" : "border-border hover:border-muted-foreground/30"}
            `}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground/40" />
            <div className="text-center">
              <p className="text-sm font-medium">Przeciagnij plik CSV tutaj</p>
              <p className="text-xs text-muted-foreground mt-1">
                lub kliknij aby wybrac plik z mBank
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
            mBank → Historia → Eksportuj do CSV
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─── Importing step ───────────────────────────────────
  if (step === "importing") {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-sm font-medium">Importowanie {selectedCount} transakcji...</p>
        </CardContent>
      </Card>
    );
  }

  // ─── Done step ────────────────────────────────────────
  if (step === "done" && result) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Check className="h-7 w-7 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">Import zakonczony</p>
            <p className="text-sm text-muted-foreground mt-1">
              {result.incomes} przychodow + {result.expenses} wydatkow
            </p>
          </div>
          <Button onClick={reset} variant="outline" className="mt-2">
            Importuj kolejny plik
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─── Preview step ─────────────────────────────────────
  return (
    <Card className="overflow-hidden">
      <CardContent className="px-0 pt-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pb-5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10">
              <FileSpreadsheet className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Podglad transakcji</h3>
              <p className="text-xs text-muted-foreground">
                {selectedCount} z {rows.length} zaznaczonych
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-semibold">
              +{formatPLN(selectedIncome)}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-red-400 font-semibold">
              -{formatPLN(selectedExpense)}
            </span>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex flex-wrap items-center gap-2 px-4 pb-4 sm:px-5">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={toggleAll}>
            {rows.every((r) => r.selected) ? "Odznacz wszystko" : "Zaznacz wszystko"}
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={reset}>
            <Trash2 className="h-3 w-3 mr-1" /> Anuluj
          </Button>
          <div className="flex-1" />
          <Button size="sm" className="h-8" onClick={handleImport} disabled={selectedCount === 0}>
            <ArrowRight className="h-3.5 w-3.5 mr-1" />
            Importuj {selectedCount} transakcji
          </Button>
        </div>

        {/* Transaction list */}
        <div className="max-h-[62vh] divide-y divide-border overflow-y-auto">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`flex items-start gap-2 px-4 py-3.5 transition-colors sm:items-center sm:gap-3 sm:px-5 ${
                row.selected ? "bg-background" : "bg-muted/30 opacity-60"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleRow(row.id)}
                className={`mt-0.5 sm:mt-0 shrink-0 h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                  row.selected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border"
                }`}
              >
                {row.selected && <Check className="h-3 w-3" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
                {/* Date */}
                <span className="text-[10px] sm:text-xs font-medium tabular-nums shrink-0 w-20">
                  {row.date}
                </span>

                {/* Type toggle */}
                <button
                  onClick={() => updateType(row.id, row.type === "expense" ? "income" : "expense")}
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                    row.type === "income"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {row.type === "income" ? "PRZYCHOD" : "WYDATEK"}
                </button>

                {/* Description */}
                <span className="text-xs text-muted-foreground truncate block sm:inline min-w-0">
                  {row.description}
                </span>
              </div>

              {/* Right side: amount + category */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 shrink-0">
                <span
                  className={`text-xs sm:text-sm font-semibold tabular-nums ${
                    row.type === "income"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {row.type === "income" ? "+" : "-"}{formatPLN(row.amount)}
                </span>

                <div className="flex items-center gap-1">
                  <span className="hidden min-w-16 text-right text-[10px] text-muted-foreground sm:inline">
                    {SOURCE_LABELS[row.categorySource]}
                  </span>
                  <Select
                    value={row.category}
                    onValueChange={(val) => updateCategory(row.id, val)}
                  >
                    <SelectTrigger className="h-7 w-28 sm:w-36 text-[10px] sm:text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(row.type === "expense" ? expenseCategories : incomeCategories).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value} className="text-xs">
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-1">
          <p className="text-[10px] text-muted-foreground/60">Sprawdz kategorie i zaznaczenie pozycji przed finalnym importem.</p>
          <Button size="sm" className="h-8" onClick={handleImport} disabled={selectedCount === 0}>
            Importuj {selectedCount}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

async function decodeCsvText(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const utf8 = new TextDecoder("utf-8").decode(bytes);

  const utf8BadChars = (utf8.match(/\uFFFD/g) || []).length;
  if (utf8BadChars === 0) return utf8;

  // mBank exports are often in Windows-1250; fallback if UTF-8 looks broken.
  try {
    const cp1250 = new TextDecoder("windows-1250").decode(bytes);
    const cp1250BadChars = (cp1250.match(/\uFFFD/g) || []).length;
    return cp1250BadChars < utf8BadChars ? cp1250 : utf8;
  } catch {
    return utf8;
  }
}
