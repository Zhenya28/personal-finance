"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App runtime error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-[680px] items-center px-4 py-8">
      <div className="w-full rounded-[24px] border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/12">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Wystapil blad aplikacji
            </h2>
            <p className="text-sm text-muted-foreground">
              Widok nie zaladowal sie poprawnie. Mozesz sprobowac ponownie.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-secondary/50 p-3 text-xs text-muted-foreground">
          Jesli problem powtarza sie czesto, odswiez aplikacje i sprawdz polaczenie.
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sprobuj ponownie
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Wroc do dashboardu</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
