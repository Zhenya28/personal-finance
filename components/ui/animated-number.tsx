"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  formatFn: (n: number) => string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  formatFn,
  className,
  duration = 0.8,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayed, setDisplayed] = useState(() => formatFn(0));

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(0, value, {
      duration,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (latest) => setDisplayed(formatFn(latest)),
    });

    return () => controls.stop();
  }, [isInView, value, formatFn, duration]);

  return (
    <span ref={ref} className={className}>
      {displayed}
    </span>
  );
}
