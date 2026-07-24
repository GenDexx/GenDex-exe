"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSceneStore } from "../store/useSceneStore";
import { useTypewriter, useTypewriterSequence } from "../hooks/useTypewriter";
import { useAudio } from "../hooks/useAudio";
import { LOADING_LINES, BOOT_LINES } from "../data/content";

export function LoadingScreen() {
  const phase = useSceneStore((s) => s.phase);
  const setPhase = useSceneStore((s) => s.setPhase);
  const setBooted = useSceneStore((s) => s.setBooted);
  const setIntroComplete = useSceneStore((s) => s.setIntroComplete);
  const booted = useSceneStore((s) => s.booted);
  const { enable, play, enabled } = useAudio();

  const [progress, setProgress] = useState(0);
  const [showPressEnter, setShowPressEnter] = useState(false);
  const [showBoot, setShowBoot] = useState(false);
  const [bootRevealedCount, setBootRevealedCount] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [closing, setClosing] = useState(false);

  // Header typewriter
  const header = useTypewriter({
    text: "Initializing GENDEX.EXE...",
    speed: 28,
    startDelay: 100,
    enabled: true,
  });

  // Loading sequence (after header)
  const seq = useTypewriterSequence(LOADING_LINES.slice(1), 8, 400, header.done);

  // Progress bar fills while loading lines type out
  useEffect(() => {
    if (!header.done) return;
    const total = LOADING_LINES.length - 1;
    const done = seq.typedLines.length;
    const inProg = seq.currentLine ? 0.5 : 0;
    const pct = Math.min(100, Math.round(((done + inProg) / total) * 100));
    setProgress(pct);
    if (seq.done) setShowPressEnter(true);
  }, [header.done, seq.typedLines.length, seq.currentLine, seq.done]);

  // Boot sequence: reveal one whole line at a time (much faster than char-by-char)
  useEffect(() => {
    if (!showBoot) return;
    if (bootRevealedCount >= BOOT_LINES.length) {
      // All lines revealed — wait a beat, then close
      const t1 = setTimeout(() => setBootDone(true), 400);
      const t2 = setTimeout(() => setClosing(true), 900);
      const t3 = setTimeout(() => {
        setBooted(true);
        setIntroComplete(true);
        setPhase("ready");
      }, 1700);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
    // Reveal next line every 280ms
    const t = setTimeout(() => {
      setBootRevealedCount((c) => c + 1);
    }, 280);
    return () => clearTimeout(t);
  }, [showBoot, bootRevealedCount, setBooted, setIntroComplete, setPhase]);

  const handleEnter = useCallback(() => {
    if (!showPressEnter || showBoot) return;
    if (!enabled) enable();
    play("enter");
    setShowBoot(true);
  }, [showPressEnter, showBoot, enabled, enable, play]);

  // Listen for ENTER key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleEnter]);

  return (
    <AnimatePresence>
      {phase === "loading" && !closing && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black gendex-no-select"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Subtle grid background */}
          <div className="absolute inset-0 gendex-grid-bg opacity-30" />
          {/* Red corner glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 40% at 50% 110%, rgba(255,30,30,0.18) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10 w-full max-w-2xl px-6 md:px-10">
            {/* Top tag */}
            <div className="flex items-center justify-between text-[10px] md:text-xs tracking-[0.3em] uppercase text-gendex-text-dim mb-8">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#FF1E1E] rounded-full gendex-pulse-red" />
                GenDex Systems
              </span>
              <span>build 2026.07</span>
            </div>

            {/* Header */}
            <h1 className="font-mono text-2xl md:text-4xl font-bold text-[#FF1E1E] gendex-text-glow-red gendex-flicker">
              {header.output}
              {!header.done && <span className="gendex-cursor-blink" />}
            </h1>

            <div className="h-px w-full bg-gradient-to-r from-[#FF1E1E]/60 via-[#7C3AED]/40 to-transparent mt-4 mb-8" />

            {/* Loading lines */}
            <div className="font-mono text-sm md:text-base text-gendex-text min-h-[8rem]">
              {seq.typedLines.map((l, i) => (
                <div key={i} className="flex items-center gap-3 py-0.5">
                  <span className="text-[#7C3AED]">›</span>
                  <span className="text-gendex-text">{l}</span>
                  <span className="ml-auto text-[10px] text-[#FF1E1E]">OK</span>
                </div>
              ))}
              {seq.currentLine && (
                <div className="flex items-center gap-3 py-0.5">
                  <span className="text-[#7C3AED]">›</span>
                  <span className="text-gendex-text">{seq.currentLine}</span>
                  <span className="ml-auto text-[10px] text-gendex-text-dim animate-pulse">...</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-gendex-text-dim mb-2">
                <span>Loading core systems</span>
                <span className="text-[#FF1E1E] tabular-nums">{progress.toString().padStart(3, "0")}%</span>
              </div>
              <div className="relative h-2 w-full bg-[#0c0c10] border border-[#FF1E1E]/20 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,30,30,0.8) 0%, rgba(124,58,237,0.8) 100%)",
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.4 }}
                />
                <div className="absolute inset-0 gendex-scanline pointer-events-none opacity-30" />
              </div>
            </div>

            {/* Press ENTER */}
            <AnimatePresence>
              {showPressEnter && !showBoot && (
                <motion.button
                  onClick={handleEnter}
                  className="mt-10 w-full border border-[#FF1E1E]/40 bg-[#FF1E1E]/5 hover:bg-[#FF1E1E]/10 transition-colors py-3 px-6 flex items-center justify-center gap-3 group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-[#FF1E1E] text-base md:text-lg font-bold tracking-[0.4em] group-hover:tracking-[0.5em] transition-all">
                    PRESS ENTER
                  </span>
                  <kbd className="hidden md:inline-block text-[10px] text-gendex-text-dim border border-gendex-border px-2 py-0.5">
                    ↵
                  </kbd>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Boot sequence — line-by-line reveal */}
            <AnimatePresence>
              {showBoot && (
                <motion.div
                  className="mt-8 font-mono text-xs md:text-sm text-[#9eff9e] min-h-[12rem]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {BOOT_LINES.slice(0, bootRevealedCount).map((l, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18 }}
                    >
                      {l}
                    </motion.div>
                  ))}
                  {bootRevealedCount < BOOT_LINES.length && (
                    <div>
                      <span className="gendex-cursor-blink" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer hint */}
            <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-widest text-gendex-text-dim">
              <span>Est. 2003 · Médéa, Algeria</span>
              <span className="hidden md:inline">Audio + visuals recommended</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
