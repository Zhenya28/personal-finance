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
import { addIncome } from "@/actions/transactions";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function IncomeForm() {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addIncome(formData);
      toast.success("Dodano przychód ✓");
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
          Dodaj przychód
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="income-amount">Kwota (PLN)</Label>
              <Input
                id="income-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-category">Kategoria</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASE">Podstawa</SelectItem>
                  <SelectItem value="TIPS">Napiwki</SelectItem>
                  <SelectItem value="BONUS">Bonus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-desc">Opis</Label>
              <Input
                id="income-desc"
                name="description"
                placeholder="np. Wypłata za styczeń"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income-date">Data</Label>
              <Input
                id="income-date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Dodawanie..." : "Dodaj przychód"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
