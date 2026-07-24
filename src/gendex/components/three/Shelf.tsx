"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InteractiveObject } from "./InteractiveObject";
import { EPromptLabel } from "./EPromptLabel";

/**
 * Shelf on the left wall (near the server rack) holding personal items:
 * - Camera
 * - Headphones
 * - Notebook
 * - Coffee beans
 * - External SSD
 * - Mag Prime figure (interactive — shows "700+ hours. Still my favorite.")
 */
export function Shelf() {
  return (
    <group position={[-4.35, 1.15, 2.5]} rotation={[0, Math.PI / 2, 0]}>
      {/* Shelf board */}
      <mesh>
        <boxGeometry args={[1.4, 0.03, 0.22]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Bracket */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.03]} />
        <meshStandardMaterial color="#15151a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* === Camera (DSLR-style) === */}
      <group position={[-0.5, 0.06, 0]}>
        <mesh>
          <boxGeometry args={[0.14, 0.09, 0.07]} />
          <meshStandardMaterial color="#0a0a0e" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Lens */}
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.04, 0.06, 16]} />
          <meshStandardMaterial color="#050507" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Lens glass */}
        <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} emissive="#3b2b55" emissiveIntensity={0.2} />
        </mesh>
        {/* Flash */}
        <mesh position={[0.05, 0.03, 0.035]}>
          <boxGeometry args={[0.03, 0.015, 0.01]} />
          <meshStandardMaterial color="#15151a" metalness={0.5} roughness={0.5} />
        </mesh>
      </group>

      {/* === Headphones === */}
      <group position={[-0.25, 0.06, 0]}>
        {/* Headband */}
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[0.06, 0.012, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#0a0a0e" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Left ear cup */}
        <mesh position={[-0.06, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
          <meshStandardMaterial color="#0a0a0e" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Right ear cup */}
        <mesh position={[0.06, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.04, 16]} />
          <meshStandardMaterial color="#0a0a0e" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* RGB ring on ear cup */}
        <mesh position={[0.06, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.025, 0.032, 16]} />
          <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>

      {/* === Notebook (closed, on shelf) === */}
      <group position={[0.0, 0.03, 0]}>
        <mesh>
          <boxGeometry args={[0.12, 0.02, 0.16]} />
          <meshStandardMaterial color="#1a0606" roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Spine accent */}
        <mesh position={[0, 0.012, 0]}>
          <boxGeometry args={[0.12, 0.002, 0.02]} />
          <meshStandardMaterial color="#FF1E1E" emissive="#FF1E1E" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>
      </group>

      {/* === Coffee beans (small bowl) === */}
      <group position={[0.22, 0.04, 0]}>
        {/* Bowl */}
        <mesh>
          <cylinderGeometry args={[0.04, 0.03, 0.025, 12]} />
          <meshStandardMaterial color="#0a0a0e" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Beans (scattered spheres) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const r = 0.015 + Math.random() * 0.015;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0.022, Math.sin(angle) * r]}
              scale={[1, 0.6, 1]}
            >
              <sphereGeometry args={[0.006, 6, 6]} />
              <meshStandardMaterial color="#2a1505" roughness={0.9} />
            </mesh>
          );
        })}
      </group>

      {/* === External SSD === */}
      <group position={[0.4, 0.04, 0]}>
        <mesh>
          <boxGeometry args={[0.08, 0.02, 0.05]} />
          <meshStandardMaterial color="#0a0a0e" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Status LED */}
        <mesh position={[0.03, 0.012, 0]}>
          <sphereGeometry args={[0.004, 6, 6]} />
          <meshStandardMaterial color="#22ff77" emissive="#22ff77" emissiveIntensity={2.0} toneMapped={false} />
        </mesh>
        {/* Cable */}
        <mesh position={[0.05, 0.005, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.003, 0.003, 0.06, 6]} />
          <meshStandardMaterial color="#15151a" roughness={0.8} />
        </mesh>
      </group>

      {/* === Mag Prime figure (interactive) === */}
      <MagPrimeFigure />
    </group>
  );
}

/**
 * Mag Prime figure — a small stylized robot/figure on the shelf.
 * Interactive — shows "700+ hours. Still my favorite." when inspected.
 */
