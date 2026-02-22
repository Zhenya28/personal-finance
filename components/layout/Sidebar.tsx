"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  LineChart,
  PiggyBank,
  Calculator,
  ScanLine,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { MonthFilter } from "@/components/income/MonthFilter";
import { Suspense } from "react";

const navGroups = [
  {
    label: "Dashboard",
    items: [{ href: "/", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Finanse",
    items: [
      { href: "/income", label: "Przychody", icon: TrendingUp },
      { href: "/expenses", label: "Wydatki", icon: TrendingDown },
      { href: "/savings", label: "Oszczędności", icon: PiggyBank },
      { href: "/investments", label: "Inwestycje", icon: LineChart },
    ],
  },
  {
    label: "Narzędzia",
    items: [
      { href: "/calculator", label: "Kalkulator", icon: Calculator },
      { href: "/scan", label: "Skaner AI", icon: ScanLine },
    ],
  },
];

const allNavItems = navGroups.flatMap((g) => g.items);

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClose,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClose?: () => void;
}) {
  const searchParams = useSearchParams();
  const month = searchParams.get("month");
  const linkHref = month ? `${href}?month=${month}` : href;

  return (
    <Link
      href={linkHref}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          isActive ? "text-primary" : "text-muted-foreground/70"
        )}
      />
      {label}
    </Link>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between px-5 pt-6 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            F
          </div>
          <span className="text-base font-semibold tracking-tight">
            Finance
          </span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Global Month Filter */}
      <div className="px-4 py-3">
        <Suspense>
          <MonthFilter />
        </Suspense>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-2 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Suspense key={item.href}>
                    <NavLink
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={isActive}
                      onClose={onClose}
                    />
                  </Suspense>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
          v1.0
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const mobileItems = allNavItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm py-1.5 md:hidden">
      {mobileItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Suspense key={item.href}>
            <NavLink
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
            />
          </Suspense>
        );
      })}
    </nav>
  );
}
