"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * LED strip: a thin emissive bar plus a low-cost point light.
 * The strip itself is the visual; the point light contributes real illumination.
 *
 * Placed along wall corners / desk edges to evoke the "red and purple LEDs"
 * atmosphere described in the brief.
 */
function LEDStrip({
  position,
  rotation = [0, 0, 0],
  size = [2, 0.04, 0.04],
  color,
  intensity = 1.6,
  lightDistance = 4,
  pulse = 0.0,
  seed = 0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number, number];
  color: string;
  intensity?: number;
  lightDistance?: number;
  pulse?: number;
  seed?: number;
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime + seed;
    const flick = pulse > 0 ? 1 + Math.sin(t * pulse) * 0.12 : 1;
    const jitter = Math.random() < 0.01 ? 0.7 : 1.0;
    const total = intensity * flick * jitter;
    if (matRef.current) matRef.current.emissiveIntensity = total * 1.3;
    if (lightRef.current) lightRef.current.intensity = total * 1.6;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={color}
        intensity={intensity * 1.6}
        distance={lightDistance}
        decay={2}
      />
    </group>
  );
}

/**
 * All ambient LED strips in the room. Arranged to:
 *  - Throw red light onto the back wall (highlighting the monitors)
 *  - Throw purple light onto the side walls (server rack, whiteboard)
 *  - Light the floor edges in both colors
 */
export function LEDLights() {
  return (
    <group>
      {/* Back wall horizontal strip above monitors (red) */}
      <LEDStrip
        position={[0, 2.6, -3.45]}
        color="#FF1E1E"
        intensity={2.0}
        size={[7, 0.04, 0.04]}
        lightDistance={6}
        pulse={1.4}
        seed={0.3}
      />
      {/* Left wall vertical strip (purple) — server rack side */}
      <LEDStrip
        position={[-4.42, 1.7, 0]}
        rotation={[0, 0, Math.PI / 2]}
        color="#7C3AED"
        intensity={1.6}
        size={[2.6, 0.04, 0.04]}
        lightDistance={5}
        pulse={0.7}
        seed={1.1}
      />
      {/* Right wall vertical strip (red) — whiteboard side */}
      <LEDStrip
        position={[4.42, 1.7, -1]}
        rotation={[0, 0, Math.PI / 2]}
        color="#FF1E1E"
        intensity={1.4}
        size={[2.0, 0.04, 0.04]}
        lightDistance={5}
        pulse={0.9}
        seed={2.3}
      />
      {/* Desk underglow (purple) */}
      <LEDStrip
        position={[0, 0.74, -2.55]}
        rotation={[Math.PI / 2, 0, 0]}
        color="#7C3AED"
        intensity={1.2}
        size={[3.4, 0.04, 0.04]}
        lightDistance={3}
        pulse={0.5}
        seed={3.4}
      />
      {/* Ceiling edge strip (purple, dim) */}
      <LEDStrip
        position={[0, 3.3, 0]}
        color="#7C3AED"
        intensity={0.8}
        size={[8, 0.03, 0.03]}
        lightDistance={7}
        pulse={0.3}
        seed={4.5}
      />
    </group>
  );
}
