"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addExpense } from "@/actions/transactions";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/utils";

const categories = Object.entries(EXPENSE_CATEGORY_LABELS);

export function ExpenseForm() {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addExpense(formData);
      toast.success("Dodano wydatek ✓");
    } catch {
      toast.error("Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Dodaj wydatek
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expense-amount">Kwota (PLN)</Label>
              <Input
                id="expense-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-category">Kategoria</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-desc">Opis</Label>
              <Input
                id="expense-desc"
                name="description"
                placeholder="np. Zakupy w Biedronce"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date">Data</Label>
              <Input
                id="expense-date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Dodawanie..." : "Dodaj wydatek"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
