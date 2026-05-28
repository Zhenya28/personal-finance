"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, Loader2 } from "lucide-react";

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
  initialData: ChartData[];
  ticker: string;
}

export function PortfolioChart({ initialData, ticker }: PortfolioChartProps) {
  const [period, setPeriod] = useState<Period>("1y");
  const [cache, setCache] = useState<Record<string, ChartData[]>>({ "1y": initialData });
  const [loading, setLoading] = useState(false);

  const data = cache[period] || [];

  const fetchPeriod = useCallback(
    async (p: Period) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/investments/history?period=${p}&ticker=${encodeURIComponent(ticker)}`
        );
        if (res.ok) {
          const json = await res.json();
          setCache((prev) => ({ ...prev, [p]: json }));
        }
      } catch (e) {
        console.error("Failed to fetch period:", e);
      } finally {
        setLoading(false);
      }
    },
    [ticker]
  );

  useEffect(() => {
    if (cache[period]) return;
    fetchPeriod(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
  };

  if (initialData.length === 0 && !loading) return null;

  const firstPrice = data.length > 0 ? data[0].close : 0;
  const lastPrice = data.length > 0 ? data[data.length - 1].close : 0;
  const change = lastPrice - firstPrice;
  const changePct = firstPrice > 0 ? (change / firstPrice) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg",
              isPositive ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              <BarChart3 className={cn("h-4 w-4", isPositive ? "text-emerald-500" : "text-red-500")} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{ticker} — Kurs ETF</h3>
              {data.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0 mt-0.5">
                  <span className="text-base sm:text-lg font-bold tabular-nums">
                    {lastPrice.toFixed(2)} EUR
                  </span>
                  <span
                    className={cn(
                      "text-[11px] sm:text-xs font-medium",
                      isPositive
                        ? "text-emerald-400"
                        : "text-red-400"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {change.toFixed(2)} ({isPositive ? "+" : ""}
                    {changePct.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handlePeriodChange(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Ladowanie danych...
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            Brak danych dla tego okresu.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#10b981" : "#ef4444"}
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
                className="text-[10px]"
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                className="text-[10px]"
                tickLine={false}
                axisLine={false}
                dx={-8}
                domain={["dataMin - 2", "dataMax + 2"]}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${Number(value).toFixed(2)} EUR`, "Kurs"]}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2}
                fill="url(#colorPrice)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
