"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn, formatPLN } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Clock,
  Bike,
  Package,
  Banknote,
  CalendarDays,
  Coins,
  Smartphone,
  Shirt,
  Zap,
  HandCoins,
  Save,
  Lock,
  Loader2,
} from "lucide-react";

// --- CONSTANTS ---
const HOURLY_RATE = 31.4;
const LAUNDRY_RATE = 0.1;
const PHONE_RATE_UNDER_40 = 0.62;
const PHONE_FLAT_OVER_40 = 25;
const KM_RATE = 0.55;

const WEEKDAY_MULTIPLIERS = [
  { min: 0, max: 49, multiplier: 0 },
  { min: 50, max: 124, multiplier: 1 },
  { min: 125, max: 249, multiplier: 1 },
  { min: 250, max: 399, multiplier: 1.5 },
  { min: 400, max: 549, multiplier: 2 },
  { min: 550, max: Infinity, multiplier: 2.5 },
];

const WEEKEND_MULTIPLIERS = [
  { min: 0, max: 49, multiplier: 0 },
  { min: 50, max: 124, multiplier: 1 },
  { min: 125, max: 249, multiplier: 2 },
  { min: 250, max: 399, multiplier: 3 },
  { min: 400, max: 549, multiplier: 4 },
  { min: 550, max: Infinity, multiplier: 5 },
];

const ORDER_TIERS = [
  { range: "0-49", min: 0, wd: 0, we: 0 },
  { range: "50-124", min: 50, wd: 1, we: 1 },
  { range: "125-249", min: 125, wd: 1, we: 2 },
  { range: "250-399", min: 250, wd: 1.5, we: 3 },
  { range: "400-549", min: 400, wd: 2, we: 4 },
  { range: "550+", min: 550, wd: 2.5, we: 5 },
];

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

type MonthlyResult = {
  id: string;
  month: string;
  hoursP1: number;
  hoursP2: number;
  totalKm: number;
  weekdayOrders: number;
  weekendOrders: number;
  tips: number;
  payoutPeriod1: number;
  payoutPeriod2: number;
  total: number;
  isFinalized: boolean;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function getMultiplier(
  totalOrders: number,
  table: typeof WEEKDAY_MULTIPLIERS
): number {
  for (const row of table) {
    if (totalOrders >= row.min && totalOrders <= row.max) {
      return row.multiplier;
    }
  }
  return 0;
}

function calcPhoneBonus(hours: number): number {
  if (hours <= 0) return 0;
  if (hours <= 40) return hours * PHONE_RATE_UNDER_40;
  return PHONE_FLAT_OVER_40;
}

function getActiveTierIndex(totalOrders: number): number {
  for (let i = ORDER_TIERS.length - 1; i >= 0; i--) {
    if (totalOrders >= ORDER_TIERS[i].min) return i;
  }
  return 0;
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function toInputValue(value: number): string {
  if (value === 0) return "0";
  return Number.isInteger(value) ? String(value) : String(value);
}

function formatDateTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function extractErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // ignore and use fallback
  }
  return fallback;
}

function renderIconWithClass(
  icon: React.ReactNode,
  className: string
): React.ReactNode {
  if (!React.isValidElement<{ className?: string }>(icon)) {
    return icon;
  }

  return React.cloneElement(icon, {
    className: cn(className, icon.props.className),
  });
}

