# Finance Dashboard — Personal Tracker PWA

## Project Overview
Personal finance dashboard PWA built with Next.js 16 (App Router, Turbopack). Tracks income, expenses, investments (VWCE ETF), and multi-currency savings. Polish-language UI.

## Tech Stack
- **Framework:** Next.js 16, React 19, TypeScript 5
- **Database:** Prisma 6 + Supabase PostgreSQL
- **UI:** shadcn/ui + Tailwind CSS v4 (oklch colors) + Lucide icons
- **Charts:** Recharts 3
- **Other:** date-fns, yahoo-finance2, Sonner (toasts)

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
- `lib/utils.ts` — formatPLN, formatDate, category labels/colors
- `lib/prisma.ts` — Prisma client singleton
- `lib/yahoo.ts` — FX rate fetching
- `prisma/schema.prisma` — all data models
- `components/ui/confirm-delete-dialog.tsx` — reusable delete confirmation

## Conventions
- All user-facing text in **Polish**
- No emoji in code
- `revalidate = 0` on all pages (real-time data)
- MonthFilter shared across pages for month selection
- Inline edit pattern with `editingId` state
- Search pattern with `searchQuery` state filtering

## Commands
- `npm run dev` — development server
- `npm run build` — production build (runs `prisma generate` first)
- `npx prisma migrate dev --name <name>` — database migration
- `npx prisma db push` — push schema without migration
