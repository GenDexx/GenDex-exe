"use client";

import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import {
  registerInteractive,
  unregisterInteractive,
} from "../../lib/interactiveRegistry";
import type { PanelId } from "../../data/types";

// THREE is used for Vector3 in the registry registration below.

interface InteractiveObjectProps {
  id: string;
  panelId: PanelId;
  prompt: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  children: ReactNode;
  maxRange?: number;
  center?: [number, number, number];
}

/**
 * v1.6 — STRIPPED TO PURE REGISTRATION.
 *
 * This component does exactly TWO things:
 *   1. Registers itself with the interactive registry on mount (so
 *      PlayerControls/MobileControls can raycast it).
 *   2. Renders its children unchanged.
 *
 * It does NOT:
 *   - Subscribe to `focusedObject` from the store (was causing all
 *     InteractiveObjects to re-render every frame)
 *   - Modify any material's emissiveIntensity (was traversing the scene
 *     graph on every focus change)
 *   - Render any ring/outline mesh (was adding/removing scene graph nodes
 *     during gameplay, which could trigger R3F reconciler work)
 *   - Touch the camera in any way
 *
 * Interaction prompts are handled by the HUD (desktop "Press E" text) and
 * EPromptLabel (floating 3D labels). This component is invisible.
 */
export function InteractiveObject({
  id,
  panelId,
  prompt,
  position,
  rotation = [0, 0, 0],
  children,
  maxRange = 2.5,
  center,
}: InteractiveObjectProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Register with the interactive registry on mount.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const centerVec = new THREE.Vector3(...(center ?? position));

    registerInteractive({
      id,
      panelId,
      prompt,
      maxRange,
      object: group,
      center: centerVec,
    });

    return () => {
      unregisterInteractive(id);
    };
  }, [id, panelId, prompt, maxRange, position, center]);

  // Pure render — no focus-dependent visuals, no store subscriptions.
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {children}
    </group>
  );
}
