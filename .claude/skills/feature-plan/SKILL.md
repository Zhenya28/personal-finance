---
name: feature-plan
description: Plan a new feature for the finance dashboard from concept to implementation. Analyzes architecture, identifies files to create/modify, designs data model, and produces a step-by-step implementation plan. Use when adding new functionality like reports, charts, new transaction types, or integrations.
argument-hint: "[feature-description]"
context: fork
agent: Plan
---

# Feature Planning — Finance Dashboard

Plan a new feature for the personal finance PWA dashboard. Produce a detailed, actionable implementation plan.

## Project Architecture

**Stack:** Next.js 16 (App Router, Turbopack) + Prisma 6 + Supabase PostgreSQL + shadcn/ui + Tailwind v4 + Recharts

**Key Patterns:**
- **Server Components** by default, `"use client"` only when interactivity needed
- **Server Actions** in `actions/*.ts` with `"use server"`, FormData params, `revalidatePath`
- **Prisma ORM** — schema at `prisma/schema.prisma`, migrations via `prisma migrate dev`
- **Page structure**: `app/{section}/page.tsx` (server component) fetches data, renders client components
- **Component dirs**: `components/{section}/` — forms, tables, charts per domain
- **Shared UI**: `components/ui/` (shadcn), `components/overview/` (dashboard widgets)
- **Utilities**: `lib/utils.ts` (formatPLN, formatDate, category labels/colors)

**Data Models:** Income, Expense, Investment, SavingsAccount, RecurringExpense
**Enums:** IncomeCategory (WYPLATA_1, WYPLATA_2, INNE), ExpenseCategory (ZAKUPY, RESTAURACJE, TRANSPORT, SUBSCRIPTIONS, MIESZKANIE, FUN, OTHER), Currency (PLN, USD, EUR, GBP, CHF)

## Planning Steps

1. **Explore** — Read relevant existing files to understand current patterns
2. **Data Model** — Design any new Prisma models/fields needed
3. **Server Actions** — Define CRUD actions with validation
4. **Page Changes** — Identify which pages need new data fetching
5. **Components** — List new components with props interfaces
6. **UI/UX Design** — Apply the design system (see `/ui-component` skill for patterns)
7. **Migration Path** — Note any breaking changes or data migrations
8. **Implementation Order** — Prioritize: schema → actions → components → page integration → build test

## Output Format

Produce a markdown plan with:
- Summary (2-3 sentences)
- Files to create (with full paths)
- Files to modify (with specific changes)
- Prisma schema changes (if any)
- Server actions to add
- Component tree with props
- Step-by-step implementation order
- Risk areas and edge cases

## Constraints
- This is a **Polish-language** app — all user-facing text in Polish
- Keep solutions simple — avoid over-engineering
- Prefer editing existing files over creating new ones
- Every card uses gradient accent bar pattern
- All monetary values use `formatPLN()` or `formatCurrency()`
- No emoji in code unless user specifically requests it

Feature to plan: $ARGUMENTS
