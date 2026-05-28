"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ClipboardCheck, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.error("App runtime error:", error);
  }, [error]);

  const details = [
    error.message ? `Message: ${error.message}` : null,
    error.digest ? `Digest: ${error.digest}` : null,
    error.stack ? `Stack:\n${error.stack}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  async function copyDetails() {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard permission errors
    }
  }

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

        {error.message ? (
          <pre className="overflow-x-auto rounded-xl border border-border/70 bg-secondary/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
            {error.message}
            {error.digest ? `\n\n[digest: ${error.digest}]` : ""}
          </pre>
        ) : (
          <div className="rounded-xl border border-border/70 bg-secondary/50 p-3 text-xs text-muted-foreground">
            Jesli problem powtarza sie czesto, odswiez aplikacje i sprawdz polaczenie.
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sprobuj ponownie
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Wroc do dashboardu</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={copyDetails}
            className="gap-2"
          >
            {copied ? (
              <>
                <ClipboardCheck className="h-4 w-4" />
                Skopiowano
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Skopiuj szczegoly
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
