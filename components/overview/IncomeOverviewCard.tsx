"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatPLN } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";

interface IncomeOverviewCardProps {
  total: number;
  wyplata1: number;
  wyplata2: number;
  inne: number;
  trendPct?: number | null;
}

export function IncomeOverviewCard({
  total,
  wyplata1,
  wyplata2,
  inne,
  trendPct,
}: IncomeOverviewCardProps) {
  const trendText = trendPct !== null && trendPct !== undefined
    ? `${trendPct >= 0 ? "↑" : "↓"} ${Math.abs(trendPct).toFixed(0)}% vs poprzedni miesiąc`
    : undefined;

  return (
    <motion.div variants={staggerItem}>
      <Card className="relative overflow-hidden border border-border card-hover">
        <CardContent className="pt-5 pb-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
              Przychody
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <p className="font-mono text-3xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">
            {formatPLN(total)}
          </p>
          {trendText && (
            <p className="mt-0.5 text-xs text-muted-foreground">{trendText}</p>
          )}
          <div className="mt-4 space-y-1.5 rounded-2xl border border-border bg-secondary px-3 py-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Wypłata 1 <span className="opacity-50">(10.)</span></span>
              <span className="font-medium tabular-nums">{formatPLN(wyplata1)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Wypłata 2 <span className="opacity-50">(25.)</span></span>
              <span className="font-medium tabular-nums">{formatPLN(wyplata2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Inne</span>
              <span className="font-medium tabular-nums">{formatPLN(inne)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
