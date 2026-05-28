"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { PullToRefresh } from "./PullToRefresh";
import { QuickAddButton } from "./QuickAddButton";
import { MonthFilter } from "@/components/income/MonthFilter";
import { Suspense } from "react";

const QUICK_ADD_PATHS = new Set([
  "/",
  "/transactions",
  "/income",
  "/expenses",
]);

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Przeglad finansow osobistych" },
  "/transactions": { title: "Transakcje", subtitle: "Historia przeplywow i filtrowanie" },
  "/income": { title: "Przychody", subtitle: "Zrodla dochodu i trendy miesieczne" },
  "/expenses": { title: "Wydatki", subtitle: "Kontrola kosztow i kategorii" },
  "/savings": { title: "Oszczednosci", subtitle: "Poduszka finansowa i cele" },
  "/investments": { title: "Inwestycje", subtitle: "Wycena portfela i ekspozycja" },
  "/scan": { title: "Skaner AI", subtitle: "Rozpoznawanie transakcji ze zdjec" },
  "/import": { title: "Import CSV", subtitle: "Szybkie dodawanie historii transakcji" },
  "/calculator": { title: "Kalkulator", subtitle: "Symulacje i planowanie scenariuszy" },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const showGlobalMonthFilter =
    pathname === "/" ||
    pathname === "/transactions" ||
    pathname === "/income" ||
    pathname === "/expenses";
  const hasAllMonthsToggle = pathname === "/";
  const desktopMonthFilterWidth = hasAllMonthsToggle ? "w-[274px]" : "w-[228px]";
  const pageMeta = PAGE_META[pathname] || {
    title: "Finance",
    subtitle: "Panel finansowy",
  };

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="relative flex h-[100dvh] min-h-[100dvh] overflow-hidden bg-background">
      {/* Aurora background */}
      <div className="aurora-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <aside className="hidden h-[100dvh] w-[250px] shrink-0 border-r border-white/[0.06] bg-[#0e1525]/80 backdrop-blur-xl md:block relative z-10">
        <Sidebar />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[min(280px,84vw)] border-r border-white/[0.06] bg-[#0e1525]/95 backdrop-blur-xl p-0"
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col relative z-10">
        <header className="border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,20,40,0.92)_0%,rgba(10,15,30,0.86)_100%)] px-4 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl md:hidden">
          <div className="flex min-h-14 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.07]"
              aria-label="Otworz menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold leading-none text-white">
                {pageMeta.title}
              </p>
            </div>
          </div>

          {showGlobalMonthFilter ? (
            <div className="mt-2">
              <Suspense>
                <MonthFilter compact />
              </Suspense>
            </div>
          ) : null}
        </header>

        <header className="hidden h-12 items-center justify-between border-b border-white/[0.08] bg-[#111827]/70 px-8 backdrop-blur-xl md:flex">
          <div className={`${desktopMonthFilterWidth} shrink-0`} />
          <span className="truncate text-sm font-semibold text-white">{pageMeta.title}</span>
          <div className={`${desktopMonthFilterWidth} shrink-0`}>
            {showGlobalMonthFilter ? (
              <Suspense>
                <MonthFilter compact />
              </Suspense>
            ) : (
              <span className="block h-9" />
            )}
          </div>
        </header>

        <PullToRefresh className="px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-5 md:px-8 md:py-7">
          <main>{children}</main>
        </PullToRefresh>
      </div>

      {QUICK_ADD_PATHS.has(pathname) ? <QuickAddButton /> : null}
    </div>
  );
}