// --- COMPONENT ---
export default function CalculatorPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  const [hoursP1, setHoursP1] = useState("");
  const [hoursP2, setHoursP2] = useState("");
  const [totalKm, setTotalKm] = useState("");
  const [weekdayOrders, setWeekdayOrders] = useState("");
  const [weekendOrders, setWeekendOrders] = useState("");
  const [tips, setTips] = useState("");

  const [isMonthLoading, setIsMonthLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [confirmMonthEnd, setConfirmMonthEnd] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [finalizedAt, setFinalizedAt] = useState<string | null>(null);

  const calc = useMemo(() => {
    const h1 = parseFloat(hoursP1) || 0;
    const h2 = parseFloat(hoursP2) || 0;
    const totalHours = h1 + h2;
    const km = parseFloat(totalKm) || 0;
    const wdOrders = parseInt(weekdayOrders) || 0;
    const weOrders = parseInt(weekendOrders) || 0;
    const totalOrders = wdOrders + weOrders;
    const tipsVal = parseFloat(tips) || 0;

    const baseP1 = h1 * HOURLY_RATE;
    const baseP2 = h2 * HOURLY_RATE;
    const totalLaundry = totalHours * LAUNDRY_RATE;
    const totalPhoneBonus = calcPhoneBonus(totalHours);
    const kmBonus = km * KM_RATE;

    const wdMultiplier = getMultiplier(totalOrders, WEEKDAY_MULTIPLIERS);
    const weMultiplier = getMultiplier(totalOrders, WEEKEND_MULTIPLIERS);
    const orderBonus = wdOrders * wdMultiplier + weOrders * weMultiplier;

    const wyplata2 = baseP1;
    const wyplata1 =
      baseP2 + totalLaundry + totalPhoneBonus + kmBonus + orderBonus + tipsVal;
    const total = wyplata1 + wyplata2;

    return {
      h1,
      h2,
      totalHours,
      km,
      wdOrders,
      weOrders,
      totalOrders,
      tipsVal,
      baseP1,
      baseP2,
      totalLaundry,
      totalPhoneBonus,
      kmBonus,
      orderBonus,
      wdMultiplier,
      weMultiplier,
      wyplata1,
      wyplata2,
      total,
    };
  }, [hoursP1, hoursP2, totalKm, weekdayOrders, weekendOrders, tips]);

  useEffect(() => {
    let cancelled = false;

    async function loadMonthData() {
      if (!MONTH_REGEX.test(selectedMonth)) {
        setIsMonthLoading(false);
        return;
      }

      setIsMonthLoading(true);
      setConfirmMonthEnd(false);

      try {
        const response = await fetch(
          `/api/calculator/monthly?month=${selectedMonth}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const message = await extractErrorMessage(
            response,
            "Nie udalo sie pobrac danych miesiaca."
          );
          throw new Error(message);
        }

        const data = (await response.json()) as { record: MonthlyResult | null };
        if (cancelled) return;

        if (!data.record) {
          setHoursP1("");
          setHoursP2("");
          setTotalKm("");
          setWeekdayOrders("");
          setWeekendOrders("");
          setTips("");
          setIsFinalized(false);
          setSavedAt(null);
          setFinalizedAt(null);
          return;
        }

        setHoursP1(toInputValue(data.record.hoursP1));
        setHoursP2(toInputValue(data.record.hoursP2));
        setTotalKm(toInputValue(data.record.totalKm));
        setWeekdayOrders(toInputValue(data.record.weekdayOrders));
        setWeekendOrders(toInputValue(data.record.weekendOrders));
        setTips(toInputValue(data.record.tips));
        setIsFinalized(data.record.isFinalized);
        setSavedAt(data.record.updatedAt);
        setFinalizedAt(data.record.finalizedAt);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Nie udalo sie pobrac danych miesiaca."
          );
        }
      } finally {
        if (!cancelled) {
          setIsMonthLoading(false);
        }
      }
    }

    loadMonthData();
    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

  async function saveMonth(finalize: boolean) {
    if (isFinalized) {
      toast.error("Ten miesiac jest juz zamkniety i nie mozna go zmieniac.");
      return;
    }

    if (finalize && !confirmMonthEnd) {
      toast.error("Potwierdz checkbox, ze miesiac jest zakonczony.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/calculator/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          hoursP1: calc.h1,
          hoursP2: calc.h2,
          totalKm: calc.km,
          weekdayOrders: calc.wdOrders,
          weekendOrders: calc.weOrders,
          tips: calc.tipsVal,
          payoutPeriod1: calc.wyplata2,
          payoutPeriod2: calc.wyplata1,
          total: calc.total,
          finalize,
        }),
      });

      if (!response.ok) {
        const message = await extractErrorMessage(
          response,
          "Nie udalo sie zapisac miesiaca."
        );
        throw new Error(message);
      }

      const data = (await response.json()) as { record: MonthlyResult };
      const record = data.record;

      setHoursP1(toInputValue(record.hoursP1));
      setHoursP2(toInputValue(record.hoursP2));
      setTotalKm(toInputValue(record.totalKm));
      setWeekdayOrders(toInputValue(record.weekdayOrders));
      setWeekendOrders(toInputValue(record.weekendOrders));
      setTips(toInputValue(record.tips));
      setIsFinalized(record.isFinalized);
      setSavedAt(record.updatedAt);
      setFinalizedAt(record.finalizedAt);

      if (record.isFinalized) {
        setConfirmMonthEnd(false);
      }

      toast.success(
        record.isFinalized
          ? "Miesiac zostal zapisany i zamkniety."
          : "Miesiac zostal zapisany."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Nie udalo sie zapisac miesiaca."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const activeTier = getActiveTierIndex(calc.totalOrders);
  const hasValidMonth = MONTH_REGEX.test(selectedMonth);
  const inputsLocked = isFinalized || isMonthLoading || isSaving;
  const savedAtLabel = formatDateTime(savedAt);
  const finalizedAtLabel = formatDateTime(finalizedAt);

  return (
    <div className="ag-page">
      <div className="ag-toolbar">
        <h1 className="ag-toolbar-title">Kalkulator Wyplat</h1>
      </div>

      {/* Hero summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Wyplata 2"
          sublabel="25 dnia"
          value={calc.wyplata2}
          icon={<CalendarDays />}
          color="blue"
        />
        <SummaryCard
          label="Wyplata 1"
          sublabel="10 dnia"
          value={calc.wyplata1}
          icon={<Banknote />}
          color="emerald"
        />
        <SummaryCard
          label="Lacznie"
          sublabel="caly miesiac"
          value={calc.total}
          icon={<Coins />}
          color="violet"
          highlight
        />
      </div>

      {/* Month save and finalize */}
      <Card className="overflow-hidden">
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                  <CalendarDays className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Miesiac rozliczenia</h3>
                  <p className="text-xs text-muted-foreground">
                    Podglad i zapis wyniku miesiecznego
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                W tym miejscu zapisujesz caly miesiac z podzialem na okres 1-15 oraz 16-31.
              </p>
            </div>

            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1.5 min-w-[190px]">
                <Label htmlFor="calc-month" className="text-xs font-medium">
                  Miesiac
                </Label>
                <Input
                  id="calc-month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    setSelectedMonth(e.target.value);
                  }}
                  disabled={isSaving}
                />
              </div>
              <div className="flex gap-2 items-center">
                {isMonthLoading ? (
                  <Badge variant="secondary" className="gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Wczytywanie
                  </Badge>
                ) : null}
                {isFinalized && <Badge variant="secondary">Miesiac zamkniety</Badge>}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SavedSplitCard
              label="Okres 1-15"
              detail="Wyplata 2 (25 dnia)"
              value={calc.wyplata2}
            />
            <SavedSplitCard
              label="Okres 16-31"
              detail="Wyplata 1 (10 dnia)"
              value={calc.wyplata1}
            />
            <SavedSplitCard
              label="Caly miesiac"
              detail="Suma obu okresow"
              value={calc.total}
              emphasize
            />
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/35 p-3">
            <label
              htmlFor="month-end-confirmation"
              className={cn(
                "flex items-start gap-3 text-xs leading-5",
                isFinalized ? "text-muted-foreground/70" : "text-muted-foreground"
              )}
            >
              <input
                id="month-end-confirmation"
                type="checkbox"
                checked={confirmMonthEnd}
                onChange={(e) => setConfirmMonthEnd(e.target.checked)}
                disabled={isFinalized || isMonthLoading || isSaving}
                className="mt-0.5 h-4 w-4 rounded border-border bg-background text-primary"
              />
              <span>
                Potwierdzam, ze to na pewno koniec miesiaca: wszystkie godziny sa wpisane,
                wszystkie zamowienia rozliczone i nie bedzie juz nowych danych do tego miesiaca.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => saveMonth(false)}
              disabled={isMonthLoading || isSaving || isFinalized || !hasValidMonth}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Zapisywanie
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Zapisz miesiac
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => saveMonth(true)}
              disabled={
                isMonthLoading ||
                isSaving ||
                isFinalized ||
                !confirmMonthEnd ||
                !hasValidMonth
              }
            >
              <Lock className="h-4 w-4" />
              Zapisz i zamknij miesiac
            </Button>
            <p className="text-xs text-muted-foreground sm:ml-2">
              Po zamknieciu miesiaca pola kalkulatora sa tylko do odczytu.
            </p>
          </div>

          {(savedAtLabel || finalizedAtLabel) && (
            <div className="text-xs text-muted-foreground space-y-1">
              {savedAtLabel && <p>Ostatni zapis: {savedAtLabel}</p>}
              {finalizedAtLabel && <p>Miesiac zamkniety: {finalizedAtLabel}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hours card */}
        <Card className="overflow-hidden">
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Godziny pracy</h3>
                <p className="text-xs text-muted-foreground">Stawka: {HOURLY_RATE} zl/h</p>
              </div>
              {calc.totalHours > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs font-normal">
                  {calc.totalHours}h lacznie
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="h1"
                label="Okres 1-15"
                hint="Wyplata 2 (25.)"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={hoursP1}
                onChange={setHoursP1}
                suffix="h"
                disabled={inputsLocked}
              />
              <InputField
                id="h2"
                label="Okres 16-31"
                hint="Wyplata 1 (10.)"
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                value={hoursP2}
                onChange={setHoursP2}
                suffix="h"
                disabled={inputsLocked}
              />
            </div>
          </CardContent>
        </Card>

        {/* Km + Orders + Tips card */}
        <Card className="overflow-hidden">
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
                <Bike className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Kilometry, zamowienia, napiwki</h3>
                <p className="text-xs text-muted-foreground">Dodatkowe bonusy do Wyplaty 1</p>
              </div>
            </div>

            <InputField
              id="km"
              label="Kilometry"
              hint={`${KM_RATE} zl/km`}
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              value={totalKm}
              onChange={setTotalKm}
              suffix="km"
              disabled={inputsLocked}
            />

            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="wd"
                label="Zamowienia pon-czw"
                type="number"
                min="0"
                placeholder="0"
                value={weekdayOrders}
                onChange={setWeekdayOrders}
                disabled={inputsLocked}
              />
              <InputField
                id="we"
                label="Zamowienia pt-ndz"
                type="number"
                min="0"
                placeholder="0"
                value={weekendOrders}
                onChange={setWeekendOrders}
                disabled={inputsLocked}
              />
            </div>

            <InputField
              id="tips"
              label="Napiwki"
              hint="caly miesiac"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={tips}
              onChange={setTips}
              suffix="zl"
              disabled={inputsLocked}
            />
          </CardContent>
        </Card>
      </div>

      {/* Breakdown section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wyplata 2 breakdown */}
        <Card className="overflow-hidden">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10">
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Wyplata 2 — 25 dnia</h3>
                  <p className="text-xs text-muted-foreground">Godziny z okresu 1-15</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-400">
                {formatPLN(calc.wyplata2)}
              </span>
            </div>

            <div className="space-y-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
              <BreakdownRow
                icon={<Clock />}
                label="Godziny"
                detail={`${calc.h1}h x ${HOURLY_RATE} zl`}
                value={calc.baseP1}
              />
            </div>
          </CardContent>
        </Card>

        {/* Wyplata 1 breakdown */}
        <Card className="overflow-hidden">
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
                  <Banknote className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Wyplata 1 — 10 dnia</h3>
                  <p className="text-xs text-muted-foreground">Godziny 16-31 + wszystkie bonusy</p>
                </div>
              </div>
              <span className="text-lg font-bold text-emerald-400">
                {formatPLN(calc.wyplata1)}
              </span>
            </div>

            <div className="space-y-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-4">
              <BreakdownRow
                icon={<Clock />}
                label="Godziny"
                detail={`${calc.h2}h x ${HOURLY_RATE} zl`}
                value={calc.baseP2}
              />
              <BreakdownRow
                icon={<Shirt />}
                label="Pranie"
                detail={`${calc.totalHours}h x ${LAUNDRY_RATE} zl`}
                value={calc.totalLaundry}
              />
              <BreakdownRow
                icon={<Smartphone />}
                label="Bonus telefon"
                detail={
                  calc.totalHours <= 40
                    ? `${calc.totalHours}h x ${PHONE_RATE_UNDER_40} zl`
                    : `ryczalt >40h`
                }
                value={calc.totalPhoneBonus}
              />
              <BreakdownRow
                icon={<Bike />}
                label="Kilometry"
                detail={`${calc.km} km x ${KM_RATE} zl`}
                value={calc.kmBonus}
              />
              <BreakdownRow
                icon={<Package />}
                label="Bonusy zamowien"
                detail={`${calc.wdOrders} x${calc.wdMultiplier} + ${calc.weOrders} x${calc.weMultiplier}`}
                value={calc.orderBonus}
              />
              <BreakdownRow icon={<HandCoins />} label="Napiwki" value={calc.tipsVal} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order tier indicator */}
      <Card className="overflow-hidden">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Progi zamowien</h3>
              <p className="text-xs text-muted-foreground">
                {calc.totalOrders > 0
                  ? `${calc.totalOrders} zamowien — prog: ${ORDER_TIERS[activeTier].range}`
                  : "Wpisz zamowienia aby zobaczyc aktywny prog"}
              </p>
            </div>
            {calc.totalOrders > 0 && (
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-normal gap-1">
                  pon-czw: <span className="font-semibold">x{calc.wdMultiplier} zl</span>
                </Badge>
                <Badge variant="outline" className="text-xs font-normal gap-1">
                  pt-ndz: <span className="font-semibold">x{calc.weMultiplier} zl</span>
                </Badge>
              </div>
            )}
          </div>

          {/* Tier steps */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {ORDER_TIERS.map((tier, i) => {
              const isActive = i === activeTier;
              const isPast = i < activeTier;
              return (
                <div key={tier.range} className="space-y-1.5">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-colors",
                      isActive
                        ? "bg-amber-500"
                        : isPast
                          ? "bg-amber-500/40"
                          : "bg-muted"
                    )}
                  />
                  <div
                    className={cn(
                      "rounded-lg border p-2.5 text-center transition-all",
                      isActive
                        ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        isActive
                          ? "text-amber-400"
                          : "text-muted-foreground"
                      )}
                    >
                      {tier.range}
                    </p>
                    <div className="mt-1 space-y-0.5">
                      <p
                        className={cn(
                          "text-[10px]",
                          isActive ? "text-foreground" : "text-muted-foreground/70"
                        )}
                      >
                        pon-czw: x{tier.wd}
                      </p>
                      <p
                        className={cn(
                          "text-[10px]",
                          isActive ? "text-foreground" : "text-muted-foreground/70"
                        )}
                      >
                        pt-ndz: x{tier.we}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function SummaryCard({
  label,
  sublabel,
  value,
  icon,
  color,
  highlight,
}: {
  label: string;
  sublabel: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "violet";
  highlight?: boolean;
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-500/10",
      icon: "text-blue-500",
      value: "text-blue-400",
      gradient: "from-blue-500/5 to-transparent",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      icon: "text-emerald-500",
      value: "text-emerald-400",
      gradient: "from-emerald-500/5 to-transparent",
    },
    violet: {
      bg: "bg-violet-500/10",
      icon: "text-violet-500",
      value: "text-foreground",
      gradient: "from-violet-500/5 to-transparent",
    },
  };
  const c = colorMap[color];

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        highlight && "ring-1 ring-violet-500/20 border-violet-500/30"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", c.gradient)} />
      <CardContent className="relative pt-5 pb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("flex items-center justify-center h-7 w-7 rounded-md", c.bg)}>
            {renderIconWithClass(icon, cn("h-3.5 w-3.5", c.icon))}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground/60">{sublabel}</p>
          </div>
        </div>
        <p className={cn("text-2xl font-bold tracking-tight", c.value)}>{formatPLN(value)}</p>
      </CardContent>
    </Card>
  );
}

function SavedSplitCard({
  label,
  detail,
  value,
  emphasize,
}: {
  label: string;
  detail: string;
  value: number;
  emphasize?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-muted/30 px-4 py-3.5",
        emphasize && "bg-primary/5 border-primary/30"
      )}
    >
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-semibold mt-1", emphasize && "text-primary")}>{formatPLN(value)}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{detail}</p>
    </div>
  );
}

function InputField({
  id,
  label,
  hint,
  suffix,
  value,
  onChange,
  ...inputProps
}: {
  id: string;
  label: string;
  hint?: string;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<React.ComponentProps<"input">, "onChange" | "value" | "id">) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(suffix && "pr-10")}
          {...inputProps}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function BreakdownRow({
  icon,
  label,
  detail,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  detail?: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        {renderIconWithClass(icon, "h-3.5 w-3.5 text-muted-foreground/60 shrink-0")}
        <span className="text-sm text-muted-foreground truncate">{label}</span>
        {detail && (
          <span className="text-[10px] text-muted-foreground/50 truncate hidden sm:inline">
            {detail}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-sm font-medium tabular-nums shrink-0",
          value === 0 && "text-muted-foreground/40"
        )}
      >
        {formatPLN(value)}
      </span>
    </div>
  );
}
