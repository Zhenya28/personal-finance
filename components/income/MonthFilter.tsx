"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLast6Months, getMonthLabel, getCurrentMonth } from "@/lib/utils";

export function MonthFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMonth = searchParams.get("month") || getCurrentMonth();
  const months = getLast6Months();

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
          <SelectItem key={m} value={m}>
            {getMonthLabel(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
