import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import { formatPLN } from "@/lib/utils";

interface Insight {
  type: "food" | "portfolio" | "savings";
  title: string;
  message: string;
  trend?: "up" | "down" | "neutral";
}

interface SmartInsightsProps {
  foodThisMonth: number;
  foodLastMonth: number;
  portfolioValue: number;
  portfolioInvested: number;
  savingsRateThisMonth: number;
  savingsRateLastMonth: number;
}

export function SmartInsights({
  foodThisMonth,
  foodLastMonth,
  portfolioValue,
  portfolioInvested,
  savingsRateThisMonth,
  savingsRateLastMonth,
}: SmartInsightsProps) {
  const insights: Insight[] = [];

  // Food comparison
  if (foodLastMonth > 0) {
    const diff = foodThisMonth - foodLastMonth;
    const pct = ((diff / foodLastMonth) * 100).toFixed(0);
    insights.push({
      type: "food",
      title: "Jedzenie vs poprzedni miesiąc",
      message:
        diff > 0
          ? `Wydajesz ${formatPLN(Math.abs(diff))} więcej na jedzenie (+${pct}%)`
          : diff < 0
            ? `Wydajesz ${formatPLN(Math.abs(diff))} mniej na jedzenie (${pct}%)`
            : `Wydatki na jedzenie bez zmian`,
      trend: diff > 0 ? "down" : diff < 0 ? "up" : "neutral",
    });
  }

  // Portfolio change
  if (portfolioInvested > 0) {
    const pnl = portfolioValue - portfolioInvested;
    const pnlPct = ((pnl / portfolioInvested) * 100).toFixed(1);
    insights.push({
      type: "portfolio",
      title: "Zmiana wartości portfolio",
      message:
        pnl >= 0
          ? `Portfolio zyskało ${formatPLN(pnl)} (+${pnlPct}%) od pierwszego zakupu`
          : `Portfolio straciło ${formatPLN(Math.abs(pnl))} (${pnlPct}%) od pierwszego zakupu`,
      trend: pnl >= 0 ? "up" : "down",
    });
  }

  // Savings rate comparison
  if (savingsRateLastMonth > 0 || savingsRateThisMonth > 0) {
    const diff = savingsRateThisMonth - savingsRateLastMonth;
    insights.push({
      type: "savings",
      title: "Savings rate",
      message: `Savings rate: ${savingsRateThisMonth.toFixed(0)}% ${diff > 0 ? `(+${diff.toFixed(0)}pp vs poprzedni miesiąc)` : diff < 0 ? `(${diff.toFixed(0)}pp vs poprzedni miesiąc)` : "(bez zmian)"}`,
      trend: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
    });
  }

  if (insights.length === 0) {
    return null;
  }

  const iconMap = {
    food: TrendingDown,
    portfolio: TrendingUp,
    savings: PiggyBank,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-4 w-4" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const Icon = iconMap[insight.type];
          return (
            <div
              key={insight.type}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <Icon
                className={`h-5 w-5 mt-0.5 shrink-0 ${
                  insight.trend === "up"
                    ? "text-green-500"
                    : insight.trend === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              />
              <div>
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-sm text-muted-foreground">
                  {insight.message}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