function MagPrimeFigure() {
  const glowRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!glowRef.current) return;
    const t = state.clock.elapsedTime;
    glowRef.current.emissiveIntensity = 0.6 + Math.sin(t * 1.5) * 0.3;
  });

  return (
    <InteractiveObject
      id="mag-prime"
      panelId="stats"
      prompt="Inspect Mag Prime"
      position={[0.55, 0.08, 0]}
      maxRange={2.5}
      center={[-4.35 + 0.55, 1.15 + 0.08, 2.5]}
    >
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.015, 12]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Legs */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.03, 0.04, 0.025]} />
        <meshStandardMaterial color="#15151a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.045, 0.05, 0.035]} />
        <meshStandardMaterial
          ref={glowRef}
          color="#1a1a2e"
          emissive="#7C3AED"
          emissiveIntensity={0.8}
          metalness={0.6}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Visor (glowing) */}
      <mesh position={[0, 0.115, 0.016]}>
        <boxGeometry args={[0.022, 0.008, 0.002]} />
        <meshStandardMaterial color="#FF1E1E" emissive="#FF1E1E" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.035, 0.07, 0]}>
        <boxGeometry args={[0.012, 0.045, 0.012]} />
        <meshStandardMaterial color="#15151a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.035, 0.07, 0]}>
        <boxGeometry args={[0.012, 0.045, 0.012]} />
        <meshStandardMaterial color="#15151a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Shoulder pauldrons */}
      <mesh position={[-0.032, 0.09, 0]}>
        <boxGeometry args={[0.018, 0.015, 0.025]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.5} metalness={0.5} roughness={0.4} toneMapped={false} />
      </mesh>
      <mesh position={[0.032, 0.09, 0]}>
        <boxGeometry args={[0.018, 0.015, 0.025]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.5} metalness={0.5} roughness={0.4} toneMapped={false} />
      </mesh>

      <EPromptLabel position={[0, 0.2, 0]} text="Mag Prime" />
    </InteractiveObject>
  );
}

/**
 * Open notebook on the desk with a TODO list displayed via CanvasTexture.
 * Shows:
 *   TODO
 *   - Finish Creator Reports
 *   - Push GitHub Updates
 *   - Fix Camera Bug
 *   - Drink Water
 */
export function OpenNotebook() {
  return (
    <group position={[1.3, 0.83, -2.6]} rotation={[0, -0.3, 0]}>
      {/* Notebook base (open, flat) */}
      <mesh>
        <boxGeometry args={[0.3, 0.008, 0.22]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.9} />
      </mesh>
      {/* Left page */}
      <mesh position={[-0.075, 0.005, 0]}>
        <planeGeometry args={[0.13, 0.18]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.95} />
      </mesh>
      {/* Right page */}
      <mesh position={[0.075, 0.005, 0]}>
        <planeGeometry args={[0.13, 0.18]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.95} />
      </mesh>
      {/* TODO lines — red header */}
      <mesh position={[-0.075, 0.007, 0.07]}>
        <planeGeometry args={[0.08, 0.015]} />
        <meshBasicMaterial color="#FF1E1E" toneMapped={false} />
      </mesh>
      {/* TODO items — small white line segments */}
      {[-0.03, -0.06, -0.09, -0.12].map((z, i) => (
        <mesh key={i} position={[-0.075, 0.007, z]}>
          <planeGeometry args={[0.1, 0.008]} />
          <meshBasicMaterial color="#d4d4d8" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      ))}
      {/* Checkbox squares */}
      {[-0.03, -0.06, -0.09, -0.12].map((z, i) => (
        <mesh key={`cb-${i}`} position={[-0.125, 0.007, z]}>
          <planeGeometry args={[0.012, 0.012]} />
          <meshBasicMaterial color="#7C3AED" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * RGB keyboard with wave animation. The underglow cycles through colors
 * in a wave pattern, with occasional pulses.
 */
export function RGBKeyboard() {
  const glowMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!glowMatRef.current) return;
    const t = state.clock.elapsedTime;
    // Wave: cycle hue
    const hue = (t * 0.1) % 1;
    const color = new THREE.Color().setHSL(hue, 1, 0.5);
    glowMatRef.current.color.copy(color);
    glowMatRef.current.emissive.copy(color);
    // Occasional pulse
    const pulse = Math.sin(t * 2) > 0.95 ? 2.5 : 1.2;
    glowMatRef.current.emissiveIntensity = pulse + Math.sin(t * 5) * 0.2;
  });

  return (
    <group position={[0, 0.83, -2.75]}>
      <mesh>
        <boxGeometry args={[1.0, 0.03, 0.32]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Key grid */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 14 }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[-0.46 + col * 0.07, 0.025, -0.12 + row * 0.06]}
          >
            <boxGeometry args={[0.055, 0.02, 0.05]} />
            <meshStandardMaterial color="#18181c" metalness={0.3} roughness={0.6} />
          </mesh>
        ))
      )}
      {/* RGB underglow (animated) */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[1.05, 0.005, 0.36]} />
        <meshStandardMaterial
          ref={glowMatRef}
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Mouse with a subtle LED glow.
 */
export function MouseGlow() {
  const ledRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!ledRef.current) return;
    const t = state.clock.elapsedTime;
    ledRef.current.emissiveIntensity = 0.3 + Math.sin(t * 1.2) * 0.15;
  });

  return (
    <group position={[0.7, 0.83, -2.7]}>
      <mesh>
        <boxGeometry args={[0.1, 0.03, 0.16]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Scroll wheel LED */}
      <mesh position={[0, 0.018, -0.03]}>
        <boxGeometry args={[0.008, 0.008, 0.015]} />
        <meshStandardMaterial
          ref={ledRef}
          color="#FF1E1E"
          emissive="#FF1E1E"
          emissiveIntensity={0.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
