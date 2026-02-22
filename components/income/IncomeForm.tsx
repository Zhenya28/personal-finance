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
import { Card, CardContent } from "@/components/ui/card";
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
      toast.success("Dodano przychod");
    } catch {
      toast.error("Wystapil blad");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
      <CardContent className="pt-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
            <Plus className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-sm">Dodaj przychod</h3>
        </div>
        <form action={handleSubmit} className="grid gap-3 sm:grid-cols-5 items-end">
          <div className="space-y-1.5">
            <Label htmlFor="income-amount" className="text-xs">Kwota</Label>
            <Input
              id="income-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              required
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kategoria</Label>
            <Select name="category" required>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Wybierz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WYPLATA_1">Wyplata 1</SelectItem>
                <SelectItem value="WYPLATA_2">Wyplata 2</SelectItem>
                <SelectItem value="INNE">Inne</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="income-desc" className="text-xs">Opis</Label>
            <Input
              id="income-desc"
              name="description"
              placeholder="np. Wyplata za styczen"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="income-date" className="text-xs">Data</Label>
            <Input
              id="income-date"
              name="date"
              type="date"
              defaultValue={today}
              required
              className="h-9"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-9">
            {loading ? "Dodaje..." : "Dodaj"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
