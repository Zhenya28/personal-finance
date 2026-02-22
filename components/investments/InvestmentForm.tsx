"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { addInvestment, fetchVWCEData } from "@/actions/investments";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface VWCEData {
  priceEur: number;
  eurPln: number;
  pricePln: number;
}

export function InvestmentForm() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VWCEData | null>(null);
  const [amount, setAmount] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchVWCEData().then(setData);
  }, []);

  const amountNum = parseFloat(amount) || 0;
  const estimatedUnits = data && amountNum > 0 ? amountNum / data.pricePln : null;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addInvestment(formData);
      toast.success("Dodano zakup inwestycji");
      setAmount("");
    } catch {
      toast.error("Wystapil blad");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
      <CardContent className="pt-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10">
            <Plus className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="font-semibold text-sm">Dodaj zakup</h3>
        </div>
        <form action={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="inv-amount" className="text-xs">Kwota (PLN)</Label>
              <Input
                id="inv-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="np. 2000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-date" className="text-xs">Data</Label>
              <Input
                id="inv-date"
                name="date"
                type="date"
                defaultValue={today}
                required
                className="h-9"
              />
            </div>
            <Button type="submit" disabled={loading} className="h-9">
              {loading ? "Dodaje..." : "Kup VWCE"}
            </Button>
          </div>
          <input type="hidden" name="ticker" value="VWCE.DE" />
          {data && (
            <p className="text-xs text-muted-foreground">
              VWCE: <span className="font-medium">{data.priceEur.toFixed(2)} EUR</span>
              {" · "}
              EUR/PLN: <span className="font-medium">{data.eurPln.toFixed(4)}</span>
              {" · "}
              1 szt = <span className="font-medium">{data.pricePln.toFixed(2)} PLN</span>
              {estimatedUnits !== null && (
                <>
                  {" · "}
                  ~<span className="font-medium">{estimatedUnits.toFixed(4)}</span> szt
                </>
              )}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
