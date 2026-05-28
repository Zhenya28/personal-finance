import { IncomeCategory, ExpenseCategory, Currency } from "@prisma/client";

export const INCOME_CATEGORIES = Object.values(IncomeCategory) as IncomeCategory[];
export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory) as ExpenseCategory[];
export const CURRENCIES = Object.values(Currency) as Currency[];

export function parseAmount(raw: FormDataEntryValue | null): number | null {
  if (raw === null) return null;
  const trimmed = String(raw).trim().replace(",", ".");
  if (!trimmed) return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

export function parseIncomeCategory(
  raw: FormDataEntryValue | null
): IncomeCategory | null {
  if (raw === null) return null;
  const value = String(raw);
  return INCOME_CATEGORIES.includes(value as IncomeCategory)
    ? (value as IncomeCategory)
    : null;
}

export function parseExpenseCategory(
  raw: FormDataEntryValue | null
): ExpenseCategory | null {
  if (raw === null) return null;
  const value = String(raw);
  return EXPENSE_CATEGORIES.includes(value as ExpenseCategory)
    ? (value as ExpenseCategory)
    : null;
}

export function parseCurrency(
  raw: FormDataEntryValue | null
): Currency | null {
  if (raw === null) return null;
  const value = String(raw);
  return CURRENCIES.includes(value as Currency) ? (value as Currency) : null;
}
