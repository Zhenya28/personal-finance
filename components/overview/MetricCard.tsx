"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";

type Trend = "up" | "down" | "neutral";
type Tone = "good" | "bad" | "neutral";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: Trend;
  /**
   * Semantic color tone. Overrides trend-based coloring.
   * Use this for metrics where "up = bad" (e.g. expenses).
   */
  tone?: Tone;
}

const toneConfig: Record<Tone, { bg: string; icon: string }> = {
  good: { bg: "bg-emerald-500/10", icon: "text-emerald-400" },
  bad: { bg: "bg-red-500/10", icon: "text-red-400" },
  neutral: { bg: "bg-white/[0.06]", icon: "text-white/50" },
};

function deriveTone(trend: Trend): Tone {
  if (trend === "up") return "good";
  if (trend === "down") return "bad";
  return "neutral";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
  tone,
}: MetricCardProps) {
  const effective = toneConfig[tone ?? deriveTone(trend)];

  return (
    <motion.div variants={staggerItem}>
      <Card className="relative overflow-hidden border border-border card-hover">
        <CardContent className="pt-5 pb-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">
              {title}
            </p>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
                effective.icon,
                effective.bg
              )}
            >
              {icon}
            </div>
          </div>
          <p className="font-mono text-3xl font-semibold tracking-[-0.02em] tabular-nums text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
