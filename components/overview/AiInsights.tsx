"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, ThumbsUp } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface Insight {
  type: "warning" | "positive" | "info";
  icon: "up" | "down" | "alert" | "thumbsup";
  text: string;
}

interface Props {
  insights: Insight[];
}

const iconMap = {
  up: TrendingUp,
  down: TrendingDown,
  alert: AlertTriangle,
  thumbsup: ThumbsUp,
};

const colorMap = {
  warning: "text-amber-500",
  positive: "text-emerald-500",
  info: "text-blue-500",
};

const bgMap = {
  warning: "bg-amber-500/10",
  positive: "bg-emerald-500/10",
  info: "bg-blue-500/10",
};

export function AiInsights({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <Card className="overflow-hidden border border-border card-hover">
      <CardContent className="pt-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Spostrzezenia AI</h3>
            <p className="text-xs text-muted-foreground">Analiza Twoich finansow</p>
          </div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-2"
        >
          {insights.map((insight, i) => {
            const Icon = iconMap[insight.icon];
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                className="flex items-start gap-2.5 rounded-2xl border border-border bg-secondary p-3"
              >
                <div className={`shrink-0 mt-0.5 h-6 w-6 rounded-md flex items-center justify-center ${bgMap[insight.type]}`}>
                  <Icon className={`h-3.5 w-3.5 ${colorMap[insight.type]}`} />
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {insight.text}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}
