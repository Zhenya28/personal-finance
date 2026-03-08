"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const REFRESH_THRESHOLD = 76;
const MAX_PULL = 118;

export function PullToRefresh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const startX = useRef<number | null>(null);
  const lastPull = useRef(0);
  const isPulling = useRef(false);
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = Math.min(1, pullDistance / REFRESH_THRESHOLD);
  const isReadyToRefresh = progress >= 1;

  function resetPullState() {
    startY.current = null;
    startX.current = null;
    lastPull.current = 0;
    isPulling.current = false;
    setPullDistance(0);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (isRefreshing || isPending) return;
    if (!containerRef.current || containerRef.current.scrollTop > 0) return;

    const touch = event.touches[0];
    startY.current = touch.clientY;
    startX.current = touch.clientX;
    isPulling.current = true;
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (!isPulling.current || startY.current === null || startX.current === null) {
      return;
    }

    const touch = event.touches[0];
    const deltaY = touch.clientY - startY.current;
    const deltaX = Math.abs(touch.clientX - startX.current);

    if (deltaY <= 0 || deltaX > Math.abs(deltaY)) {
      resetPullState();
      return;
    }

    if (!containerRef.current || containerRef.current.scrollTop > 0) {
      resetPullState();
      return;
    }

    // Dampen the pull so it feels elastic instead of linear.
    const damped = Math.min(MAX_PULL, deltaY * 0.42);
    lastPull.current = damped;
    setPullDistance(damped);
    event.preventDefault();
  }

  function triggerRefresh() {
    setIsRefreshing(true);
    setPullDistance(REFRESH_THRESHOLD * 0.68);

    startTransition(() => {
      router.refresh();
    });

    if (refreshTimeout.current) {
      clearTimeout(refreshTimeout.current);
    }

    refreshTimeout.current = setTimeout(() => {
      setIsRefreshing(false);
      setPullDistance(0);
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, []);

  function handleTouchEnd() {
    if (!isPulling.current) return;

    const shouldRefresh = lastPull.current >= REFRESH_THRESHOLD;
    isPulling.current = false;
    startY.current = null;
    startX.current = null;
    lastPull.current = 0;

    if (shouldRefresh && !isRefreshing && !isPending) {
      triggerRefresh();
      return;
    }

    setPullDistance(0);
  }

  const contentOffset = isRefreshing ? 22 : Math.min(32, pullDistance * 0.34);

  return (
    <div className="relative flex min-h-0 flex-1">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center">
        <div
          className={cn(
            "mt-2 flex items-center justify-center gap-2 rounded-full border border-border/80 bg-card/95 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur transition-all duration-150 motion-reduce:transition-none",
            pullDistance > 0 || isRefreshing || isPending
              ? "opacity-100"
              : "opacity-0"
          )}
          style={{
            transform: `translateY(${Math.max(0, contentOffset - 14)}px)`,
          }}
        >
          {isRefreshing || isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              Odswiezam dane...
            </>
          ) : (
            <>
              <RefreshCw
                className={cn(
                  "h-3.5 w-3.5 transition-transform motion-reduce:transition-none",
                  isReadyToRefresh && "text-primary"
                )}
                style={{ transform: `rotate(${Math.round(progress * 180)}deg)` }}
              />
              {isReadyToRefresh ? "Pusc, aby odswiezyc" : "Pociagnij w dol, aby odswiezyc"}
            </>
          )}
        </div>
      </div>

      <div
        className="h-full min-h-0 w-full transition-transform duration-150 motion-reduce:transition-none"
        style={{ transform: `translateY(${contentOffset}px)` }}
      >
        <div
          ref={containerRef}
          className={cn(
            "h-full min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y",
            className
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
