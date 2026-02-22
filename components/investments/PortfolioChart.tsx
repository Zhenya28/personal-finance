"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChartData {
  date: string;
  close: number;
}

const periods = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1R", value: "1y" },
  { label: "2L", value: "2y" },
  { label: "5L", value: "5y" },
] as const;

type Period = (typeof periods)[number]["value"];

interface PortfolioChartProps {
  dataByPeriod: Record<string, ChartData[]>;
  ticker: string;
}

export function PortfolioChart({ dataByPeriod, ticker }: PortfolioChartProps) {
  const [period, setPeriod] = useState<Period>("1y");
  const data = dataByPeriod[period] || [];

  if (Object.values(dataByPeriod).every((d) => d.length === 0)) return null;

  const firstPrice = data.length > 0 ? data[0].close : 0;
  const lastPrice = data.length > 0 ? data[data.length - 1].close : 0;
  const change = lastPrice - firstPrice;
  const changePct = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">
              {ticker} — Kurs ETF
            </CardTitle>
            {data.length > 0 && (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">
                  {lastPrice.toFixed(2)} EUR
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(2)} ({isPositive ? "+" : ""}
                  {changePct.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Brak danych dla tego okresu.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#22c55e" : "#ef4444"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                className="text-xs"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs"
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${Number(value).toFixed(2)} EUR`, "Kurs"]}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
