"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSceneStore } from "../store/useSceneStore";
import { useAudio } from "../hooks/useAudio";
import { LoadingScreen } from "./LoadingScreen";
import { HUD } from "./HUD";
import { Terminal } from "./Terminal";
import { AboutMePanel } from "./panels/AboutMePanel";
import { CreatorManagementPanel } from "./panels/CreatorManagementPanel";
import { TikTokInvestigationPanel } from "./panels/TikTokInvestigationPanel";
import { DiscordBotsPanel } from "./panels/DiscordBotsPanel";
import { EducationPanel } from "./panels/EducationPanel";
import { TechnicalSkillsPanel } from "./panels/TechnicalSkillsPanel";
import { FutureGoalsPanel } from "./panels/FutureGoalsPanel";
import { ContactPanel } from "./panels/ContactPanel";
import { StatisticsPanel } from "./panels/StatisticsPanel";

// The 3D canvas is loaded client-only (Three.js + R3F need the DOM).
const GenDexScene = dynamic(
  () => import("./three/GenDexScene").then((m) => m.GenDexScene),
  { ssr: false }
);

/**
 * Mobile detection — sets `isMobile` in the store SYNCHRONOUSLY on first render
 * (using useState initializer) so the Canvas never reconfigures due to an
 * isMobile change after mount.
 *
 * v1.4 fix: Previously, isMobile started as false and was set in a useEffect,
 * causing the Canvas to reconfigure (antialias, dpr) after mount — which
 * remounted all Canvas children and killed the GSAP intro timeline.
 */
function useMobileDetection() {
  const setIsMobile = useSceneStore((s) => s.setIsMobile);
  const initialized = useRef(false);

  // Set synchronously on first render
  if (!initialized.current && typeof window !== "undefined") {
    initialized.current = true;
    const ua = navigator.userAgent || "";
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua);
    const isMobileWidth = window.innerWidth < 768;
    const isTouch = "ontouchstart" in window && window.innerWidth < 1024;
    setIsMobile(isMobileUA || (isMobileWidth && isTouch));
  }

  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent || "";
      const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua);
      const isMobileWidth = window.innerWidth < 768;
      const isTouch = "ontouchstart" in window && window.innerWidth < 1024;
      setIsMobile(isMobileUA || (isMobileWidth && isTouch));
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setIsMobile]);
}

export function GenDexApp() {
  const phase = useSceneStore((s) => s.phase);
  const booted = useSceneStore((s) => s.booted);
  const transitioning = useSceneStore((s) => s.transitioning);
  const { enabled, enable } = useAudio();
  useMobileDetection();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D scene — only mounts after boot completes */}
      {booted && (
        <div className="absolute inset-0 z-0">
          <GenDexScene />
        </div>
      )}

      {/* Pre-boot fallback background */}
      {!booted && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse at top, #0a0a0f 0%, #050507 60%, #000000 100%)",
          }}
        />
      )}

      {/* Vignette + noise overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none gendex-vignette" />
      <div className="gendex-noise" />

      {/* HUD (top bar, crosshair, hints, module shortcuts) */}
      {booted && <HUD />}

      {/* Terminal (toggled with ~ key) */}
      <Terminal />

      {/* All panels */}
      <AboutMePanel />
      <CreatorManagementPanel />
      <TikTokInvestigationPanel />
      <DiscordBotsPanel />
      <EducationPanel />
      <TechnicalSkillsPanel />
      <FutureGoalsPanel />
      <ContactPanel />
      <StatisticsPanel />

      {/* Fade-to-black overlay during the room-entry transition.
          Shows briefly after the loading screen exits, while the camera
          flies into the room and rain audio starts. */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="absolute inset-0 z-[60] bg-black pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0.85, 0] }}
            transition={{
              duration: 4.5,
              times: [0, 0.25, 0.5, 1],
              ease: "easeInOut",
            }}
          />
        )}
      </AnimatePresence>

      {/* Loading screen sits on top of everything until boot completes */}
      {phase === "loading" && <LoadingScreen />}
    </main>
  );
}
