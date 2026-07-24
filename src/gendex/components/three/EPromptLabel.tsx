"use client";

import { Html } from "@react-three/drei";
import { useSceneStore } from "../../store/useSceneStore";

interface EPromptLabelProps {
  position: [number, number, number];
  text: string;
}

/**
 * v1.5: A floating HTML label above an interactive object.
 *
 * Desktop: shows "[E] Open ..." — only visible when pointer is NOT locked
 *   (so it doesn't clutter first-person view). When locked, the HUD
 *   crosshair + "Press E" prompt takes over.
 * Mobile: shows "TAP Open ..." — always visible (mobile uses orbit camera,
 *   so labels help identify tappable objects from any angle). No "[E]"
 *   prefix since mobile has no keyboard.
 */
export function EPromptLabel({ position, text }: EPromptLabelProps) {
  const playerLocked = useSceneStore((s) => s.playerLocked);
  const isMobile = useSceneStore((s) => s.isMobile);
  const activePanel = useSceneStore((s) => s.activePanel);

  // Hide when a panel is open
  if (activePanel !== null) return null;
  // On desktop, hide when pointer is locked (first-person mode)
  if (!isMobile && playerLocked) return null;

  // Desktop shows [E], Mobile shows TAP
  const prefix = isMobile ? "TAP" : "[E]";
  const prefixColor = isMobile ? "#7C3AED" : "#7C3AED";

  return (
    <Html
      position={position}
      center
      distanceFactor={6}
      zIndexRange={[20, 0]}
      wrapperClass="gendex-e-label-wrapper"
    >
      <div
        style={{
          background: "rgba(5, 5, 7, 0.88)",
          border: "1px solid rgba(255, 30, 30, 0.5)",
          padding: "4px 10px",
          fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
          fontSize: "11px",
          color: "#FF1E1E",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          boxShadow: "0 0 12px rgba(255, 30, 30, 0.3), 0 4px 16px rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          borderRadius: "2px",
        }}
      >
        <span style={{ color: prefixColor, marginRight: "6px" }}>{prefix}</span>
        {text}
      </div>
    </Html>
  );
}
