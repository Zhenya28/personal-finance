"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
}

const trendConfig = {
  up: {
    value: "text-white",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
  },
  down: {
    value: "text-white",
    bg: "bg-red-500/10",
    icon: "text-red-400",
  },
  neutral: {
    value: "text-white",
    bg: "bg-white/[0.06]",
    icon: "text-white/50",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
}: MetricCardProps) {
  const t = trendConfig[trend];

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
                t.icon,
                t.bg
              )}
            >
              {icon}
            </div>
          </div>
          <p
            className={cn(
              "font-mono text-3xl font-semibold tracking-[-0.02em] tabular-nums",
              t.value
            )}
          >
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
