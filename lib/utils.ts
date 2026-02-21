import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPLN(amount: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd.MM.yyyy", { locale: pl });
}

export function formatMonth(date: Date): string {
  return format(date, "yyyy-MM");
}

export function getCurrentMonth(): string {
  return formatMonth(new Date());
}

export function getMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return format(date, "LLL yyyy", { locale: pl });
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(formatMonth(d));
  }
  return months;
}

export const INCOME_CATEGORY_LABELS: Record<string, string> = {
  BASE: "Podstawa",
  TIPS: "Napiwki",
  BONUS: "Bonus",
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  FOOD: "Jedzenie",
  TRANSPORT: "Transport",
  SUBSCRIPTIONS: "Subskrypcje",
  FUN: "Rozrywka",
  OTHER: "Inne",
};

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  FOOD: "#f97316",
  TRANSPORT: "#3b82f6",
  SUBSCRIPTIONS: "#8b5cf6",
  FUN: "#ec4899",
  OTHER: "#6b7280",
};

export const INCOME_CATEGORY_COLORS: Record<string, string> = {
  BASE: "#22c55e",
  TIPS: "#eab308",
  BONUS: "#06b6d4",
};
