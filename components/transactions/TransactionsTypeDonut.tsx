"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartPie } from "lucide-react";
import { formatPLN } from "@/lib/utils";

interface TransactionsTypeDonutProps {
  incomeTotal: number;
  expenseTotal: number;
  incomeCount: number;
  expenseCount: number;
}

const COLORS = {
  income: "#16dbcc",
  expense: "#ff8f6b",
};

export function TransactionsTypeDonut({
  incomeTotal,
  expenseTotal,
  incomeCount,
  expenseCount,
}: TransactionsTypeDonutProps) {
  const turnover = incomeTotal + expenseTotal;
  const expenseIntensity = turnover > 0 ? (expenseTotal / turnover) * 100 : 0;

  const data = [
    { name: "Przychody", value: incomeTotal, count: incomeCount, color: COLORS.income },
    { name: "Wydatki", value: expenseTotal, count: expenseCount, color: COLORS.expense },
  ];

  const hasData = turnover > 0;

  return (
    <Card className="overflow-hidden border border-border">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <ChartPie className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Struktura przeplywow</h3>
            <p className="text-xs text-muted-foreground">Udzial przychodow i wydatkow</p>
          </div>
        </div>

        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 text-xs text-muted-foreground">
            Brak danych do wizualizacji
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[190px_1fr] sm:items-center">
            <div className="mx-auto h-[190px] w-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value) => formatPLN(Number(value ?? 0))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

              <div className="space-y-3.5">
              {data.map((entry) => {
                const pct = turnover > 0 ? ((entry.value / turnover) * 100).toFixed(0) : "0";
                return (
                  <div key={entry.name} className="rounded-2xl border border-border/70 bg-white/[0.04] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        {entry.name}
                      </div>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                    <p className="mt-1 text-base font-semibold tabular-nums text-foreground">
                      {formatPLN(entry.value)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.count} transakcji
                    </p>
                  </div>
                );
              })}

              <div className="rounded-2xl border border-border/70 bg-white/[0.03] px-4 py-3">
                <p className="text-[11px] text-muted-foreground">Intensywnosc kosztow</p>
                <p className="text-base font-semibold text-foreground">{expenseIntensity.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
