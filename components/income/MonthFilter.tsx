"use client";

import { useMemo, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ALL_MONTHS_VALUE,
  getMonthLabel,
  getCurrentMonth,
  isValidMonth,
} from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight, Layers3 } from "lucide-react";

interface MonthFilterProps {
  compact?: boolean;
}

function shiftMonth(month: string, offset: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + offset, 1);
  const year = d.getFullYear();
  const mon = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${mon}`;
}

export function MonthFilter({ compact = false }: MonthFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const monthInputRef = useRef<HTMLInputElement>(null);

  const now = getCurrentMonth();
  const allowAllMonths = pathname === "/";
  const monthParam = searchParams.get("month");

  const selectedMonth =
    allowAllMonths && monthParam === ALL_MONTHS_VALUE
      ? ALL_MONTHS_VALUE
      : isValidMonth(monthParam)
        ? monthParam
        : now;
  const activeMonth = selectedMonth === ALL_MONTHS_VALUE ? now : selectedMonth;

  const nextMonth = useMemo(() => shiftMonth(activeMonth, 1), [activeMonth]);
  const prevMonth = useMemo(() => shiftMonth(activeMonth, -1), [activeMonth]);
  const nextDisabled = nextMonth > now;

  function pushMonth(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleAllMonths() {
    if (!allowAllMonths) return;
    pushMonth(selectedMonth === ALL_MONTHS_VALUE ? getCurrentMonth() : ALL_MONTHS_VALUE);
  }

  function openNativeMonthPicker() {
    const input = monthInputRef.current as (HTMLInputElement & {
      showPicker?: () => void;
    }) | null;
    if (!input) return;
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch {
      // Safari/iOS can expose showPicker but still throw for month inputs.
    }

    try {
      input.focus({ preventScroll: true });
    } catch {
      // Fallback for browsers that do not support focus options.
      input.focus();
    }

    try {
      input.click();
    } catch {
      // Ignore to avoid crashing the app on unsupported picker APIs.
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:text-white"
          onClick={() => pushMonth(prevMonth)}
          aria-label="Poprzedni miesiac"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <button
          type="button"
          onClick={openNativeMonthPicker}
          className="flex h-9 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 text-xs font-medium text-white/90 transition-colors hover:bg-white/[0.08]"
        >
          <Calendar className="h-3.5 w-3.5 text-white/65" />
          <span className="truncate">
            {selectedMonth === ALL_MONTHS_VALUE
              ? "Wszystkie miesiace"
              : getMonthLabel(activeMonth)}
          </span>
        </button>

        {allowAllMonths && compact ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:text-white"
            onClick={toggleAllMonths}
            aria-label="Przelacz wszystkie miesiace"
          >
            <Layers3
              className={`h-4 w-4 ${
                selectedMonth === ALL_MONTHS_VALUE ? "text-indigo-300" : "text-white/70"
              }`}
            />
          </Button>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white/75 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 disabled:hover:bg-white/[0.04]"
          onClick={() => pushMonth(nextMonth)}
          disabled={nextDisabled}
          aria-label="Nastepny miesiac"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <input
        ref={monthInputRef}
        type="month"
        value={activeMonth}
        max={now}
        onChange={(e) => {
          const value = e.currentTarget.value;
          if (isValidMonth(value)) {
            pushMonth(value);
          }
        }}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
}
