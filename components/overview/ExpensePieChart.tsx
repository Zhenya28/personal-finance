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
    <Card className="overflow-hidden border border-border card-hover">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-primary/10">
            <TrendingDown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">Wydatki per kategoria</h3>
            <p className="text-sm font-medium text-foreground">
              {total > 0 ? `Lacznie: ${formatPLN(total)}` : "Biezacy miesiac"}
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="flex flex-col h-44 items-center justify-center text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-muted/50 mb-3">
              <TrendingDown className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="font-medium text-sm text-muted-foreground mb-0.5">Brak wydatkow</p>
            <p className="text-xs text-muted-foreground/60">Dodaj wydatki, aby zobaczyc wykres</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/2 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
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
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:flex-1 space-y-1.5">
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
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-medium tabular-nums">
                        {formatPLN(entry.value)}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 tabular-nums w-7 text-right">
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
