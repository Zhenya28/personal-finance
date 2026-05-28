# MyFinance — Personal Tracker

Osobisty panel do zarzadzania finansami (PWA, Next.js 16). Sledzi przychody, wydatki, oszczednosci wielowalutowe oraz inwestycje w VWCE.DE, z rozpoznawaniem transakcji ze zdjec (Gemini Vision) i importem wyciagow mBank.

UI w jezyku polskim, jednouzytkownikowa, autoryzacja jednym haslem (cookie JWT, 30 dni).

## Funkcje

- **Dashboard** — saldo netto, cashflow 6m, rozklad wydatkow, net worth (PLN po przeliczeniu walut)
- **Transakcje / Przychody / Wydatki** — listy z filtrami, inline-edit, deduplikacja sygnatura `amount|category|description|date`
- **Oszczednosci** — konta w PLN/USD/EUR/GBP/CHF, depozyty/wyplaty w transakcji atomowej (`prisma.$transaction`), suma w PLN po kursie Yahoo
- **Inwestycje** — VWCE.DE, kwota PLN konwertowana po aktualnym EUR/PLN, P&L, DCA, wykres historyczny
- **Skaner AI** (`/scan`) — Gemini 2.5 Flash analizuje screenshot bankowy i proponuje transakcje
- **Import CSV** (`/import`) — parser mBank (BOM, polskie znaki, roznie formaty dat), kategoryzacja: heurystyka -> Gemini batch -> fallback
- **Kalkulator** — rozliczenie miesiaca kuriera (stawki godzinowe, mnozniki za zamowienia, finalizacja miesiaca)
- **Eksport** (`GET /api/export`) — streamowany JSON cala bazy z cursor-pagination

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript 5
- Prisma 6 + Supabase Postgres
- shadcn/ui + Tailwind v4 (oklch) + Lucide + Framer Motion
- Recharts 3, date-fns (locale `pl`), Sonner
- `jose` (JWT), `yahoo-finance2`, Gemini API

## Konfiguracja

```bash
cp .env.example .env.local
# uzupelnij DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_PASSWORD, GEMINI_API_KEY
npm install
npx prisma migrate deploy
npm run dev
```

## Komendy

- `npm run dev` — dev server
- `npm run build` — `prisma generate` + `next build`
- `npm run lint`
- `npx prisma migrate dev --name <name>`
- `npx prisma db push` — push schematu bez migracji

## Struktura

- `app/` — strony App Router + `app/api/*` (auth, scan, scan/save, export, investments/history, calculator/monthly)
- `actions/` — server actions (`"use server"`) z `revalidatePath`
- `lib/` — `prisma`, `auth` (jose + SHA256 + timingSafeEqual), `yahoo` (cache 120s/300s przez `unstable_cache`), `mbank-parser`, `transaction-dedupe`, `utils`
- `components/{domena}/` — komponenty per sekcja, `components/ui/` to shadcn
- `prisma/schema.prisma` — modele Income, Expense, Investment, SavingsAccount, SavingsTransaction, CalculatorMonthlyResult
- `proxy.ts` — Next.js 16 proxy (dawniej `middleware.ts`), wymusza sesje na wszystkich trasach poza `/login`, `/api/auth`, statykami i `~offline`

## Antigravity

`/antigravity/*` to laboratorium designu (mockupy HTML zaadaptowane do React). Dostepne **tylko w `NODE_ENV !== "production"`** — w produkcji proxy zwraca 404.
