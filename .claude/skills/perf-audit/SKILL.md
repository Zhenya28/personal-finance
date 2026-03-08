---
name: perf-audit
description: Audit performance of the finance dashboard. Analyzes bundle size, database queries, rendering patterns, caching strategies, and Next.js-specific optimizations. Use when the app feels slow or before deployment.
context: fork
agent: Explore
---

# Performance Audit — Finance Dashboard

Conduct a thorough performance analysis of the Next.js finance dashboard.

## Audit Areas

### 1. Database Query Efficiency
- Check `app/page.tsx` (Overview) — it runs many parallel Prisma queries
- Look for N+1 query patterns
- Check if `groupBy`, `aggregate` are used efficiently
- Verify indexes on frequently queried fields (date ranges)
- Check `revalidate` settings on pages

### 2. Bundle Size
- Analyze `"use client"` boundaries — are we shipping too much JS?
- Check for heavy dependencies pulled into client bundles (recharts, date-fns)
- Look for tree-shaking opportunities (named imports vs barrel imports)
- Review `lucide-react` imports (should use individual icon imports)

### 3. Next.js Patterns
- Server vs client component split — are forms/interactivity properly isolated?
- Dynamic imports for heavy components (charts, dialogs)
- Image optimization usage
- Metadata and SEO
- `revalidate` settings (currently set to 0 — consider if ISR would help)

### 4. Rendering Performance
- Look for unnecessary re-renders in client components
- Check if `useTransition` is used for non-urgent updates
- Verify `Suspense` boundaries for streaming
- Check for layout shifts caused by data loading

### 5. Caching Strategy
- `revalidate = 0` means no caching — is this intentional for all pages?
- External API calls (Yahoo Finance, VWCE data) — should these be cached?
- FX rate fetching — cached? Rate limited?

### 6. Data Fetching Patterns
- `Promise.all` usage for parallel queries — good
- Are there waterfall patterns to fix?
- Any redundant data fetching across components?

## Process

1. Read all page files (`app/*/page.tsx`)
2. Read all server actions (`actions/*.ts`)
3. Read layout and client components
4. Check `package.json` for heavy deps
5. Analyze `next.config.ts` for optimization settings

## Output

Produce a prioritized list of issues:
- **Critical**: Directly impacts load time or UX
- **Medium**: Optimization opportunity
- **Low**: Nice-to-have improvement

For each issue, provide the exact fix with code.

$ARGUMENTS
