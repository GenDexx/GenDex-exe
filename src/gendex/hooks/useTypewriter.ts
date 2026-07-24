"use client";

import { useEffect, useRef, useState } from "react";

interface UseTypewriterOptions {
  text: string;
  speed?: number; // ms per char
  startDelay?: number;
  enabled?: boolean;
}

/**
 * Types out `text` one character at a time. Returns the current visible string
 * and whether typing is complete.
 */
export function useTypewriter({
  text,
  speed = 32,
  startDelay = 0,
  enabled = true,
}: UseTypewriterOptions) {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setOutput(text);
      setDone(true);
      return;
    }
    setOutput("");
    setDone(false);
    indexRef.current = 0;

    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      intervalId = setInterval(() => {
        indexRef.current += 1;
        setOutput(text.slice(0, indexRef.current));
        if (indexRef.current >= text.length) {
          if (intervalId) clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    };

    timeoutId = setTimeout(start, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay, enabled]);

  return { output, done };
}

/**
 * Sequential typewriter for a list of lines. Returns lines typed so far and
 * whether the whole list is done.
 *
 * When `enabled` is false, returns empty state (nothing typed, not done) so
 * callers can use `enabled` as a true "wait until ready" gate.
 */
export function useTypewriterSequence(lines: string[], speed = 24, startDelay = 0, enabled = true) {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [done, setDone] = useState(false);
  const lineIdxRef = useRef(0);
  const charIdxRef = useRef(0);

  useEffect(() => {
    if (!enabled || lines.length === 0) {
      // Stay idle until enabled
      setTypedLines([]);
      setCurrentLine("");
      setDone(false);
      return;
    }
    setTypedLines([]);
    setCurrentLine("");
    setDone(false);
    lineIdxRef.current = 0;
    charIdxRef.current = 0;

    let intervalId: ReturnType<typeof setInterval>;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      intervalId = setInterval(() => {
        const li = lineIdxRef.current;
        if (li >= lines.length) {
          if (intervalId) clearInterval(intervalId);
          setDone(true);
          setCurrentLine("");
          return;
        }
        const line = lines[li];
        charIdxRef.current += 1;
        if (charIdxRef.current >= line.length) {
          setTypedLines((prev) => [...prev, line]);
          setCurrentLine("");
          lineIdxRef.current += 1;
          charIdxRef.current = 0;
        } else {
          setCurrentLine(line.slice(0, charIdxRef.current));
        }
      }, speed);
    };

    timeoutId = setTimeout(tick, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [lines.join("|"), speed, startDelay, enabled]);

  return { typedLines, currentLine, done };
}
