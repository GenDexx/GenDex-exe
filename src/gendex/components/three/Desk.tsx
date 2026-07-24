"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InteractiveObject } from "./InteractiveObject";
import { LiveMonitorScreen, type MonitorContent } from "./LiveMonitor";
import { EPromptLabel } from "./EPromptLabel";

interface MonitorConfig {
  id: "creator-mgmt" | "tiktok" | "discord-bots";
  // v1.3: unique interactive ID (separate from panelId)
  interactiveId: string;
  position: [number, number, number];
  rotationY: number;
  label: string;
  screenColor: string;
  content: MonitorContent;
  seed: number;
  prompt: string; // v1.3: interaction prompt text
}

const MONITORS: MonitorConfig[] = [
  {
    id: "creator-mgmt",
    interactiveId: "monitor-creator",
    position: [1.15, 1.32, -3.05],
    rotationY: -0.18,
    label: "Creator Management",
    screenColor: "#7C3AED",
    content: "creators",
    seed: 4.1,
    prompt: "Open Creator Platform",
  },
  {
    id: "tiktok",
    interactiveId: "monitor-tiktok",
    position: [0, 1.32, -3.12],
    rotationY: 0,
    label: "TikTok Investigation",
    screenColor: "#FF1E1E",
    content: "tiktok",
    seed: 2.7,
    prompt: "Open TikTok Investigation",
  },
  {
    id: "discord-bots",
    interactiveId: "monitor-discord",
    position: [-1.15, 1.32, -3.05],
    rotationY: 0.18,
    label: "Discord Bots",
    screenColor: "#5865F2",
    content: "discord",
    seed: 1.3,
    prompt: "Open Discord Bots",
  },
];

/**
 * Flickering bezel + power LED. The screen itself is now a LiveMonitorScreen.
 */
function Monitor({ config }: { config: MonitorConfig }) {
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!ledMatRef.current) return;
    const t = state.clock.elapsedTime + config.seed;
    const slow = 0.85 + Math.sin(t * 1.4) * 0.08;
    const flick = Math.random() < 0.02 ? 0.55 : 1.0;
    ledMatRef.current.emissiveIntensity = slow * flick * 3.0;
  });

  return (
    <InteractiveObject
      id={config.interactiveId}
      panelId={config.id}
      prompt={config.prompt}
      position={config.position}
      rotation={[0, config.rotationY, 0]}
      maxRange={2.5}
      center={config.position}
    >
      {/* Stand */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.18, 8]} />
        <meshStandardMaterial color="#15151a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.27, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.02, 16]} />
        <meshStandardMaterial color="#0e0e12" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Body / bezel */}
      <mesh>
        <boxGeometry args={[0.86, 0.54, 0.04]} />
        <meshStandardMaterial color="#08080b" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Live screen content */}
      <group position={[0, 0, 0.022]}>
        <LiveMonitorScreen content={config.content} />
      </group>
      {/* Power LED */}
      <mesh position={[0.38, -0.24, 0.025]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial
          ref={ledMatRef}
          color="#FF1E1E"
          emissive="#FF1E1E"
          emissiveIntensity={3.0}
          toneMapped={false}
        />
      </mesh>
      {/* v1.2: Floating [E] prompt label above the monitor */}
      <EPromptLabel position={[0, 0.5, 0]} text={config.prompt} />
    </InteractiveObject>
  );
}

/**
 * Desk with three monitors.
 * The desk itself is interactive — opens the "education" panel.
 * v1.7: Keyboard, mouse, and coffee mug moved to LivingElements/Shelf
 * components with animations.
 */
export function Desk() {
  const deskMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0e0e12",
        roughness: 0.4,
        metalness: 0.55,
      }),
    []
  );

  return (
    <group>
      {/* Desk top — interactive (education) */}
      <InteractiveObject
        id="desk-education"
        panelId="education"
        prompt="Open Education & Certifications"
        position={[0, 0.78, -3.05]}
        maxRange={2.5}
        center={[0, 0.85, -2.7]}
      >
        <mesh material={deskMat} castShadow receiveShadow>
          <boxGeometry args={[3.6, 0.06, 1.0]} />
        </mesh>
        {/* Front edge accent */}
        <mesh position={[0, -0.04, 0.5]}>
          <boxGeometry args={[3.6, 0.02, 0.02]} />
          <meshStandardMaterial
            color="#FF1E1E"
            emissive="#FF1E1E"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
      </InteractiveObject>

      {/* Desk legs */}
      {([
        [-1.7, 0.0, 0.4],
        [1.7, 0.0, 0.4],
        [-1.7, 0.0, -0.4],
        [1.7, 0.0, -0.4],
      ] as const).map((p, i) => (
        <mesh key={i} position={[p[0], 0.39, -3.05 + p[2]]}>
          <boxGeometry args={[0.06, 0.78, 0.06]} />
          <meshStandardMaterial color="#15151a" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Monitors (left = discord, center = tiktok, right = creators) */}
      {MONITORS.map((c) => (
        <Monitor key={c.id} config={c} />
      ))}

      {/* v1.7: Keyboard, mouse, and coffee mug are now rendered by the
          LivingElements/Shelf components (RGBKeyboard, MouseGlow,
          CoffeeMugWithSteam) with animations. The old static versions
          have been removed from here to avoid duplicates. */}

      {/* Notebook (closed, on desk — different from OpenNotebook on shelf) */}
      <mesh position={[-0.85, 0.83, -2.7]} rotation={[0, 0.1, 0]}>
        <boxGeometry args={[0.28, 0.015, 0.36]} />
        <meshStandardMaterial color="#1a0606" metalness={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}
