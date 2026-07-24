"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RainProps {
  count?: number;
  area?: [number, number, number];
  origin?: [number, number, number];
  speed?: number;
  streakLength?: number;
  color?: string;
}

/**
 * GPU-friendly rain: a single BufferGeometry of vertical line segments whose
 * Y position is rolled downward each frame. When a drop falls below the floor,
 * it wraps back to the top of the volume.
 *
 * Use this both for the exterior rain (behind the window) and as ambient
 * "rain streaks" near the front of the scene if desired.
 */
export function Rain({
  count = 600,
  area = [4, 4, 4],
  origin = [0, 0, 0],
  speed = 8,
  streakLength = 0.12,
  color = "#7be0ff",
}: RainProps) {
  const geomRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  // Two Float32Arrays: top vertices and bottom vertices of each line segment.
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 6); // 2 verts * 3 components
    const velocities = new Float32Array(count);
    const [w, h, d] = area;
    for (let i = 0; i < count; i++) {
      const x = origin[0] + (Math.random() - 0.5) * w;
      const y = origin[1] + (Math.random() - 0.5) * h;
      const z = origin[2] + (Math.random() - 0.5) * d;
      // Top vertex
      positions[i * 6 + 0] = x;
      positions[i * 6 + 1] = y + streakLength;
      positions[i * 6 + 2] = z;
      // Bottom vertex
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z;
      velocities[i] = speed * (0.6 + Math.random() * 0.8);
    }
    return { positions, velocities };
  }, [count, area, origin, speed, streakLength]);

  useFrame((_, delta) => {
    if (!geomRef.current) return;
    const pos = geomRef.current.attributes.position.array as Float32Array;
    const [w, h, d] = area;
    const topY = origin[1] + h / 2;
    const botY = origin[1] - h / 2;
    const dt = Math.min(delta, 0.05);
    for (let i = 0; i < count; i++) {
      const dy = velocities[i] * dt;
      // top vertex
      pos[i * 6 + 1] -= dy;
      // bottom vertex
      pos[i * 6 + 4] -= dy;
      // Wrap
      if (pos[i * 6 + 4] < botY) {
        const x = origin[0] + (Math.random() - 0.5) * w;
        const z = origin[2] + (Math.random() - 0.5) * d;
        pos[i * 6 + 0] = x;
        pos[i * 6 + 1] = topY + streakLength;
        pos[i * 6 + 2] = z;
        pos[i * 6 + 3] = x;
        pos[i * 6 + 4] = topY;
        pos[i * 6 + 5] = z;
      }
    }
    geomRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count * 2}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.55}
        toneMapped={false}
      />
    </lineSegments>
  );
}
