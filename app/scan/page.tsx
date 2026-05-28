"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
  formatPLN,
} from "@/lib/utils";
import { toast } from "sonner";
import {
  ScanLine,
  Upload,
  ImageIcon,
  Loader2,
  Check,
  X,
  Trash2,
  Sparkles,
} from "lucide-react";

interface Transaction {
  amount: number;
  category: string;
  description: string;
  date: string;
}

type ScanType = "income" | "expense";

export default function ScanPage() {
  const [type, setType] = useState<ScanType>("expense");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scanned, setScanned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const categoryLabels =
    type === "income" ? INCOME_CATEGORY_LABELS : EXPENSE_CATEGORY_LABELS;
  const categoryKeys = Object.keys(categoryLabels);

  const handleImageSelect = useCallback(
    (file: File) => {
      setImage(file);
      setTransactions([]);
      setScanned(false);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    },
    [imagePreview]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) handleImageSelect(file);
        }
      }
    },
    [handleImageSelect]
  );

  const handleScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("type", type);

      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || `Blad skanowania (${res.status})`);
        return;
      }

      if (data.transactions.length === 0) {
        toast.info("Nie znaleziono transakcji na obrazku");
      } else {
        toast.success(`Znaleziono ${data.transactions.length} transakcji`);
      }

      setTransactions(data.transactions);
      setScanned(true);
    } catch {
      toast.error("Blad polaczenia z serwerem");
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (transactions.length === 0) {
      toast.error("Brak transakcji do zapisania");
      return;
    }
    setSaving(true);
    try {
      const cleanTransactions = transactions.map((t) => ({
        amount: Math.abs(Number(t.amount)) || 0,
        category: t.category || (type === "income" ? "INNE" : "OTHER"),
        description: t.description || "",
        date: t.date || new Date().toISOString().split("T")[0],
      }));

      const res = await fetch("/api/scan/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({ transactions: cleanTransactions, type }),
      });

      const responseText = await res.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        toast.error(`Blad parsowania odpowiedzi`);
        return;
      }

      if (!res.ok) {
        toast.error(`Blad zapisu (${res.status}): ${data.error || "Nieznany blad"}`);
        return;
      }

      if (data.saved === 0) {
        toast.error("Zadna transakcja nie zostala zapisana");
        return;
      }

      toast.success(`Zapisano ${data.saved} ${type === "income" ? "przychodow" : "wydatkow"}!`);

      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setTransactions([]);
      setImage(null);
      setImagePreview(null);
      setScanned(false);

      setTimeout(() => {
        window.location.href = type === "income" ? "/income" : "/expenses";
      }, 1000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nieznany blad";
      toast.error(`Blad sieci: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const updateTransaction = (
    index: number,
    field: keyof Transaction,
    value: string | number
  ) => {
    setTransactions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const removeTransaction = (index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
    setTransactions([]);
    setScanned(false);
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="ag-page" onPaste={handlePaste}>
      <div className="ag-toolbar">
        <h1 className="ag-toolbar-title">Skaner AI</h1>
        <div className="flex gap-2">
          <Button
            variant={type === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setType("expense");
              setTransactions([]);
              setScanned(false);
            }}
          >
            Wydatki
          </Button>
          <Button
            variant={type === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setType("income");
              setTransactions([]);
              setScanned(false);
            }}
          >
            Przychody
          </Button>
        </div>
      </div>

      <div className="ag-card">
        <div className="ag-inline-row">
          <p className="ag-overline">Vision Assistant</p>
          <span className="ag-pill">
            <Sparkles className="h-3.5 w-3.5" />
            {type === "income" ? "Tryb przychodow" : "Tryb wydatkow"}
          </span>
        </div>
        <p className="mt-2 text-sm text-white/65">
          Skanuj paragony i wyciagi, a aplikacja automatycznie zaproponuje transakcje do zapisania.
        </p>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2.5">
            <p className="ag-overline">Tryb</p>
            <p className="mt-1 text-sm font-semibold text-white">{type === "income" ? "Przychody" : "Wydatki"}</p>
          </div>
          <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2.5">
            <p className="ag-overline">Wykryte pozycje</p>
            <p className="mt-1 text-sm font-semibold text-white">{transactions.length}</p>
            <p className="mt-0.5 text-[11px] text-white/55">{scanned ? "po ostatnim skanie" : "brak skanu"}</p>
          </div>
          <div className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2.5">
            <p className="ag-overline">Suma zaznaczonych</p>
            <p className="mt-1 text-sm font-semibold text-white">{formatPLN(totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Image upload */}
        <Card className="overflow-hidden">
          <CardContent className="pt-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-500/10">
                <ImageIcon className="h-4 w-4 text-violet-500" />
              </div>
              <h3 className="font-semibold text-sm">Zdjecie / Screenshot</h3>
            </div>

            {!imagePreview ? (
              <div
                role="button"
                tabIndex={0}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    fileInputRef.current?.click();
                }}
                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/20 p-12 text-center cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/5 transition-colors"
              >
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Przeciagnij zdjecie tutaj</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    lub kliknij aby wybrac &middot; mozesz tez wkleic (Ctrl+V)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Uploaded screenshot"
                    className="w-full max-h-[400px] object-contain bg-muted/30"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleScan}
                    disabled={scanning}
                    className="flex-1"
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Skanuje...
                      </>
                    ) : (
                      <>
                        <ScanLine className="h-4 w-4 mr-2" />
                        {scanned ? "Skanuj ponownie" : "Skanuj"}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon" onClick={clearAll}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Results */}
        <Card className="overflow-hidden">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-500/10">
                  <ScanLine className="h-4 w-4 text-violet-500" />
                </div>
                <h3 className="font-semibold text-sm">Wykryte transakcje</h3>
                {transactions.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {transactions.length}
                  </Badge>
                )}
              </div>
              {transactions.length > 0 && (
                <span className="text-sm font-semibold tabular-nums">
                  {formatPLN(totalAmount)}
                </span>
              )}
            </div>

            {!scanned ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-muted mb-3">
                  <ScanLine className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm">Wgraj zdjecie i nacisnij &quot;Skanuj&quot;</p>
                <p className="text-xs mt-1 text-muted-foreground/70">
                  AI przeanalizuje obraz i wyciagnie transakcje
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <p className="text-sm">Nie znaleziono transakcji</p>
                <p className="text-xs mt-1 text-muted-foreground/70">
                  Sprobuj z innym zdjeciem lub lepsza jakoscia
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Kwota
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={t.amount}
                            onChange={(e) =>
                              updateTransaction(
                                i,
                                "amount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Kategoria
                          </Label>
                          <Select
                            value={t.category}
                            onValueChange={(v) =>
                              updateTransaction(i, "category", v)
                            }
                          >
                            <SelectTrigger className="h-8 text-xs sm:text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryKeys.map((key) => (
                                <SelectItem key={key} value={key}>
                                  {categoryLabels[key]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground/40 hover:text-destructive mt-5"
                        onClick={() => removeTransaction(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Opis
                        </Label>
                        <Input
                          value={t.description}
                          onChange={(e) =>
                            updateTransaction(i, "description", e.target.value)
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          Data
                        </Label>
                        <Input
                          type="date"
                          value={t.date}
                          onChange={(e) =>
                            updateTransaction(i, "date", e.target.value)
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleSave}
                  disabled={saving || transactions.length === 0}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Zapisuje...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Potwierdz i zapisz ({transactions.length}{" "}
                      {type === "income" ? "przychodow" : "wydatkow"})
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
