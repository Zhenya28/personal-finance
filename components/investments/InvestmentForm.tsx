"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addInvestment } from "@/actions/investments";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function InvestmentForm() {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addInvestment(formData);
      toast.success("Dodano zakup inwestycji ✓");
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
          Dodaj zakup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="inv-units">Jednostki</Label>
              <Input
                id="inv-units"
                name="units"
                type="number"
                step="0.0001"
                min="0"
                placeholder="np. 2.5"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-price">Cena/szt (PLN)</Label>
              <Input
                id="inv-price"
                name="pricePerUnit"
                type="number"
                step="0.01"
                min="0"
                placeholder="np. 425.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-commission">Prowizja (PLN)</Label>
              <Input
                id="inv-commission"
                name="commission"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-date">Data</Label>
              <Input
                id="inv-date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </div>
          </div>
          <input type="hidden" name="ticker" value="VWCE.DE" />
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Dodawanie..." : "Dodaj zakup VWCE"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
