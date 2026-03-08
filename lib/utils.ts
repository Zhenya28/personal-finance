import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export const ALL_MONTHS_VALUE = "all";
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

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

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
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

export function isValidMonth(value: string | null | undefined): value is string {
  return typeof value === "string" && MONTH_REGEX.test(value);
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
  WYPLATA_1: "Wypłata 1",
  WYPLATA_2: "Wypłata 2",
  INNE: "Inne",
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  ZAKUPY: "Zakupy spożywcze",
  RESTAURACJE: "Restauracje",
  TRANSPORT: "Transport",
  SUBSCRIPTIONS: "Subskrypcje",
  MIESZKANIE: "Mieszkanie",
  FUN: "Rozrywka",
  OTHER: "Inne",
};

export const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  ZAKUPY: "#f97316",
  RESTAURACJE: "#ef4444",
  TRANSPORT: "#3b82f6",
  SUBSCRIPTIONS: "#8b5cf6",
  MIESZKANIE: "#14b8a6",
  FUN: "#ec4899",
  OTHER: "#6b7280",
};

export const INCOME_CATEGORY_COLORS: Record<string, string> = {
  WYPLATA_1: "#22c55e",
  WYPLATA_2: "#3b82f6",
  INNE: "#8b5cf6",
};

export const CATEGORY_ICONS: Record<string, string> = {
  ZAKUPY: "🛍️",
  RESTAURACJE: "☕",
  TRANSPORT: "🚕",
  SUBSCRIPTIONS: "🎬",
  MIESZKANIE: "🏠",
  FUN: "🎮",
  OTHER: "🧾",
  WYPLATA_1: "💼",
  WYPLATA_2: "💼",
  INNE: "💸",
};

export function getCategoryIcon(
  category: string,
  type?: "income" | "expense"
): string {
  return CATEGORY_ICONS[category] || (type === "income" ? "💸" : "🧾");
}
