"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatPLN } from "@/lib/utils";
import { Landmark, PiggyBank, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface NetWorthCardProps {
  totalSavings: number;
  portfolioValue: number;
}

export function NetWorthCard({ totalSavings, portfolioValue }: NetWorthCardProps) {
  const netWorth = totalSavings + portfolioValue;

  return (
    <motion.div {...fadeInUp}>
      <Card className="overflow-hidden border border-border card-hover">
        <CardContent className="pt-5 pb-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
              Wartość netto
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-primary/10">
              <Landmark className="h-4 w-4 text-primary" />
            </div>
          </div>
          <AnimatedNumber
            value={netWorth}
            formatFn={formatPLN}
            className="font-mono text-4xl font-semibold tracking-[-0.03em] tabular-nums text-foreground"
            duration={1.0}
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary p-3">
              <PiggyBank className="h-3.5 w-3.5 shrink-0 text-chart-5" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Oszczednosci</p>
                <AnimatedNumber
                  value={totalSavings}
                  formatFn={formatPLN}
                  className="text-sm font-semibold tabular-nums text-foreground"
                  duration={0.8}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary p-3">
              <LineChart className="h-3.5 w-3.5 shrink-0 text-chart-4" />
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground">Portfolio</p>
                <AnimatedNumber
                  value={portfolioValue}
                  formatFn={formatPLN}
                  className="text-sm font-semibold tabular-nums text-foreground"
                  duration={0.8}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
