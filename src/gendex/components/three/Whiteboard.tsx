"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { InteractiveObject } from "./InteractiveObject";
import { EPromptLabel } from "./EPromptLabel";

/**
 * A single marker stroke on the whiteboard — a thin emissive box.
 * Declared OUTSIDE the parent component so it doesn't reset state on re-render.
 */
function Stroke({
  pos,
  rot = [0, 0, 0],
  size = [0.4, 0.012, 0.01],
  color = "#FF1E1E",
  intensity = 1.6,
}: {
  pos: [number, number, number];
  rot?: [number, number, number];
  size?: [number, number, number];
  color?: string;
  intensity?: number;
}) {
  return (
    <mesh position={pos} rotation={rot}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Whiteboard mounted on the right wall. Displays a stylized "About Me" sketch
 * using only basic geometry (no text rendering, which would require fetching
 * a font from a CDN). The full bio content lives in the About panel.
 *
 * Interactive — opens the about panel.
 */
export function Whiteboard() {
  const whiteboardMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#101015",
        roughness: 0.6,
        metalness: 0.15,
      }),
    []
  );

  return (
    <group position={[4.45, 1.7, -1.0]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Frame */}
      <mesh material={whiteboardMat}>
        <boxGeometry args={[2.0, 1.25, 0.05]} />
      </mesh>

      {/* Interactive surface (slightly in front of frame, facing camera/left).
          v1.3: This plane serves as the raycast target. The whiteboard group
          is rotated -90° on Y so the plane's local +Z faces -X in world space
          (toward the camera). The plane is positioned at z=0.03 in local space
          so it's just in front of the frame. */}
      <InteractiveObject
        id="whiteboard-about"
        panelId="about"
        prompt="Open Whiteboard"
        position={[0, 0, 0.03]}
        maxRange={2.5}
        center={[4.4, 1.7, -1.0]}
      >
        <mesh>
          <planeGeometry args={[1.85, 1.1]} />
          <meshStandardMaterial color="#08080b" roughness={0.85} metalness={0.05} />
        </mesh>

        {/* "Sketch" — red header bar */}
        <Stroke pos={[-0.78, 0.45, 0.01]} size={[0.5, 0.04, 0.01]} color="#FF1E1E" intensity={2.2} />
        {/* Header dashes (pseudo "ABOUT_ME.md") */}
        <Stroke pos={[-0.55, 0.45, 0.01]} size={[0.05, 0.04, 0.01]} color="#FF1E1E" intensity={2.2} />
        <Stroke pos={[-0.42, 0.45, 0.01]} size={[0.1, 0.04, 0.01]} color="#FF1E1E" intensity={2.2} />
        <Stroke pos={[-0.27, 0.45, 0.01]} size={[0.18, 0.04, 0.01]} color="#FF1E1E" intensity={2.2} />

        {/* Bio lines (rows of short purple strokes representing text) */}
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 8 + (row % 3) }).map((_, col) => (
            <Stroke
              key={`${row}-${col}`}
              pos={[
                -0.78 + col * 0.18,
                0.28 - row * 0.13,
                0.01,
              ]}
              size={[0.14, 0.018, 0.005]}
              color="#d4d4d8"
              intensity={0.6}
            />
          ))
        )}

        {/* Hand-drawn arrow */}
        <Stroke pos={[0.35, -0.18, 0.01]} rot={[0, 0, -0.4]} size={[0.4, 0.018, 0.008]} color="#7C3AED" intensity={1.8} />
        <Stroke pos={[0.55, -0.05, 0.01]} size={[0.12, 0.018, 0.008]} color="#7C3AED" intensity={1.8} />

        {/* "Click to expand" hint dots */}
        <Stroke pos={[-0.6, -0.5, 0.01]} size={[0.06, 0.018, 0.005]} color="#71717a" intensity={0.4} />
        <Stroke pos={[-0.45, -0.5, 0.01]} size={[0.4, 0.018, 0.005]} color="#71717a" intensity={0.4} />
        <Stroke pos={[0.05, -0.5, 0.01]} size={[0.3, 0.018, 0.005]} color="#71717a" intensity={0.4} />
        <Stroke pos={[0.45, -0.5, 0.01]} size={[0.2, 0.018, 0.005]} color="#71717a" intensity={0.4} />

        {/* v1.2: Floating [E] prompt label */}
        <EPromptLabel position={[0, 0.8, 0.05]} text="Open Whiteboard" />
      </InteractiveObject>
    </group>
  );
}
