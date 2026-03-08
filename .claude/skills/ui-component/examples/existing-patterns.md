# Existing Component Patterns

## MetricCard (components/overview/MetricCard.tsx)
- Trend-based coloring: up=emerald, down=red, neutral=foreground
- Icon in colored bg badge
- Optional subtitle in text-[11px]

## IncomeOverviewCard (components/overview/IncomeOverviewCard.tsx)
- Shows breakdown: WYPLATA_1, WYPLATA_2, INNE
- Trend percentage with arrow icon
- Emerald color theme

## ExpenseTable (components/expenses/ExpenseTable.tsx)
- Client component with "use client"
- Search with `searchQuery` state filtering by description/amount
- Category filter with Select
- Inline edit with `editingId` state
- ConfirmDeleteDialog for delete
- Copy (duplicate) button
- Filtered count display: "X z Y" with sum

## ExpenseForm (components/expenses/ExpenseForm.tsx)
- Red gradient bar: `from-red-500 to-orange-400`
- Red icon badge with Plus icon
- 5-column grid form
- Uses `useSearchParams` for default date based on selected month
- Server action with toast feedback

## RecurringExpenses (components/expenses/RecurringExpenses.tsx)
- Orange gradient bar: `from-orange-500 to-amber-400`
- Collapsible add form with showForm state
- ON/OFF toggle per template
- "Zastosuj" (Apply) button to generate expenses from templates
- divide-y list layout

## ConfirmDeleteDialog (components/ui/confirm-delete-dialog.tsx)
- Reusable AlertDialog wrapper
- Props: onConfirm, title, description, triggerClassName
- Red destructive action button
- Polish text: "Potwierdzenie usuwania", "Anuluj", "Usun"

## SavingsSummary (components/savings/SavingsSummary.tsx)
- Per-currency badges with text icon (PLN=zl, EUR=E, USD=$, GBP=L, CHF=Fr)
- Amber color theme

## Common shadcn imports:
```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
```
