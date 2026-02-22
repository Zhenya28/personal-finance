"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface CashflowData {
  month: string;
  income: number;
  expenses: number;
}

export function CashflowChart({ data }: { data: CashflowData[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
      <CardContent className="pt-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Cashflow</h3>
            <p className="text-xs text-muted-foreground">Ostatnie 6 miesiecy</p>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Przychody
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Wydatki
            </span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
            Brak danych. Dodaj transakcje, aby zobaczyc wykres.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="month"
                className="text-[10px]"
                axisLine={false}
                tickLine={false}
                dy={8}
              />
              <YAxis
                className="text-[10px]"
                axisLine={false}
                tickLine={false}
                dx={-8}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) =>
                  new Intl.NumberFormat("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                  }).format(Number(value))
                }
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Przychody"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#incomeGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Wydatki"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#expenseGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
