"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ============================================================================
// 1. COFFEE MUG with STEAM PARTICLES
// ============================================================================

/**
 * Coffee mug with animated steam particles. The steam wisps rise, fade, and
 * drift slightly — making the mug feel "freshly poured".
 */
export function CoffeeMugWithSteam() {
  const steamRef = useRef<THREE.Group>(null);
  const steamParticles = useRef(
    Array.from({ length: 5 }).map(() => ({
      y: 0,
      ySpeed: 0.003 + Math.random() * 0.002,
      xDrift: (Math.random() - 0.5) * 0.001,
      opacity: 0,
      life: Math.random(),
    }))
  );

  useFrame((_, delta) => {
    if (!steamRef.current) return;
    steamRef.current.children.forEach((child, i) => {
      const p = steamParticles.current[i];
      if (!p) return;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshBasicMaterial;

      p.life += delta * 0.5;
      p.y += p.ySpeed;
      p.opacity = Math.sin(p.life * Math.PI) * 0.15;

      mesh.position.y = 0.1 + p.y;
      mesh.position.x = -0.01 + Math.sin(p.life * 3) * 0.01;
      mat.opacity = Math.max(0, p.opacity);

      // Reset when steam wisp fades out
      if (p.life > 1) {
        p.life = 0;
        p.y = 0;
        p.opacity = 0;
      }
    });
  });

  return (
    <group position={[-1.2, 0.83, -2.7]}>
      {/* Mug body */}
      <mesh>
        <cylinderGeometry args={[0.07, 0.065, 0.12, 16, 1, true]} />
        <meshStandardMaterial color="#1a0606" roughness={0.7} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.008, 16]} />
        <meshStandardMaterial color="#0a0303" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Coffee surface */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.063, 0.063, 0.005, 16]} />
        <meshStandardMaterial
          color="#2a0d05"
          emissive="#3a1410"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      {/* Handle */}
      <mesh position={[0.075, 0, 0]}>
        <torusGeometry args={[0.035, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1a0606" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Steam particles */}
      <group ref={steamRef}>
        {steamParticles.current.map((_, i) => (
          <mesh key={i} position={[-0.01, 0.1, 0]}>
            <sphereGeometry args={[0.02 + i * 0.003, 6, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ============================================================================
// 2. CEILING FAN
// ============================================================================

/**
 * Ceiling fan that slowly rotates. Casts subtle moving shadows on the floor
 * below (achieved via the rotating blade geometry catching the directional
 * light).
 */
export function CeilingFan() {
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.y += delta * 0.8; // slow rotation
    }
  });

  return (
    <group position={[0, 3.3, 0]}>
      {/* Mounting plate */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.04, 12]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Motor housing */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.1, 12]} />
        <meshStandardMaterial color="#15151a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Blades (rotating group) */}
      <group ref={bladesRef} position={[0, -0.18, 0]}>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5]}
              rotation={[0.15, angle, 0]}
            >
              <boxGeometry args={[0.8, 0.015, 0.12]} />
              <meshStandardMaterial color="#0a0a0e" metalness={0.3} roughness={0.7} />
            </mesh>
          );
        })}
      </group>
      {/* Light fixture under fan */}
      <mesh position={[0, -0.25, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial
          color="#FFE4B5"
          emissive="#FFE4B5"
          emissiveIntensity={0.3}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        position={[0, -0.3, 0]}
        intensity={0.15}
        color="#FFE4B5"
        distance={5}
        decay={2}
      />
    </group>
  );
}

// ============================================================================
// 3. WALL CLOCK (real browser time, second hand moves)
// ============================================================================

/**
 * Wall clock on the back wall. Uses real browser time — the second hand
 * updates every frame for smooth sweeping motion.
 */
