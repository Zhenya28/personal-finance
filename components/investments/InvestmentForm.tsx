"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Dodaj zakup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="inv-amount">Kwota (PLN)</Label>
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
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Dodawanie..." : "Kup VWCE"}
              </Button>
            </div>
          </div>
          <input type="hidden" name="ticker" value="VWCE.DE" />
          {data && (
            <p className="text-sm text-muted-foreground">
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
