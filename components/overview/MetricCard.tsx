import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

const trendConfig = {
  up: {
    value: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-500",
  },
  down: {
    value: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
    icon: "text-red-500",
  },
  neutral: {
    value: "text-foreground",
    bg: "bg-muted",
    icon: "text-muted-foreground",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "neutral",
}: MetricCardProps) {
  const t = trendConfig[trend];

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-lg",
              t.bg
            )}
          >
            <Icon className={cn("h-4 w-4", t.icon)} />
          </div>
        </div>
        <p
          className={cn(
            "text-xl font-bold tracking-tight tabular-nums",
            t.value
          )}
        >
          {value}
        </p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-1 truncate">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
