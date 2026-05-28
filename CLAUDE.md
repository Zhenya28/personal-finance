# Finance Dashboard — Personal Tracker PWA

## Project Overview
Personal finance dashboard PWA built with Next.js 16 (App Router, Turbopack). Tracks income, expenses, investments (VWCE ETF), and multi-currency savings. Polish-language UI.

## Tech Stack
- **Framework:** Next.js 16, React 19, TypeScript 5
- **Database:** Prisma 6 + Supabase PostgreSQL
- **UI:** shadcn/ui + Tailwind CSS v4 (oklch colors) + Lucide icons
- **Charts:** Recharts 3
- **Other:** date-fns, yahoo-finance2, Sonner (toasts), Gemini 2.5 Flash (scan + CSV categorization), `jose` (JWT auth)

## Architecture Patterns
- Server Components by default, `"use client"` only for interactivity
- Server Actions in `actions/*.ts` with `"use server"`, FormData parsing, `revalidatePath`
- Pages in `app/{section}/page.tsx` fetch data via Prisma, pass to client components
- Components organized by domain: `components/{section}/`
- Shared UI in `components/ui/` (shadcn) and `components/overview/` (dashboard)

## Design System
- **Colors:** emerald=income, red=expenses, blue=investments, amber=savings, violet=overview/scan, orange=recurring
- **Cards:** gradient accent bar (`h-1 bg-gradient-to-r`), icon badges (`h-8 w-8 rounded-lg`)
- **Forms:** compact inputs (`h-9`), `text-xs` labels, grid layouts
- **Lists:** card-based with `divide-y divide-border`, hover states
- **Typography:** `tabular-nums` for numbers, `tracking-tight` for headings

## Key Files
- `lib/utils.ts` — formatPLN, formatDate, parseLocalDate (no UTC shift), getLast6Months(ref)
- `lib/prisma.ts` — Prisma client singleton + `sumByMonth()` raw helper
- `lib/yahoo.ts` — cached quote/FX/historical + `getFxRatesToPln(currencies)` helper
- `lib/auth.ts` — JWT session, rolling refresh, in-memory rate limit for login
- `lib/validation.ts` — `parseAmount`, `parseIncomeCategory`, `parseExpenseCategory`, `parseCurrency`
- `lib/transaction-dedupe.ts` — signature uses day-key (no time component)
- `prisma/schema.prisma` — all data models, composite indexes on (category, date)
- `components/ui/confirm-delete-dialog.tsx` — reusable delete confirmation

## Conventions
- All user-facing text in **Polish**
- No emoji in code
- `revalidate = 60` on Prisma+Yahoo pages (`/`, `/income`, `/expenses`, `/investments`, `/savings`); `revalidate = 0` on `/transactions` and `/import`
- MonthFilter shared across `/`, `/transactions`, `/income`, `/expenses`
- Inline edit pattern with `editingId` state
- Search pattern with `searchQuery` state filtering
- All API routes guard with `verifySession()` from `lib/auth.ts`
- `/antigravity/*` is dev-only (404 in production via `proxy.ts`)

## Server actions contract
All server actions return `ActionResult = { ok: true } | { ok: false; error: string }`.
Clients should branch on `result.ok` and toast `result.error` on failure.

## Commands
- `npm run dev` — development server
- `npm run build` — production build (runs `prisma generate` first)
- `npx prisma migrate dev --name <name>` — database migration
- `npx prisma migrate deploy` — apply pending migrations (CI/prod)
- `npx prisma db push` — push schema without migration
