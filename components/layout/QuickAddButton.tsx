"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addIncome, addExpense } from "@/actions/transactions";
import { toast } from "sonner";

type TransactionType = "income" | "expense";

const incomeCategories = [
  { value: "WYPLATA_1", label: "Wyplata 1" },
  { value: "WYPLATA_2", label: "Wyplata 2" },
  { value: "INNE", label: "Inne" },
];

const expenseCategories = [
  { value: "ZAKUPY", label: "Zakupy spozywcze" },
  { value: "RESTAURACJE", label: "Restauracje" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "SUBSCRIPTIONS", label: "Subskrypcje" },
  { value: "MIESZKANIE", label: "Mieszkanie" },
  { value: "FUN", label: "Rozrywka" },
  { value: "OTHER", label: "Inne" },
];

export function QuickAddButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [loading, setLoading] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (open) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      if (e.key === "i") {
        e.preventDefault();
        setType("income");
        setOpen(true);
      } else if (e.key === "e") {
        e.preventDefault();
        setType("expense");
        setOpen(true);
      }
    },
    [open]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      if (type === "income") {
        await addIncome(formData);
        toast.success("Dodano przychod");
      } else {
        await addExpense(formData);
        toast.success("Dodano wydatek");
      }
      setOpen(false);
    } catch {
      toast.error("Wystapil blad");
    } finally {
      setLoading(false);
    }
  }

  const categories = type === "income" ? incomeCategories : expenseCategories;
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-20 right-6 z-50 h-12 w-12 rounded-full shadow-lg md:bottom-6"
      >
        <Plus className="h-5 w-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {type === "income" ? "Dodaj przychod" : "Dodaj wydatek"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2">
            <Button
              variant={type === "income" ? "default" : "outline"}
              size="sm"
              onClick={() => setType("income")}
              className="flex-1"
            >
              Przychod
            </Button>
            <Button
              variant={type === "expense" ? "default" : "outline"}
              size="sm"
              onClick={() => setType("expense")}
              className="flex-1"
            >
              Wydatek
            </Button>
          </div>

          <form action={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="qa-amount" className="text-xs">Kwota (PLN)</Label>
              <Input
                id="qa-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
                autoFocus
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Kategoria</Label>
              <Select name="category" required>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Wybierz kategorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qa-desc" className="text-xs">Opis (opcjonalnie)</Label>
              <Input
                id="qa-desc"
                name="description"
                placeholder="np. Zakupy w Biedronce"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="qa-date" className="text-xs">Data</Label>
              <Input
                id="qa-date"
                name="date"
                type="date"
                defaultValue={today}
                required
                className="h-9"
              />
            </div>

            <Button type="submit" className="w-full h-9" disabled={loading}>
              {loading ? "Dodaje..." : "Dodaj"}
            </Button>
          </form>

          <p className="text-[10px] text-muted-foreground/60 text-center">
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">i</kbd> przychod
            {" · "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">e</kbd> wydatek
            {" · "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">Esc</kbd> zamknij
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
