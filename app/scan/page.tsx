"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
// save via API route, not server action
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
  const router = useRouter();
  const [type, setType] = useState<ScanType>("expense");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [scanned, setScanned] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryLabels =
    type === "income" ? INCOME_CATEGORY_LABELS : EXPENSE_CATEGORY_LABELS;
  const categoryKeys = Object.keys(categoryLabels);

  const handleImageSelect = useCallback((file: File) => {
    setImage(file);
    setTransactions([]);
    setScanned(false);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

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
        alert(`Blad skanowania: ${data.error || res.status}`);
        return;
      }

      if (data.transactions.length === 0) {
        alert("Nie znaleziono transakcji na obrazku");
      } else {
        alert(`Znaleziono ${data.transactions.length} transakcji: ${JSON.stringify(data.transactions)}`);
      }

      setTransactions(data.transactions);
      setScanned(true);
    } catch {
      toast.error("Błąd połączenia z serwerem");
    } finally {
      setScanning(false);
    }
  };

  const handleSave = async () => {
    if (transactions.length === 0) {
      alert("Brak transakcji do zapisania");
      return;
    }
    setSaving(true);
    try {
      const cleanTransactions = transactions.map((t) => ({
        amount: Number(t.amount) || 0,
        category: t.category || (type === "income" ? "INNE" : "OTHER"),
        description: t.description || "",
        date: t.date || new Date().toISOString().split("T")[0],
      }));

      const res = await fetch("/api/scan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: cleanTransactions, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Blad zapisu: ${data.error || res.status}`);
        return;
      }

      alert(`Zapisano ${data.saved} transakcji! Przekierowuje...`);
      // Full page reload to guarantee fresh data
      window.location.href = type === "income" ? "/income" : "/expenses";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Nieznany blad";
      alert(`Blad: ${msg}`);
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
    setImage(null);
    setImagePreview(null);
    setTransactions([]);
    setScanned(false);
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6" onPaste={handlePaste}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Skaner AI
        </h2>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Image upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Zdjęcie / Screenshot
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
              >
                <Upload className="h-10 w-10 text-muted-foreground/50" />
                <div>
                  <p className="font-medium">Przeciągnij zdjęcie tutaj</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    lub kliknij aby wybrać • możesz też wkleić (Ctrl+V)
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
                    className="w-full max-h-[500px] object-contain bg-muted/30"
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
                        Skanuję...
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
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanLine className="h-4 w-4" />
                Wykryte transakcje
                {transactions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {transactions.length}
                  </Badge>
                )}
              </CardTitle>
              {transactions.length > 0 && (
                <span className="text-sm font-medium">
                  Suma: {formatPLN(totalAmount)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!scanned ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <ScanLine className="h-10 w-10 mb-3 opacity-30" />
                <p>Wgraj zdjęcie i naciśnij &quot;Skanuj&quot;</p>
                <p className="text-xs mt-1">
                  AI przeanalizuje obraz i wyciągnie transakcje
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p>Nie znaleziono transakcji</p>
                <p className="text-xs mt-1">
                  Spróbuj z innym zdjęciem lub lepszą jakością
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-lg border p-3 space-y-2 bg-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
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
                          <Label className="text-xs text-muted-foreground">
                            Kategoria
                          </Label>
                          <Select
                            value={t.category}
                            onValueChange={(v) =>
                              updateTransaction(i, "category", v)
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
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
                        className="h-8 w-8 text-muted-foreground hover:text-destructive mt-5"
                        onClick={() => removeTransaction(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
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
                        <Label className="text-xs text-muted-foreground">
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

                <Separator />

                <Button
                  onClick={handleSave}
                  disabled={saving || transactions.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Zapisuję...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Potwierdź i zapisz ({transactions.length}{" "}
                      {type === "income" ? "przychodów" : "wydatków"})
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
