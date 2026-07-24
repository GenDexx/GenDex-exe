"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { TIMELINE } from "../../data/content";
import { InteractiveObject } from "./InteractiveObject";

/**
 * Wall-mounted career timeline. Mounted on the LEFT wall (server rack side),
 * above the rack. Each year is a glowing node connected by a horizontal line.
 *
 * v1.3: Now interactive — opens the Education panel (which contains the full
 * career timeline). The interactive surface is a plane covering the timeline
 * rail, positioned just in front of it.
 */
export function WallTimeline() {
  const railMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0a0a0e",
        roughness: 0.7,
        metalness: 0.3,
      }),
    []
  );

  // Timeline spans years 2020 → 2026 (7 entries)
  const entries = TIMELINE;
  const span = entries.length;
  const railWidth = 2.4;
  const startX = -railWidth / 2;
  const stepX = railWidth / (span - 1);

  return (
    <group position={[-4.42, 2.75, 0.8]} rotation={[0, Math.PI / 2, 0]}>
      {/* Backing panel */}
      <mesh material={railMat}>
        <boxGeometry args={[railWidth + 0.2, 0.5, 0.02]} />
      </mesh>

      {/* Horizontal accent line (red, emissive) */}
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[railWidth, 0.008, 0.005]} />
        <meshStandardMaterial
          color="#FF1E1E"
          emissive="#FF1E1E"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>

      {/* Year nodes */}
      {entries.map((entry, i) => {
        const x = startX + i * stepX;
        const isLatest = i === entries.length - 1;
        return (
          <group key={entry.year} position={[x, 0, 0.015]}>
            {/* Node dot */}
            <mesh>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial
                color={isLatest ? "#7C3AED" : "#FF1E1E"}
                emissive={isLatest ? "#7C3AED" : "#FF1E1E"}
                emissiveIntensity={2.2}
                toneMapped={false}
              />
            </mesh>
            {/* Year label */}
            <mesh position={[0, -0.16, 0.02]}>
              <planeGeometry args={[0.18, 0.06]} />
              <meshBasicMaterial color="#020203" toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* "CAREER" label */}
      <mesh position={[-railWidth / 2 - 0.05, 0.18, 0.012]}>
        <planeGeometry args={[0.4, 0.04]} />
        <meshBasicMaterial color="#FF1E1E" toneMapped={false} />
      </mesh>

      {/* v1.3: Interactive raycast surface covering the timeline rail.
          The group is rotated +90° on Y, so local +Z faces +X in world
          space (toward the room). A plane at z=0.05 is just in front of
          the nodes/labels. Invisible but raycastable. */}
      <InteractiveObject
        id="wall-timeline"
        panelId="education"
        prompt="Open Career Timeline"
        position={[0, 0, 0.05]}
        maxRange={2.5}
        center={[-4.37, 2.75, 0.8]}
      >
        <mesh>
          <planeGeometry args={[railWidth + 0.3, 0.7]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </InteractiveObject>
    </group>
  );
}
