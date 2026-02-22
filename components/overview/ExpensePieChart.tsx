"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_CATEGORY_LABELS,
  formatPLN,
} from "@/lib/utils";
import { TrendingDown } from "lucide-react";

interface ExpensePieData {
  category: string;
  amount: number;
}

export function ExpensePieChart({ data }: { data: ExpensePieData[] }) {
  const chartData = data
    .map((d) => ({
      name: EXPENSE_CATEGORY_LABELS[d.category] || d.category,
      value: d.amount,
      color: EXPENSE_CATEGORY_COLORS[d.category] || "#6b7280",
    }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-red-500 to-orange-400" />
      <CardContent className="pt-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-500/10">
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Wydatki per kategoria</h3>
            <p className="text-xs text-muted-foreground">
              {total > 0 ? `Lacznie: ${formatPLN(total)}` : "Biezacy miesiac"}
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            Brak wydatkow w tym miesiacu.
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => formatPLN(Number(value))}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex-1 space-y-2">
              {chartData.map((entry) => {
                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0";
                return (
                  <div key={entry.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-medium tabular-nums">
                        {formatPLN(entry.value)}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 tabular-nums w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
