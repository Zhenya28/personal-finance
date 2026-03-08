---
name: prisma-schema
description: Design or modify the Prisma database schema for the finance dashboard. Use when adding new models, relations, enums, or fields. Generates migration-ready schema changes and corresponding TypeScript types.
argument-hint: "[model-or-change-description]"
---

# Prisma Schema Designer

Design database schema changes for the finance dashboard.

## Current Schema Overview

**File:** `prisma/schema.prisma`
**Database:** PostgreSQL (Supabase)
**ORM:** Prisma 6

**Existing Models:**
- `Income` — id, amount(Float), category(IncomeCategory), description?, date, createdAt
- `Expense` — id, amount(Float), category(ExpenseCategory), description?, date, createdAt
- `Investment` — id, ticker, units(Float), pricePerUnit(Float), commission(Float), date, createdAt
- `SavingsAccount` — id, name, currency(Currency), balance(Float), updatedAt, createdAt
- `RecurringExpense` — id, amount(Float), category(ExpenseCategory), description?, dayOfMonth(Int), active(Boolean), createdAt

**Existing Enums:**
- `IncomeCategory`: WYPLATA_1, WYPLATA_2, INNE
- `ExpenseCategory`: ZAKUPY, RESTAURACJE, TRANSPORT, SUBSCRIPTIONS, MIESZKANIE, FUN, OTHER
- `Currency`: PLN, USD, EUR, GBP, CHF

## Design Guidelines

1. **IDs**: Always use `@id @default(cuid())`
2. **Timestamps**: Include `createdAt DateTime @default(now())`, add `updatedAt DateTime @updatedAt` if the record is frequently updated
3. **Optional fields**: Use `?` for nullable fields (description, notes)
4. **Monetary amounts**: Use `Float` type (matching existing pattern)
5. **Defaults**: Provide sensible defaults with `@default()`
6. **Enums**: Create separate enum types for category-like fields
7. **Relations**: Use explicit relation names and cascade deletes when appropriate

## Process

1. Read current `prisma/schema.prisma`
2. Design the change (new model, field, or enum)
3. Show the exact schema addition
4. List the migration command: `npx prisma migrate dev --name <name>`
5. Show any corresponding changes needed in:
   - `lib/utils.ts` (category labels, colors)
   - Server actions
   - Components

## Output

Provide:
- The exact Prisma schema code to add/modify
- Migration name suggestion
- List of files that need corresponding updates
- Any data migration steps if modifying existing models

Schema change: $ARGUMENTS
