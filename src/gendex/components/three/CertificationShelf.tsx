"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { CERTIFICATIONS } from "../../data/content";
import { InteractiveObject } from "./InteractiveObject";

/**
 * A small shelf mounted on the right wall (above the door) holding three
 * "certification plaques" — thin emissive cards that glow softly.
 *
 * v1.3: Now interactive — opens the Education panel (which contains the
 * full certifications list). The interactive surface is a plane covering
 * the shelf + plaques, positioned just in front of them facing the room
 * (-X direction in world space, since the shelf is on the right wall).
 */
export function CertificationShelf() {
  const shelfMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0a0a0e",
        roughness: 0.6,
        metalness: 0.4,
      }),
    []
  );

  return (
    <group position={[4.42, 2.7, 1.6]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Shelf board */}
      <mesh material={shelfMat}>
        <boxGeometry args={[1.8, 0.04, 0.25]} />
      </mesh>
      {/* Bracket */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[1.6, 0.02, 0.04]} />
        <meshStandardMaterial color="#15151a" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Certification plaques (standing upright) */}
      {CERTIFICATIONS.map((c, i) => {
        const x = -0.7 + i * 0.7;
        return (
          <group key={c.name} position={[x, 0.06, 0]} rotation={[0, 0, 0]}>
            {/* Plaque body */}
            <mesh>
              <boxGeometry args={[0.5, 0.32, 0.02]} />
              <meshStandardMaterial color="#0c0c10" metalness={0.5} roughness={0.5} />
            </mesh>
            {/* Emissive top stripe */}
            <mesh position={[0, 0.14, 0.012]}>
              <boxGeometry args={[0.46, 0.04, 0.005]} />
              <meshStandardMaterial
                color="#FF1E1E"
                emissive="#FF1E1E"
                emissiveIntensity={1.8}
                toneMapped={false}
              />
            </mesh>
            {/* Year badge */}
            <mesh position={[0, 0.08, 0.012]}>
              <boxGeometry args={[0.18, 0.03, 0.005]} />
              <meshStandardMaterial
                color="#7C3AED"
                emissive="#7C3AED"
                emissiveIntensity={1.4}
                toneMapped={false}
              />
            </mesh>
            {/* Mid stripe (decorative) */}
            <mesh position={[0, -0.02, 0.012]}>
              <boxGeometry args={[0.4, 0.005, 0.003]} />
              <meshStandardMaterial
                color="#71717a"
                emissive="#71717a"
                emissiveIntensity={0.4}
                toneMapped={false}
              />
            </mesh>
            {/* Bottom stripe */}
            <mesh position={[0, -0.1, 0.012]}>
              <boxGeometry args={[0.4, 0.005, 0.003]} />
              <meshStandardMaterial
                color="#71717a"
                emissive="#71717a"
                emissiveIntensity={0.4}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* v1.3: Interactive raycast surface covering the shelf + plaques.
          The shelf group is rotated -90° on Y, so local +Z faces -X in world
          space (toward the room). A plane at z=0.15 is just in front of the
          plaques (which are at z=0.012). It's invisible but raycastable. */}
      <InteractiveObject
        id="certification-shelf"
        panelId="education"
        prompt="Open Certifications"
        position={[0, 0.05, 0.15]}
        maxRange={2.5}
        center={[4.27, 2.75, 1.6]}
      >
        <mesh>
          <planeGeometry args={[1.8, 0.6]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </InteractiveObject>
    </group>
  );
}
