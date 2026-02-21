import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPLN } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface EmergencyFundProps {
  totalSavings: number;
  avgMonthlyExpenses: number;
}

export function EmergencyFund({
  totalSavings,
  avgMonthlyExpenses,
}: EmergencyFundProps) {
  const monthsCovered =
    avgMonthlyExpenses > 0
      ? Math.floor(totalSavings / avgMonthlyExpenses)
      : 0;

  const getColor = () => {
    if (monthsCovered >= 6) return "text-green-600 dark:text-green-400";
    if (monthsCovered >= 3) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Emergency Fund
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getColor()}`}>
          {monthsCovered} {monthsCovered === 1 ? "miesiąc" : monthsCovered < 5 ? "miesiące" : "miesięcy"}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Masz pokryte {monthsCovered} miesięcy wydatków
        </p>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>Łączne oszczędności: {formatPLN(totalSavings)}</p>
          <p>Średnie wydatki miesięczne: {formatPLN(avgMonthlyExpenses)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
