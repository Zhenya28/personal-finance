"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMonthLabel, getCurrentMonth, formatMonth } from "@/lib/utils";
import { Calendar } from "lucide-react";

function getAvailableMonths(): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const months: string[] = [];

  // Previous year (all 12 months)
  for (let m = 0; m <= 11; m++) {
    months.push(formatMonth(new Date(currentYear - 1, m, 1)));
  }
  // Current year up to current month
  for (let m = 0; m <= currentMonth; m++) {
    months.push(formatMonth(new Date(currentYear, m, 1)));
  }

  return months;
}

export function MonthFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMonth = searchParams.get("month") || getCurrentMonth();
  const now = getCurrentMonth();
  const months = getAvailableMonths();

  return (
    <Select
      value={currentMonth}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", value);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-44 h-8 text-xs">
        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {months.map((m) => (
          <SelectItem key={m} value={m} disabled={m > now}>
            {getMonthLabel(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
