"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INCOME_CATEGORY_COLORS } from "@/lib/utils";

interface IncomeChartData {
  month: string;
  WYPLATA_1: number;
  WYPLATA_2: number;
  INNE: number;
}

export function IncomeChart({ data }: { data: IncomeChartData[] }) {
  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Przychody per miesiąc</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) =>
                new Intl.NumberFormat("pl-PL", {
                  style: "currency",
                  currency: "PLN",
                }).format(Number(value))
              }
            />
            <Legend />
            <Bar
              dataKey="WYPLATA_1"
              name="Wypłata 1"
              stackId="a"
              fill={INCOME_CATEGORY_COLORS.WYPLATA_1}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="WYPLATA_2"
              name="Wypłata 2"
              stackId="a"
              fill={INCOME_CATEGORY_COLORS.WYPLATA_2}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="INNE"
              name="Inne"
              stackId="a"
              fill={INCOME_CATEGORY_COLORS.INNE}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
