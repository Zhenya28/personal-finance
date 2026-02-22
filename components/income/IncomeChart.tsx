"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { INCOME_CATEGORY_COLORS, formatPLN } from "@/lib/utils";
import { BarChart3 } from "lucide-react";

interface IncomeChartData {
  month: string;
  WYPLATA_1: number;
  WYPLATA_2: number;
  INNE: number;
}

export function IncomeChart({ data }: { data: IncomeChartData[] }) {
  if (data.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />
      <CardContent className="pt-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
            <BarChart3 className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Przychody per miesiac</h3>
            <p className="text-xs text-muted-foreground">Rozbicie na kategorie</p>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INCOME_CATEGORY_COLORS.WYPLATA_1 }} />
              Wyplata 1
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INCOME_CATEGORY_COLORS.WYPLATA_2 }} />
              Wyplata 2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INCOME_CATEGORY_COLORS.INNE }} />
              Inne
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis dataKey="month" className="text-[10px]" axisLine={false} tickLine={false} dy={8} />
            <YAxis
              className="text-[10px]"
              axisLine={false}
              tickLine={false}
              dx={-8}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatPLN(Number(value))}
            />
            <Bar dataKey="WYPLATA_1" name="Wyplata 1" stackId="a" fill={INCOME_CATEGORY_COLORS.WYPLATA_1} radius={[0, 0, 0, 0]} />
            <Bar dataKey="WYPLATA_2" name="Wyplata 2" stackId="a" fill={INCOME_CATEGORY_COLORS.WYPLATA_2} radius={[0, 0, 0, 0]} />
            <Bar dataKey="INNE" name="Inne" stackId="a" fill={INCOME_CATEGORY_COLORS.INNE} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