export function WallClock() {
  const hourHand = useRef<THREE.Mesh>(null);
  const minuteHand = useRef<THREE.Mesh>(null);
  const secondHand = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ms = now.getMilliseconds();

    // Smooth second hand (with ms precision)
    const secAngle = -((s + ms / 1000) / 60) * Math.PI * 2;
    const minAngle = -((m + s / 60) / 60) * Math.PI * 2;
    const hourAngle = -((h + m / 60) / 12) * Math.PI * 2;

    if (secondHand.current) secondHand.current.rotation.z = secAngle;
    if (minuteHand.current) minuteHand.current.rotation.z = minAngle;
    if (hourHand.current) hourHand.current.rotation.z = hourAngle;
  });

  return (
    <group position={[-1.8, 2.55, -3.45]}>
      {/* Clock body */}
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 24]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Clock face */}
      <mesh position={[0, 0, 0.016]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 24]} />
        <meshStandardMaterial color="#08080b" roughness={0.9} />
      </mesh>
      {/* Hour markers (12 ticks) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.14, Math.sin(angle) * 0.14, 0.02]}
          >
            <boxGeometry args={[0.008, 0.025, 0.005]} />
            <meshStandardMaterial color="#71717a" emissive="#71717a" emissiveIntensity={0.3} />
          </mesh>
        );
      })}
      {/* Hour hand */}
      <mesh ref={hourHand} position={[0, 0.04, 0.025]}>
        <boxGeometry args={[0.006, 0.08, 0.004]} />
        <meshStandardMaterial color="#FF1E1E" emissive="#FF1E1E" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      {/* Minute hand */}
      <mesh ref={minuteHand} position={[0, 0.06, 0.03]}>
        <boxGeometry args={[0.004, 0.12, 0.003]} />
        <meshStandardMaterial color="#d4d4d8" emissive="#d4d4d8" emissiveIntensity={0.5} />
      </mesh>
      {/* Second hand */}
      <mesh ref={secondHand} position={[0, 0.05, 0.035]}>
        <boxGeometry args={[0.002, 0.13, 0.002]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* Center cap */}
      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={1.0} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ============================================================================
// 7. LIGHTNING SYSTEM (30-60s flashes + thunder)
// ============================================================================

/**
 * Lightning system. Every 30-60 seconds, flashes a bright light through the
 * window for ~200ms. Triggers thunder sound via the audio system.
 */
export function Lightning() {
  const flashLight = useRef<THREE.PointLight>(null);
  const nextFlash = useRef(Date.now() + 15000 + Math.random() * 15000);
  const flashStart = useRef(0);

  useFrame(() => {
    if (!flashLight.current) return;
    const now = Date.now();

    // Check if it's time for a new flash
    if (now >= nextFlash.current && flashStart.current === 0) {
      flashStart.current = now;
      nextFlash.current = now + 30000 + Math.random() * 30000;
      // Trigger thunder sound (slight delay = distance from storm)
      setTimeout(() => {
        import("../../hooks/useAudio").then((m) => m.triggerThunder());
      }, 800 + Math.random() * 1200);
    }

    // Flash sequence: bright → fade over ~600ms
    if (flashStart.current > 0) {
      const elapsed = now - flashStart.current;
      if (elapsed < 150) {
        // Peak flash
        flashLight.current.intensity = 3.0;
      } else if (elapsed < 600) {
        // Fade out
        flashLight.current.intensity = 3.0 * (1 - (elapsed - 150) / 450);
      } else {
        flashLight.current.intensity = 0;
        flashStart.current = 0;
      }
    }
  });

  return (
    <pointLight
      ref={flashLight}
      position={[2.7, 2.0, -4.5]}
      intensity={0}
      color="#9bb8ff"
      distance={15}
      decay={1.5}
    />
  );
}

// ============================================================================
// 12. CHAIR (office chair with slight idle movement)
// ============================================================================

/**
 * Office chair behind the desk. Has a very subtle idle sway (as if someone
 * just stood up and the chair is still spinning slightly).
 */
export function Chair() {
  const chairRef = useRef<THREE.Group>(null);
  const swayPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!chairRef.current) return;
    swayPhase.current += delta * 0.5;
    // Very subtle sway — ±2 degrees
    chairRef.current.rotation.y = Math.sin(swayPhase.current) * 0.035;
  });

  return (
    <group ref={chairRef} position={[0, 0, -2.0]}>
      {/* Base (5-star) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.22, 0.04, Math.sin(angle) * 0.22]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.3, 0.03, 0.05]} />
            <meshStandardMaterial color="#0a0a0e" metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
      {/* Center column */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color="#15151a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Seat */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.45, 0.06, 0.42]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.68, -0.19]}>
        <boxGeometry args={[0.42, 0.55, 0.05]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Armrests */}
      <mesh position={[0.24, 0.5, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-0.24, 0.5, 0]}>
        <boxGeometry args={[0.04, 0.04, 0.3]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Wheels (5 small spheres) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={`wheel-${i}`}
            position={[Math.cos(angle) * 0.35, 0.025, Math.sin(angle) * 0.35]}
          >
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#050507" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}
