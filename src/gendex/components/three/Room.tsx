"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface RoomProps {
  width?: number;
  height?: number;
  depth?: number;
}

/**
 * Static room shell: floor, ceiling, 3 walls (back, left, right).
 * The front wall is left open so the camera (outside the room) can see in.
 * Walls are very dark with subtle vertical lines for a "datacenter" feel.
 */
export function Room({
  width = 9,
  height = 3.4,
  depth = 7,
}: RoomProps) {
  const halfW = width / 2;
  const halfD = depth / 2;

  // v1.7: Improved floor material — slight reflections, AO-friendly roughness,
  // better metalness for a "polished dark floor" look.
  const floorMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: "#050508",
      roughness: 0.35,
      metalness: 0.6,
      envMapIntensity: 0.8,
    });
    return m;
  }, []);

  const wallMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: "#0a0a0e",
      roughness: 0.85,
      metalness: 0.15,
    });
    return m;
  }, []);

  const ceilingMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: "#050507",
      roughness: 0.95,
      metalness: 0.0,
    });
    return m;
  }, []);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* Floor grid (subtle red) */}
      <gridHelper
        args={[width, Math.floor(width / 0.6), "#FF1E1E", "#1a0808"]}
        position={[0, 0.001, 0]}
      />

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height, 0]} material={ceilingMat}>
        <planeGeometry args={[width, depth]} />
      </mesh>

      {/* Back wall (where the desk + monitors sit) */}
      <mesh position={[0, height / 2, -halfD]} material={wallMat} receiveShadow>
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* Left wall (server rack side) */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-halfW, height / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[depth, height]} />
      </mesh>

      {/* Right wall (whiteboard + door side) */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[halfW, height / 2, 0]}
        material={wallMat}
        receiveShadow
      >
        <planeGeometry args={[depth, height]} />
      </mesh>

      {/* Baseboard trims (red glow strips at floor/wall joints) */}
      {/* Back wall baseboard */}
      <mesh position={[0, 0.04, -halfD + 0.01]}>
        <boxGeometry args={[width, 0.08, 0.02]} />
        <meshStandardMaterial
          color="#FF1E1E"
          emissive="#FF1E1E"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      {/* Left wall baseboard */}
      <mesh position={[-halfW + 0.01, 0.04, 0]}>
        <boxGeometry args={[0.02, 0.08, depth]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>
      {/* Right wall baseboard */}
      <mesh position={[halfW - 0.01, 0.04, 0]}>
        <boxGeometry args={[0.02, 0.08, depth]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>

      {/* Ceiling trim (subtle red line on back wall) */}
      <mesh position={[0, height - 0.05, -halfD + 0.01]}>
        <boxGeometry args={[width, 0.04, 0.02]} />
        <meshStandardMaterial
          color="#FF1E1E"
          emissive="#FF1E1E"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
