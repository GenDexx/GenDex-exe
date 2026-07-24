"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useSceneStore } from "../store/useSceneStore";
import { useAudio } from "../hooks/useAudio";
import { PERSON } from "../data/content";
import { StatsButton } from "./StatsButton";

const FOCUS_LABELS: Record<string, string> = {
  "creator-mgmt": "Creator Management Platform",
  "tiktok": "TikTok API Investigation",
  "discord-bots": "Discord Bots",
  "about": "About Me",
  "education": "Education & Certifications",
  "skills": "Technical Skills",
  "future": "Future Goals",
  "contact": "Contact",
  "stats": "Statistics",
};

/**
 * Heads-Up Display overlay rendered on top of the 3D canvas.
 *
 * v1.1 additions:
 *   - Crosshair in center (only when pointer locked)
 *   - "Press E to inspect" hint when an interactive object is focused
 *   - "Click to look around" prompt when not locked
 *   - "~ for terminal" hint in the corner
 */
export function HUD() {
  const focusedObject = useSceneStore((s) => s.focusedObject);
  const focusedPrompt = useSceneStore((s) => s.focusedPrompt);
  const focusedDistance = useSceneStore((s) => s.focusedDistance);
  const activePanel = useSceneStore((s) => s.activePanel);
  const ready = useSceneStore((s) => s.ready);
  const playerLocked = useSceneStore((s) => s.playerLocked);
  const terminalOpen = useSceneStore((s) => s.terminalOpen);
  const isMobile = useSceneStore((s) => s.isMobile);
  const { enabled, toggle } = useAudio();

  // Crosshair is permanent on desktop (when ready, no panel/terminal open).
  // On mobile there's no crosshair (tap-to-interact instead).
  const showCrosshair = ready && !activePanel && !terminalOpen && !isMobile;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 gendex-no-select">
      {/* === Top bar === */}
      <motion.div
        className="absolute top-0 inset-x-0 flex items-center justify-between px-4 md:px-8 py-3 text-[10px] md:text-xs uppercase tracking-[0.3em] text-gendex-text-dim"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : -10 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 bg-[#FF1E1E] rounded-full gendex-pulse-red" />
          <span className="text-[#FF1E1E] font-bold">GENDEX.EXE</span>
          <span className="hidden md:inline opacity-60">/ {PERSON.location}</span>
        </div>
        <Clock />
        <div className="hidden md:flex items-center gap-3">
          <span className="opacity-60">SYS</span>
          <span className="text-[#7C3AED]">ONLINE</span>
        </div>
      </motion.div>

      {/* === Permanent center crosshair (desktop only) ===
          v1.3: Always visible when ready + no panel open. Turns red and
          expands slightly when a valid target is under the crosshair. */}
      <AnimatePresence>
        {showCrosshair && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Crosshair focused={!!focusedObject} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* === "Press E" prompt (desktop only, when a valid target is under the crosshair) === */}
      <AnimatePresence>
        {focusedObject && focusedPrompt && !activePanel && !terminalOpen && !isMobile && (
          <motion.div
            key={focusedObject}
            className="absolute left-1/2 top-[58%] -translate-x-1/2 flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-gendex-text-dim">
              › press
            </div>
            <div className="flex items-center gap-2">
              <kbd className="border border-[#FF1E1E] text-[#FF1E1E] px-2 py-0.5 text-xs font-bold">E</kbd>
              <span className="text-sm text-[#FF1E1E] gendex-text-glow-red font-bold tracking-wider">
                {focusedPrompt}
              </span>
            </div>
            {focusedDistance !== null && (
              <div className="text-[9px] uppercase tracking-[0.3em] text-gendex-text-dim mt-0.5 tabular-nums">
                {focusedDistance.toFixed(1)}m
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === "Click to look around" prompt (desktop, when ready but not locked) === */}
      <AnimatePresence>
        {ready && !playerLocked && !activePanel && !terminalOpen && !isMobile && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-black/70 backdrop-blur border border-[#FF1E1E]/30 px-6 py-4 text-center">
              <div className="text-sm text-[#FF1E1E] gendex-text-glow-red font-bold tracking-[0.3em] mb-1">
                CLICK TO LOOK AROUND
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim">
                WASD move · Shift sprint · ESC release · E interact · ~ terminal
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Mobile cinematic prompt (shown briefly on mobile after intro) === */}
      <AnimatePresence>
        {ready && isMobile && !activePanel && !terminalOpen && (
          <motion.div
            className="absolute top-[15%] left-1/2 -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: [0, 1, 1, 0], y: 0 }}
            transition={{ duration: 4, times: [0, 0.2, 0.8, 1], delay: 1 }}
          >
            <div className="bg-black/70 backdrop-blur border border-[#7C3AED]/40 px-4 py-2 text-center">
              <div className="text-[11px] text-[#7C3AED] font-bold tracking-[0.2em]">
                SWIPE TO LOOK · TAP OBJECTS · ~ TERMINAL
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Bottom-left controls === */}
      <motion.div
        className="absolute bottom-0 left-0 p-4 md:p-6 flex flex-col gap-3 pointer-events-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 10 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <button
          onClick={toggle}
          className="group flex items-center gap-2 border border-[#FF1E1E]/30 bg-black/60 backdrop-blur px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-gendex-text hover:border-[#FF1E1E] transition-colors"
        >
          <span
            className={`w-2 h-2 rounded-full ${enabled ? "bg-[#FF1E1E] gendex-pulse-red" : "bg-gendex-text-dim"}`}
          />
          {enabled ? "AUDIO ON" : "AUDIO OFF"}
        </button>
        <StatsButton />
        <TerminalHintButton />
      </motion.div>

      {/* === Bottom-right object inventory === */}
      <motion.div
        className="absolute bottom-0 right-0 p-4 md:p-6 pointer-events-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 10 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <ObjectShortcuts />
      </motion.div>

      {/* === Mobile drag hint === */}
      <MobileHint />
    </div>
  );
}

function Crosshair({ focused }: { focused: boolean }) {
  // v1.3: Permanent crosshair. White/dim when idle, red/bright when a valid
  // target is under the crosshair. The center dot grows slightly when focused
  // to give clear visual feedback.
  const color = focused ? "#FF1E1E" : "#ffffff";
  const opacity = focused ? 1 : 0.45;
  const dotR = focused ? 3 : 1.5;
  const gap = focused ? 6 : 10; // gap between center and crosshair lines
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      style={{ opacity, transition: "opacity 0.15s" }}
    >
      <circle cx="16" cy="16" r={dotR} fill={color} style={{ transition: "r 0.15s" }} />
      <line x1="16" y1={16 - gap} x2="16" y2="2" stroke={color} strokeWidth="1.5" />
      <line x1="16" y1={16 + gap} x2="16" y2="30" stroke={color} strokeWidth="1.5" />
      <line x1={16 - gap} y1="16" x2="2" y2="16" stroke={color} strokeWidth="1.5" />
      <line x1={16 + gap} y1="16" x2="30" y2="16" stroke={color} strokeWidth="1.5" />
      {focused && (
        <circle cx="16" cy="16" r="8" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      )}
    </svg>
  );
}

function Clock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2, "0");
      const mm = d.getMinutes().toString().padStart(2, "0");
      const ss = d.getSeconds().toString().padStart(2, "0");
      setTime(`${hh}:${mm}:${ss}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="hidden md:inline tabular-nums opacity-80">
      [ {time || "--:--:--"} ]
    </span>
  );
}

function TerminalHintButton() {
  const setOpen = useSceneStore((s) => s.setTerminalOpen);
  const { play } = useAudio();
  return (
    <button
      onClick={() => {
        play("open");
        setOpen(true);
      }}
      className="group flex items-center gap-2 border border-[#22ff77]/30 bg-black/60 backdrop-blur px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-gendex-text hover:border-[#22ff77] hover:text-[#22ff77] transition-colors"
    >
      <span className="text-[#22ff77]">~</span>
      Terminal
    </button>
  );
}

function ObjectShortcuts() {
  const setActivePanel = useSceneStore((s) => s.setActivePanel);
  const { play } = useAudio();
  const activePanel = useSceneStore((s) => s.activePanel);

  const items: { id: keyof typeof FOCUS_LABELS; label: string }[] = [
    { id: "about", label: "About" },
    { id: "creator-mgmt", label: "Creators" },
    { id: "tiktok", label: "TikTok" },
    { id: "discord-bots", label: "Bots" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Edu" },
    { id: "future", label: "Future" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-1 hidden md:block">
        › modules
      </div>
      <div className="grid grid-cols-4 gap-1.5 md:gap-2">
        {items.map((it) => {
          const active = activePanel === it.id;
          return (
            <button
              key={it.id}
              onClick={() => {
                play("open");
                setActivePanel(it.id);
              }}
              className={`px-2 md:px-3 py-1.5 md:py-2 text-[9px] md:text-[10px] uppercase tracking-wider border transition-colors ${
                active
                  ? "border-[#FF1E1E] bg-[#FF1E1E]/15 text-[#FF1E1E]"
                  : "border-gendex-border bg-black/50 text-gendex-text-dim hover:text-[#FF1E1E] hover:border-[#FF1E1E]/50"
              }`}
            >
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileHint() {
  const ready = useSceneStore((s) => s.ready);
  return (
    <AnimatePresence>
      {ready && (
        <motion.div
          className="md:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="text-center"
          >
            tap modules below · use terminal (~)
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
