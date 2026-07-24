"use client";

import { create } from "zustand";
import type { PanelId, ScenePhase } from "../data/types";

interface SceneState {
  phase: ScenePhase;
  activePanel: PanelId | null;
  hoveredObject: PanelId | null;
  audioEnabled: boolean;
  booted: boolean;
  introComplete: boolean;
  ready: boolean;
  // v1.1 additions
  transitioning: boolean; // true during fade-to-black + camera entry
  playerLocked: boolean; // true when pointer lock is active
  terminalOpen: boolean; // true when terminal overlay is open
  isMobile: boolean; // true when running on a mobile-class device
  // v1.3: focusedObject now stores the unique interactive ID (not panelId).
  focusedObject: string | null;
  // v1.3: prompt text for the currently focused object (HUD display).
  focusedPrompt: string | null;
  // v1.3: distance to currently focused object (HUD + debug).
  focusedDistance: number | null;
  // v1.4: which system currently owns the camera — for debugging conflicts.
  cameraOwner: "none" | "intro" | "player" | "mobile";

  setPhase: (phase: ScenePhase) => void;
  setActivePanel: (panel: PanelId | null) => void;
  setHoveredObject: (panel: PanelId | null) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setBooted: (booted: boolean) => void;
  setIntroComplete: (complete: boolean) => void;
  setReady: (ready: boolean) => void;
  setTransitioning: (t: boolean) => void;
  setPlayerLocked: (locked: boolean) => void;
  setTerminalOpen: (open: boolean) => void;
  setIsMobile: (m: boolean) => void;
  setFocusedObject: (
    id: string | null,
    prompt?: string | null,
    distance?: number | null
  ) => void;
  setCameraOwner: (owner: "none" | "intro" | "player" | "mobile") => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  phase: "loading",
  activePanel: null,
  hoveredObject: null,
  audioEnabled: false,
  booted: false,
  introComplete: false,
  ready: false,
  transitioning: false,
  playerLocked: false,
  terminalOpen: false,
  isMobile: false,
  focusedObject: null,
  focusedPrompt: null,
  focusedDistance: null,
  cameraOwner: "none",

  setPhase: (phase) => set({ phase: phase }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setHoveredObject: (panel) => set({ hoveredObject: panel }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  setBooted: (booted) => set({ booted: booted }),
  setIntroComplete: (complete) => set({ introComplete: complete }),
  setReady: (ready) => set({ ready: ready }),
  setTransitioning: (t) => set({ transitioning: t }),
  setPlayerLocked: (locked) => set({ playerLocked: locked }),
  setTerminalOpen: (open) => set({ terminalOpen: open }),
  setIsMobile: (m) => set({ isMobile: m }),
  setFocusedObject: (id, prompt = null, distance = null) =>
    set({ focusedObject: id, focusedPrompt: prompt, focusedDistance: distance }),
  setCameraOwner: (owner) => set({ cameraOwner: owner }),
}));
