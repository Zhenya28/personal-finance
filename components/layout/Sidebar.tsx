"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ArrowDownUp,
  Calculator,
  LayoutDashboard,
  LineChart,
  LogOut,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
import { ALL_MONTHS_VALUE, cn, isValidMonth } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transakcje", icon: ArrowDownUp },
  { href: "/income", label: "Przychody", icon: TrendingUp },
  { href: "/expenses", label: "Wydatki", icon: TrendingDown },
  { href: "/savings", label: "Oszczednosci", icon: PiggyBank },
  { href: "/investments", label: "Inwestycje", icon: LineChart },
  { href: "/import", label: "Import CSV", icon: Upload },
  { href: "/calculator", label: "Kalkulator", icon: Calculator },
];

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
  const shouldKeepMonth =
    month &&
    (isValidMonth(month) || (month === ALL_MONTHS_VALUE && href === "/"));
  const linkHref = shouldKeepMonth ? `${href}?month=${month}` : href;

  return (
    <Link
      href={linkHref}
      onClick={onClose}
      className={cn(
        "group relative flex items-center gap-3 rounded-r-2xl px-6 py-3 text-sm font-medium transition-all duration-200",
        isActive
          ? "text-white bg-white/[0.06]"
          : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
      )}
    >
      {isActive && (
        <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-md bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
      )}
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-colors",
          isActive ? "text-indigo-400" : "text-white/40 group-hover:text-white/60"
        )}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-[100px] shrink-0 items-center justify-between border-b border-white/[0.06] px-6">
        <BrandLogo size="md" subtitle="CONTROL CENTER" />

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full md:hidden text-white/50 hover:text-white hover:bg-white/[0.06]"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
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
      </nav>

      <div className="shrink-0 border-t border-white/[0.06] px-4 py-4">
        <button
          onClick={async () => {
            try {
              await fetch("/api/auth", { method: "DELETE" });
            } catch {
              // Ignore network errors and continue logout redirect.
            }
            window.location.href = "/login";
          }}
          className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm font-medium text-white/70 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4 text-white/45 transition-colors group-hover:text-red-300" />
          Wyloguj się
        </button>
      </div>
    </div>
  );
}
