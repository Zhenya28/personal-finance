"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMonthLabel, getCurrentMonth } from "@/lib/utils";

// Generate all months for 2026
function getMonths2026(): string[] {
  const months: string[] = [];
  for (let m = 1; m <= 12; m++) {
    months.push(`2026-${String(m).padStart(2, "0")}`);
  }
  return months;
}

export function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMonth = searchParams.get("month") || getCurrentMonth();
  const now = getCurrentMonth(); // e.g. "2026-02"
  const months = getMonths2026();

  return (
    <Select
      value={currentMonth}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", value);
        router.push(`?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-48">
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
