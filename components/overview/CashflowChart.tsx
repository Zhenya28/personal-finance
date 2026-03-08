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
    <Card className="overflow-hidden border border-border card-hover">
      <CardContent className="pt-5">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">Cashflow</h3>
            <p className="text-sm font-medium text-foreground">Ostatnie 6 miesiecy</p>
          </div>
          <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground sm:text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#16dbcc]" />
              <span className="hidden sm:inline">Przychody</span>
              <span className="sm:hidden">Przych.</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#ff8f6b]" />
              <span className="hidden sm:inline">Wydatki</span>
              <span className="sm:hidden">Wyd.</span>
            </span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="flex flex-col h-56 items-center justify-center text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-muted/50 mb-3">
              <TrendingUp className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="font-medium text-sm text-muted-foreground mb-0.5">Brak danych</p>
            <p className="text-xs text-muted-foreground/60">Dodaj transakcje, aby zobaczyc wykres</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16dbcc" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#16dbcc" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8f6b" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ff8f6b" stopOpacity={0} />
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
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
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
                stroke="#16dbcc"
                strokeWidth={2}
                fill="url(#incomeGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "var(--card)" }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Wydatki"
                stroke="#ff8f6b"
                strokeWidth={2}
                fill="url(#expenseGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "var(--card)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
