"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { useSceneStore } from "../../store/useSceneStore";
import { useAudio } from "../../hooks/useAudio";
import type { PanelId } from "../../data/types";

interface PanelContainerProps {
  panelId: PanelId;
  title: string;
  subtitle?: string;
  accent?: "red" | "purple";
  children: ReactNode;
}

const TITLES: Record<PanelId, { tag: string }> = {
  "about": { tag: "WHITEBOARD / ABOUT.md" },
  "creator-mgmt": { tag: "MONITOR_01 / creator_platform" },
  "tiktok": { tag: "MONITOR_02 / tiktok_investigation.log" },
  "discord-bots": { tag: "MONITOR_03 / bots.service" },
  "education": { tag: "DESK / education.json" },
  "skills": { tag: "RACK / skills.index" },
  "future": { tag: "WINDOW / future.goals" },
  "contact": { tag: "DOOR / contact.vcf" },
  "stats": { tag: "HUD / statistics.json" },
};

export function PanelContainer({
  panelId,
  title,
  subtitle,
  accent = "red",
  children,
}: PanelContainerProps) {
  const activePanel = useSceneStore((s) => s.activePanel);
  const setActivePanel = useSceneStore((s) => s.setActivePanel);
  const { play } = useAudio();

  const isOpen = activePanel === panelId;
  const accentColor = accent === "red" ? "#FF1E1E" : "#7C3AED";

  // ESC closes
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        play("close");
        setActivePanel(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, play, setActivePanel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center p-3 md:p-8 gendex-no-select"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            onClick={() => {
              play("close");
              setActivePanel(null);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-3xl max-h-[88vh] gendex-panel gendex-corner-tl gendex-corner-tr gendex-corner-bl gendex-corner-br overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#FF1E1E]/15 bg-gradient-to-r from-[#FF1E1E]/5 to-transparent">
              <div className="flex flex-col">
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.35em] text-gendex-text-dim">
                  {TITLES[panelId].tag}
                </span>
                <h2
                  className="text-base md:text-xl font-bold tracking-wide"
                  style={{ color: accentColor, textShadow: `0 0 12px ${accentColor}66` }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <span className="text-[10px] md:text-xs text-gendex-text-dim mt-0.5">{subtitle}</span>
                )}
              </div>
              <button
                onClick={() => {
                  play("close");
                  setActivePanel(null);
                }}
                className="group flex items-center gap-2 border border-gendex-border px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-gendex-text-dim hover:border-[#FF1E1E] hover:text-[#FF1E1E] transition-colors"
                aria-label="Close panel"
              >
                <span className="hidden md:inline">CLOSE</span>
                <span className="text-base leading-none">×</span>
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-y-auto gendex-scrollbar p-4 md:p-6">
              {children}
            </div>

            {/* Footer */}
            <div className="px-4 md:px-6 py-2 border-t border-[#FF1E1E]/10 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-gendex-text-dim">
              <span>ESC to close</span>
              <span className="hidden md:inline">GENDEX.EXE / module:{panelId}</span>
              <span style={{ color: accentColor }}>● live</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
