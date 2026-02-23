import { Card, CardContent } from "@/components/ui/card";
import { formatPLN } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface IncomeOverviewCardProps {
  total: number;
  wyplata1: number;
  wyplata2: number;
  inne: number;
  trendPct?: number | null;
}

export function IncomeOverviewCard({
  total,
  wyplata1,
  wyplata2,
  inne,
  trendPct,
}: IncomeOverviewCardProps) {
  const trendText = trendPct !== null && trendPct !== undefined
    ? `${trendPct >= 0 ? "↑" : "↓"} ${Math.abs(trendPct).toFixed(0)}% vs poprzedni miesiąc`
    : undefined;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Przychody
          </p>
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
        </div>
        <p className="text-xl font-bold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatPLN(total)}
        </p>
        {trendText && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{trendText}</p>
        )}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Wypłata 1 <span className="opacity-50">(10.)</span></span>
            <span className="font-medium tabular-nums">{formatPLN(wyplata1)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Wypłata 2 <span className="opacity-50">(25.)</span></span>
            <span className="font-medium tabular-nums">{formatPLN(wyplata2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Inne</span>
            <span className="font-medium tabular-nums">{formatPLN(inne)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

