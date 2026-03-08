---
name: server-action
description: Create or modify Next.js server actions for the finance dashboard. Handles CRUD operations, data validation, and cache revalidation following project patterns. Use when adding new data operations or API-like functionality.
argument-hint: "[action-name] [description]"
---

# Server Action Builder

Create server actions following the established patterns in `actions/` directory.

## Project Patterns

**Location:** `actions/*.ts`
**Directive:** `"use server"` at top of file
**Imports:**
```typescript
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EnumType } from "@prisma/client";
```

**Standard CRUD Pattern:**

```typescript
// CREATE
export async function addItem(formData: FormData) {
  const field = formData.get("field") as string;
  const amount = parseFloat(formData.get("amount") as string);
  // ... parse all fields

  await prisma.model.create({
    data: { field, amount, /* ... */ },
  });

  revalidatePath("/", "layout");
  revalidatePath("/section", "layout");
}

// EDIT
export async function editItem(formData: FormData) {
  const id = formData.get("id") as string;
  // ... parse fields

  await prisma.model.update({
    where: { id },
    data: { /* ... */ },
  });

  revalidatePath("/", "layout");
  revalidatePath("/section", "layout");
}

// DELETE
export async function deleteItem(id: string) {
  await prisma.model.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/section", "layout");
}

// DUPLICATE
export async function duplicateItem(id: string) {
  const item = await prisma.model.findUnique({ where: { id } });
  if (!item) return;

  await prisma.model.create({
    data: {
      // copy fields, set new date
      date: new Date(),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/section", "layout");
}
```

## Existing Action Files
- `actions/transactions.ts` — addIncome, editIncome, addExpense, editExpense, duplicateExpense, deleteIncome, deleteExpense
- `actions/investments.ts` — addInvestment, deleteInvestment, fetchVWCEData
- `actions/savings.ts` — addSavingsAccount, updateSavingsBalance, deleteSavingsAccount
- `actions/recurring.ts` — addRecurring, deleteRecurring, toggleRecurring, applyRecurringTemplates
- `actions/scan.ts` — scanReceipt (AI receipt scanning)

## Rules
1. Always use `"use server"` directive
2. Parse FormData fields with proper type casting
3. Always `revalidatePath` for both root `/` and the section path
4. Use `"layout"` as second arg to revalidatePath for full tree revalidation
5. Return values only when the caller needs them (e.g., `applyRecurringTemplates` returns count)
6. Don't add try/catch in server actions — let errors propagate to the client's catch block
7. Keep actions focused — one operation per function

Action to create: $ARGUMENTS
