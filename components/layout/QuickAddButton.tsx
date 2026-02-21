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
  { value: "WYPLATA_1", label: "Wypłata 1" },
  { value: "WYPLATA_2", label: "Wypłata 2" },
  { value: "INNE", label: "Inne" },
];

const expenseCategories = [
  { value: "FOOD", label: "Jedzenie" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "SUBSCRIPTIONS", label: "Subskrypcje" },
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
        toast.success("Dodano przychód ✓");
      } else {
        await addExpense(formData);
        toast.success("Dodano wydatek ✓");
      }
      setOpen(false);
    } catch {
      toast.error("Wystąpił błąd");
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
        className="fixed bottom-20 right-6 z-50 h-14 w-14 rounded-full shadow-lg md:bottom-6"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {type === "income" ? "Dodaj przychód" : "Dodaj wydatek"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 mb-4">
            <Button
              variant={type === "income" ? "default" : "outline"}
              size="sm"
              onClick={() => setType("income")}
              className="flex-1"
            >
              Przychód
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

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Kwota (PLN)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategoria</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
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

            <div className="space-y-2">
              <Label htmlFor="description">Opis (opcjonalnie)</Label>
              <Input
                id="description"
                name="description"
                placeholder="np. Zakupy w Biedronce"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Dodawanie..." : "Dodaj"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Skróty: <kbd className="px-1 py-0.5 bg-muted rounded text-xs">i</kbd> = przychód,{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">e</kbd> = wydatek,{" "}
            <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Esc</kbd> = zamknij
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
