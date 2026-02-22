import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Account {
  currency: string;
  balance: number;
}

interface SavingsSummaryProps {
  accounts: Account[];
  fxRates: Record<string, number>; // currency -> PLN rate
}

export function SavingsSummary({ accounts, fxRates }: SavingsSummaryProps) {
  // Group by currency
  const byCurrency: Record<string, number> = {};
  for (const acc of accounts) {
    byCurrency[acc.currency] = (byCurrency[acc.currency] || 0) + acc.balance;
  }

  // Total in PLN
  const totalPln = accounts.reduce((sum, acc) => {
    const rate = fxRates[acc.currency] ?? 1;
    return sum + acc.balance * rate;
  }, 0);

  const CURRENCY_EMOJI: Record<string, string> = {
    PLN: "🇵🇱", USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", CHF: "🇨🇭",
  };

  const currencies = Object.entries(byCurrency);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total in PLN */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Łącznie (PLN)
          </p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalPln, "PLN")}</p>
        </CardContent>
      </Card>

      {/* Per-currency cards */}
      {currencies.map(([currency, total]) => (
        <Card key={currency}>
          <CardContent className="pt-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <span>{CURRENCY_EMOJI[currency] || "💰"}</span>
              {currency}
            </p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(total, currency)}</p>
            {currency !== "PLN" && fxRates[currency] && (
              <p className="text-xs text-muted-foreground mt-0.5">
                ≈ {formatCurrency(total * fxRates[currency], "PLN")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
