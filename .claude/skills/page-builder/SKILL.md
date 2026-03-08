---
name: page-builder
description: Build a complete new page for the finance dashboard. Creates the route, server data fetching, client components, and integrates with the sidebar. Use when adding an entirely new section to the app.
argument-hint: "[page-name] [description]"
---

# Page Builder — Finance Dashboard

Create a complete new page following the established architecture patterns.

## Page Architecture

Every page in this app follows the same structure:

### 1. Route File: `app/{section}/page.tsx` (Server Component)
```tsx
import { prisma } from "@/lib/prisma";
import { getCurrentMonth, formatPLN } from "@/lib/utils";
import { MonthFilter } from "@/components/income/MonthFilter";
import { MetricCard } from "@/components/overview/MetricCard";
import { SectionIcon } from "lucide-react";
import { Suspense } from "react";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function SectionPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth = params.month || getCurrentMonth();
  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  // Fetch data with Prisma
  const data = await prisma.model.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
    orderBy: { date: "desc" },
  });

  // Compute metrics
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-{color}-500/10">
              <SectionIcon className="h-5 w-5 text-{color}-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Tytul</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-12">Opis sekcji</p>
        </div>
        <Suspense>
          <MonthFilter />
        </Suspense>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Metryka" value={formatPLN(total)} icon={SectionIcon} trend="neutral" />
      </div>

      {/* Form */}
      <Suspense>
        <SectionForm />
      </Suspense>

      {/* Data table/list */}
      <SectionTable data={data} />
    </div>
  );
}
```

### 2. Form Component: `components/{section}/SectionForm.tsx` (Client)
- `"use client"` directive
- Gradient accent bar at top of Card
- Icon badge + title
- Grid form layout with compact inputs (h-9)
- Server action via `action={handleSubmit}`
- Toast on success/error
- Uses `useSearchParams` for default date

### 3. Table/List Component: `components/{section}/SectionTable.tsx` (Client)
- `"use client"` directive
- Search input with filter state
- Inline edit with `editingId` state
- ConfirmDeleteDialog for delete
- Card with divide-y list items

### 4. Sidebar Integration: `components/layout/Sidebar.tsx`
- Add nav link with icon and label
- Follow existing link pattern with active state

## Existing Pages
- `/` — Overview (dashboard with metrics, charts)
- `/income` — Income tracking
- `/expenses` — Expense tracking
- `/investments` — VWCE ETF portfolio
- `/savings` — Multi-currency savings accounts
- `/scan` — AI receipt scanner
- `/calculator` — Financial calculator

## Checklist
1. Create `app/{section}/page.tsx` with server data fetching
2. Create `components/{section}/` directory
3. Create Form component with gradient bar + server action
4. Create Table/List component with search + edit + delete
5. Add server actions to `actions/` directory
6. Add sidebar navigation link
7. All text in Polish
8. Apply correct color from design system
9. Responsive grid layouts
10. Test with `npm run build`

Page to build: $ARGUMENTS
