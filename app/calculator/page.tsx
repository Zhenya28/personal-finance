"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatPLN } from "@/lib/utils";
import {
  Clock,
  Bike,
  Package,
  Banknote,
  Calculator,
  CalendarDays,
  Coins,
} from "lucide-react";

// --- CONSTANTS ---
const HOURLY_RATE = 31.4;
const LAUNDRY_RATE = 0.1;
const PHONE_RATE_UNDER_40 = 0.62;
const PHONE_FLAT_OVER_40 = 25;
const KM_RATE = 0.55;

// Order bonus multipliers by total monthly orders
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

// --- COMPONENT ---
export default function CalculatorPage() {
  const [hoursP1, setHoursP1] = useState(""); // period 1-15 (Wypłata 2)
  const [hoursP2, setHoursP2] = useState(""); // period 16-31 (Wypłata 1)
  const [totalKm, setTotalKm] = useState("");
  const [weekdayOrders, setWeekdayOrders] = useState("");
  const [weekendOrders, setWeekendOrders] = useState("");
  const [tips, setTips] = useState("");

  const calc = useMemo(() => {
    const h1 = parseFloat(hoursP1) || 0;
    const h2 = parseFloat(hoursP2) || 0;
    const totalHours = h1 + h2;
    const km = parseFloat(totalKm) || 0;
    const wdOrders = parseInt(weekdayOrders) || 0;
    const weOrders = parseInt(weekendOrders) || 0;
    const totalOrders = wdOrders + weOrders;
    const tipsVal = parseFloat(tips) || 0;

    // Hourly components (split per period)
    const baseP1 = h1 * HOURLY_RATE;
    const baseP2 = h2 * HOURLY_RATE;
    const laundryP1 = h1 * LAUNDRY_RATE;
    const laundryP2 = h2 * LAUNDRY_RATE;

    // Phone bonus (based on total hours, proportionally split)
    const totalPhoneBonus = calcPhoneBonus(totalHours);
    const phoneBonusP1 = totalHours > 0 ? totalPhoneBonus * (h1 / totalHours) : 0;
    const phoneBonusP2 = totalHours > 0 ? totalPhoneBonus * (h2 / totalHours) : 0;

    // Km bonus (all in Wypłata 1)
    const kmBonus = km * KM_RATE;

    // Order bonus (all in Wypłata 1)
    const wdMultiplier = getMultiplier(totalOrders, WEEKDAY_MULTIPLIERS);
    const weMultiplier = getMultiplier(totalOrders, WEEKEND_MULTIPLIERS);
    const orderBonus = wdOrders * wdMultiplier + weOrders * weMultiplier;

    // Wypłata 2 (25th) = hours from 1-15 only
    const wyplata2 = baseP1 + laundryP1 + phoneBonusP1;

    // Wypłata 1 (10th) = hours from 16-31 + all bonuses + tips
    const wyplata1 = baseP2 + laundryP2 + phoneBonusP2 + kmBonus + orderBonus + tipsVal;

    const total = wyplata1 + wyplata2;

    return {
      h1, h2, totalHours, km, wdOrders, weOrders, totalOrders, tipsVal,
      baseP1, baseP2, laundryP1, laundryP2,
      phoneBonusP1, phoneBonusP2, totalPhoneBonus,
      kmBonus, orderBonus, wdMultiplier, weMultiplier,
      wyplata1, wyplata2, total,
    };
  }, [hoursP1, hoursP2, totalKm, weekdayOrders, weekendOrders, tips]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Calculator className="h-6 w-6" />
        Kalkulator Wypłat
      </h2>

      {/* Input Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Godziny pracy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="h1" className="text-xs text-muted-foreground">
                  Okres 1-15 → Wypłata 2 (25.)
                </Label>
                <Input
                  id="h1"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  value={hoursP1}
                  onChange={(e) => setHoursP1(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="h2" className="text-xs text-muted-foreground">
                  Okres 16-31 → Wypłata 1 (10.)
                </Label>
                <Input
                  id="h2"
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="0"
                  value={hoursP2}
                  onChange={(e) => setHoursP2(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Łącznie: <strong>{calc.totalHours}h</strong> •
              Stawka: {HOURLY_RATE} zł/h + {LAUNDRY_RATE} zł/h (pranie)
            </p>
          </CardContent>
        </Card>

        {/* Km + Orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bike className="h-4 w-4 text-green-500" />
              Kilometry i zamówienia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="km" className="text-xs text-muted-foreground">
                Kilometry (rower — {KM_RATE} zł/km)
              </Label>
              <Input
                id="km"
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                value={totalKm}
                onChange={(e) => setTotalKm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wd" className="text-xs text-muted-foreground">
                  Zamówienia pon-czw
                </Label>
                <Input
                  id="wd"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={weekdayOrders}
                  onChange={(e) => setWeekdayOrders(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="we" className="text-xs text-muted-foreground">
                  Zamówienia pt-ndz
                </Label>
                <Input
                  id="we"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={weekendOrders}
                  onChange={(e) => setWeekendOrders(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tips" className="text-xs text-muted-foreground">
                Napiwki (cały miesiąc)
              </Label>
              <Input
                id="tips"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Wypłata 2 — 25th */}
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Wypłata 2 — 25 dnia
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Godziny z okresu 1-15 ({calc.h1}h)
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Row label={`Godziny (${calc.h1}h × ${HOURLY_RATE} zł)`} value={calc.baseP1} />
            <Row label={`Pranie (${calc.h1}h × ${LAUNDRY_RATE} zł)`} value={calc.laundryP1} />
            <Row label="Bonus telefon" value={calc.phoneBonusP1} />
            <Separator />
            <div className="flex justify-between font-bold text-lg pt-1">
              <span>Razem</span>
              <span className="text-blue-600">{formatPLN(calc.wyplata2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Wypłata 1 — 10th */}
        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4 text-green-500" />
              Wypłata 1 — 10 dnia
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Godziny 16-31 ({calc.h2}h) + bonusy + napiwki
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Row label={`Godziny (${calc.h2}h × ${HOURLY_RATE} zł)`} value={calc.baseP2} />
            <Row label={`Pranie (${calc.h2}h × ${LAUNDRY_RATE} zł)`} value={calc.laundryP2} />
            <Row label="Bonus telefon" value={calc.phoneBonusP2} />
            <Row label={`Kilometry (${calc.km} km × ${KM_RATE} zł)`} value={calc.kmBonus} />
            <Row
              label={`Bonusy zamówień`}
              value={calc.orderBonus}
              subtitle={`${calc.wdOrders} ×${calc.wdMultiplier} zł + ${calc.weOrders} ×${calc.weMultiplier} zł`}
            />
            <Row label="Napiwki" value={calc.tipsVal} />
            <Separator />
            <div className="flex justify-between font-bold text-lg pt-1">
              <span>Razem</span>
              <span className="text-green-600">{formatPLN(calc.wyplata1)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Podsumowanie miesiąca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wypłata 2 (25.)</span>
              <span className="text-blue-600 font-medium">{formatPLN(calc.wyplata2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wypłata 1 (10.)</span>
              <span className="text-green-600 font-medium">{formatPLN(calc.wyplata1)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-xl pt-1">
              <span>Łącznie</span>
              <span>{formatPLN(calc.total)}</span>
            </div>

            <Separator className="my-3" />
            <p className="text-xs font-medium text-muted-foreground mb-2">Składniki</p>
            <div className="space-y-1.5">
              <MiniRow label="Godziny" value={calc.baseP1 + calc.baseP2} />
              <MiniRow label="Pranie" value={calc.laundryP1 + calc.laundryP2} />
              <MiniRow label="Bonus telefon" value={calc.totalPhoneBonus} />
              <MiniRow label="Kilometry" value={calc.kmBonus} />
              <MiniRow label="Bonusy zamówień" value={calc.orderBonus} />
              <MiniRow label="Napiwki" value={calc.tipsVal} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order bonus reference table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Tabela mnożników zamówień
            {calc.totalOrders > 0 && (
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                Twój próg: {calc.totalOrders} zamówień →
                pon-czw: ×{calc.wdMultiplier} zł, pt-ndz: ×{calc.weMultiplier} zł
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">Próg zamówień</th>
                  <th className="text-center py-2 px-4 font-medium">Pon-Czw</th>
                  <th className="text-center py-2 pl-4 font-medium">Pt-Ndz</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: "0-49", wd: "×0", we: "×0" },
                  { range: "50-124", wd: "×1 zł", we: "×1 zł" },
                  { range: "125-249", wd: "×1 zł", we: "×2 zł" },
                  { range: "250-399", wd: "×1.5 zł", we: "×3 zł" },
                  { range: "400-549", wd: "×2 zł", we: "×4 zł" },
                  { range: "550+", wd: "×2.5 zł", we: "×5 zł" },
                ].map((row, i) => {
                  const isActive =
                    calc.totalOrders >= [0, 50, 125, 250, 400, 550][i] &&
                    (i === 5 || calc.totalOrders < [50, 125, 250, 400, 550, Infinity][i]);
                  return (
                    <tr
                      key={row.range}
                      className={cn(
                        "border-b last:border-0",
                        isActive && "bg-primary/10 font-medium"
                      )}
                    >
                      <td className="py-2 pr-4">{row.range}</td>
                      <td className="py-2 px-4 text-center">{row.wd}</td>
                      <td className="py-2 pl-4 text-center">{row.we}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function Row({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: number;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{formatPLN(value)}</span>
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground/70 text-right">{subtitle}</p>
      )}
    </div>
  );
}

function MiniRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatPLN(value)}</span>
    </div>
  );
}
