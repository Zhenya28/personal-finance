---
name: quick-fix
description: Quickly fix a bug or issue in the finance dashboard. Diagnoses the problem, finds the root cause, and applies a minimal fix. Use for errors, broken features, styling issues, or unexpected behavior.
argument-hint: "[error-or-issue-description]"
---

# Quick Fix — Finance Dashboard

Diagnose and fix an issue with minimal changes.

## Diagnosis Process

1. **Understand the symptom** — what exactly is broken?
2. **Locate the source** — which file(s) are involved?
3. **Find root cause** — read the relevant code
4. **Apply minimal fix** — change only what's necessary
5. **Verify** — check that the fix doesn't break anything else

## Common Issue Patterns

### Build Errors
- Missing imports → check the component file
- Type errors → check Prisma types match usage
- Server/client boundary → `"use client"` missing or server action called wrong

### Runtime Errors
- Prisma query failures → check schema matches query
- `revalidatePath` not working → check path string matches route
- FormData parsing → check `name` attributes match `formData.get()`

### Styling Issues
- Dark mode broken → missing `dark:` variant
- Layout shifts → missing width/height on dynamic content
- Mobile overflow → check responsive breakpoints

### Data Issues
- Wrong month data → check date range calculation (startOfMonth, endOfMonth)
- Missing categories → check enum values in schema vs. labels in utils.ts
- Currency conversion → check `getFxRate` call and fallback

## File Map for Quick Reference
- **Pages**: `app/{section}/page.tsx`
- **Components**: `components/{section}/*.tsx`
- **Server Actions**: `actions/*.ts`
- **Schema**: `prisma/schema.prisma`
- **Utils**: `lib/utils.ts`
- **Prisma client**: `lib/prisma.ts`
- **FX rates**: `lib/yahoo.ts`
- **Layout**: `app/layout.tsx`, `components/layout/Sidebar.tsx`
- **UI primitives**: `components/ui/*.tsx`

## Rules
- Fix the bug, nothing else — don't refactor surrounding code
- Don't add new dependencies unless absolutely necessary
- Preserve existing behavior
- If the fix requires a schema change, note that migration is needed

Issue to fix: $ARGUMENTS
