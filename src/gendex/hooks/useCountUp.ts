"use client";

import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  end: number;
  duration?: number; // ms
  startDelay?: number;
  enabled?: boolean;
  format?: (n: number) => string;
}

/**
 * Smooth count-up animation using requestAnimationFrame.
 * Uses an ease-out cubic curve so numbers feel punchy.
 */
export function useCountUp({
  end,
  duration = 1600,
  startDelay = 0,
  enabled = true,
  format,
}: UseCountUpOptions) {
  const [value, setValue] = useState(0);
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setValue(end);
      setDone(true);
      return;
    }
    setValue(0);
    setDone(false);
    startTimeRef.current = null;

    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = (t: number) => {
      if (startTimeRef.current === null) startTimeRef.current = t;
      const elapsed = t - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration, startDelay, enabled]);

  const display = format ? format(value) : value.toLocaleString();
  return { value, display, done };
}
