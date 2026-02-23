import { Card, CardContent } from "@/components/ui/card";
import { formatPLN } from "@/lib/utils";
import { Landmark, PiggyBank, LineChart } from "lucide-react";

interface NetWorthCardProps {
  totalSavings: number;
  portfolioValue: number;
}

export function NetWorthCard({ totalSavings, portfolioValue }: NetWorthCardProps) {
  const netWorth = totalSavings + portfolioValue;

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Wartość netto
          </p>
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-blue-500/10">
            <Landmark className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {formatPLN(netWorth)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <PiggyBank className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Oszczędności</p>
              <p className="text-sm font-semibold tabular-nums">{formatPLN(totalSavings)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <LineChart className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Portfolio</p>
              <p className="text-sm font-semibold tabular-nums">{formatPLN(portfolioValue)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
