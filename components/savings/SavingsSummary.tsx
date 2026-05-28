"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Landmark } from "lucide-react";

interface Account {
  currency: string;
  balance: number;
}

interface SavingsSummaryProps {
  accounts: Account[];
  fxRates: Record<string, number>;
}

const CURRENCY_ICONS: Record<string, string> = {
  PLN: "zl",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CHF: "Fr",
};

const CURRENCY_COLORS: Record<string, { bg: string; text: string }> = {
  PLN: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  USD: { bg: "bg-blue-500/10", text: "text-blue-500" },
  EUR: { bg: "bg-amber-500/10", text: "text-amber-500" },
  GBP: { bg: "bg-violet-500/10", text: "text-violet-500" },
  CHF: { bg: "bg-red-500/10", text: "text-red-500" },
};

export function SavingsSummary({ accounts, fxRates }: SavingsSummaryProps) {
  const { totalPln, currencies } = useMemo(() => {
    const byCurrency: Record<string, number> = {};
    for (const acc of accounts) {
      byCurrency[acc.currency] = (byCurrency[acc.currency] || 0) + acc.balance;
    }

    const total = accounts.reduce((sum, acc) => {
      const rate = fxRates[acc.currency] ?? 1;
      return sum + acc.balance * rate;
    }, 0);

    return { totalPln: total, currencies: Object.entries(byCurrency) };
  }, [accounts, fxRates]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-amber-500/10">
              <Landmark className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Lacznie (PLN)
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold tabular-nums">{formatCurrency(totalPln, "PLN")}</p>
        </CardContent>
      </Card>

      {currencies.map(([currency, total]) => {
        const colors = CURRENCY_COLORS[currency] || CURRENCY_COLORS.PLN;
        return (
          <Card key={currency}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className={`flex items-center justify-center h-7 w-7 rounded-lg ${colors.bg}`}>
                  <span className={`text-xs font-bold ${colors.text}`}>
                    {CURRENCY_ICONS[currency] || currency}
                  </span>
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {currency}
                </p>
              </div>
              <p className="text-xl sm:text-2xl font-bold tabular-nums">{formatCurrency(total, currency)}</p>
              {currency !== "PLN" && fxRates[currency] && (
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                  ≈ {formatCurrency(total * fxRates[currency], "PLN")}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
