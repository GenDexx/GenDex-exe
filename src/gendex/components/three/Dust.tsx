"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "../../store/useSceneStore";

interface DustProps {
  count?: number;
  area?: [number, number, number];
  origin?: [number, number, number];
  color?: string;
  size?: number;
}

/**
 * Floating dust motes that drift slowly upward and wrap. Adds the "3 AM room"
 * atmosphere. v1.7: Increased count, denser near the window, visible in
 * monitor light (warm color).
 */
export function Dust({
  count,
  area = [9, 3.4, 7],
  origin = [0, 0, 0],
  color = "#ffcca0",
  size = 0.02,
}: DustProps) {
  const isMobile = useSceneStore((s) => s.isMobile);
  const actualCount = count ?? (isMobile ? 120 : 400);

  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(actualCount * 3);
    const [w, h, d] = area;
    for (let i = 0; i < actualCount; i++) {
      // Bias dust toward the window (right side, x > 0, near z = -3)
      const nearWindow = Math.random() < 0.35;
      if (nearWindow) {
        arr[i * 3 + 0] = origin[0] + 1.5 + Math.random() * 2.5; // x: 1.5 to 4
        arr[i * 3 + 1] = origin[1] + Math.random() * h;
        arr[i * 3 + 2] = origin[2] - 2.5 + Math.random() * 2; // z: -2.5 to -0.5
      } else {
        arr[i * 3 + 0] = origin[0] + (Math.random() - 0.5) * w;
        arr[i * 3 + 1] = origin[1] + Math.random() * h;
        arr[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * d;
      }
    }
    return arr;
  }, [actualCount, area, origin]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.elapsedTime;
    const [w, h, d] = area;
    const topY = origin[1] + h;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < actualCount; i++) {
      // Slow upward drift + tiny horizontal sway
      pos[i * 3 + 1] += dt * 0.06;
      pos[i * 3 + 0] += Math.sin(t * 0.3 + i * 0.1) * dt * 0.015;
      pos[i * 3 + 2] += Math.cos(t * 0.2 + i * 0.13) * dt * 0.01;
      if (pos[i * 3 + 1] > topY) {
        const nearWindow = Math.random() < 0.35;
        if (nearWindow) {
          pos[i * 3 + 0] = origin[0] + 1.5 + Math.random() * 2.5;
          pos[i * 3 + 2] = origin[2] - 2.5 + Math.random() * 2;
        } else {
          pos[i * 3 + 0] = origin[0] + (Math.random() - 0.5) * w;
          pos[i * 3 + 2] = origin[2] + (Math.random() - 0.5) * d;
        }
        pos[i * 3 + 1] = 0;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={actualCount}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color={color}
        size={size}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
