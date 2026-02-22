"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMonthLabel, getCurrentMonth } from "@/lib/utils";
import { Calendar } from "lucide-react";

function getMonths2026(): string[] {
  const months: string[] = [];
  for (let m = 1; m <= 12; m++) {
    months.push(`2026-${String(m).padStart(2, "0")}`);
  }
  return months;
}

export function MonthFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMonth = searchParams.get("month") || getCurrentMonth();
  const now = getCurrentMonth();
  const months = getMonths2026();

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
