"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InteractiveObject } from "./InteractiveObject";

/**
 * A server rack on the left wall. Has rows of blinking LEDs and is interactive —
 * opens the technical-skills panel.
 *
 * Each "unit" in the rack is a thin slab with a row of LEDs whose intensity
 * is modulated per-frame to look like network activity.
 */
function RackUnit({
  y,
  width = 1.0,
  height = 0.16,
  ledCount = 8,
  seed = 0,
}: {
  y: number;
  width?: number;
  height?: number;
  ledCount?: number;
  seed?: number;
}) {
  const ledsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime + seed;
    ledsRef.current.forEach((m, i) => {
      if (!m) return;
      const phase = (t + i * 0.7) % 2.4;
      const on = phase < 0.18 ? 1 : 0.08;
      m.emissiveIntensity = on * 3.0;
    });
  });

  return (
    <group position={[0, y, 0]}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[width, height, 0.5]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Front face plate */}
      <mesh position={[0, 0, 0.255]}>
        <boxGeometry args={[width * 0.98, height * 0.85, 0.01]} />
        <meshStandardMaterial color="#15151a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* LEDs */}
      {Array.from({ length: ledCount }).map((_, i) => {
        const x = -width / 2 + 0.07 + (i * (width - 0.14)) / (ledCount - 1);
        const isRed = i % 3 === 0;
        const isGreen = i % 3 === 1;
        const isPurple = i % 3 === 2;
        return (
          <mesh key={i} position={[x, height * 0.15, 0.265]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial
              ref={(m) => {
                if (m) ledsRef.current[i] = m;
              }}
              color={isRed ? "#FF1E1E" : isGreen ? "#22ff77" : "#7C3AED"}
              emissive={isRed ? "#FF1E1E" : isGreen ? "#22ff77" : "#7C3AED"}
              emissiveIntensity={1.0}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function ServerRack() {
  // Left wall at x = -4.5. Rack stands on floor against left wall.
  const rackMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#08080b",
        metalness: 0.65,
        roughness: 0.35,
      }),
    []
  );

  const unitCount = 6;

  return (
    <group position={[-4.4, 0, 0]}>
      {/* Cabinet shell */}
      <mesh position={[0, 1.1, 0]} material={rackMat}>
        <boxGeometry args={[1.1, 2.2, 0.6]} />
      </mesh>
      {/* Inner cavity (slightly darker) */}
      <mesh position={[0, 1.1, 0.31]}>
        <boxGeometry args={[1.0, 2.1, 0.02]} />
        <meshStandardMaterial color="#020203" metalness={0.3} roughness={0.9} />
      </mesh>

      {/* Interactive wrapper around the rack face.
          v1.3: The rack group is at [-4.4, 0, 0] in world space. The rack
          face points toward +X (toward the camera). The plane is at local
          z=0.33 (which is +X in world space after the rack's default
          orientation — no rotation needed since the rack is on the left
          wall and naturally faces +X). */}
      <InteractiveObject
        id="server-rack-skills"
        panelId="skills"
        prompt="Open Technical Skills"
        position={[0, 1.1, 0.33]}
        maxRange={2.5}
        center={[-4.07, 1.1, 0]}
      >
        <mesh>
          <planeGeometry args={[1.02, 2.12]} />
          <meshStandardMaterial color="#020203" metalness={0.3} roughness={0.95} />
        </mesh>

        {/* Rack units */}
        {Array.from({ length: unitCount }).map((_, i) => (
          <RackUnit
            key={i}
            y={1.1 - i * 0.36 + 0.7}
            seed={i * 1.7}
            ledCount={6 + (i % 3)}
          />
        ))}

        {/* v1.7: Rotating fans (2 fans near the top of the rack) */}
        <RackFan position={[-0.25, 0.9, 0.27]} speed={8} />
        <RackFan position={[0.25, 0.9, 0.27]} speed={7} />

        {/* v1.7: Small status display (CanvasTexture) */}
        <RackStatusDisplay position={[0, -0.5, 0.27]} />
      </InteractiveObject>

      {/* Cable bundle coming out the bottom */}
      <mesh position={[0.35, 0.05, 0.2]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 8]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
}

/**
 * v1.7: Rotating fan inside the server rack. The blades spin continuously
 * to give the rack a "powered on" feel.
 */
function RackFan({
  position,
  speed = 8,
}: {
  position: [number, number, number];
  speed?: number;
}) {
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += delta * speed;
    }
  });

  return (
    <group position={position}>
      {/* Fan housing */}
      <mesh>
        <torusGeometry args={[0.08, 0.012, 8, 16]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Fan blades (rotating) */}
      <group ref={bladesRef}>
        {[0, 1, 2, 3].map((i) => {
          const angle = (i * Math.PI) / 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.04, Math.sin(angle) * 0.04, 0]}
              rotation={[0, 0, angle + 0.3]}
            >
              <boxGeometry args={[0.06, 0.02, 0.003]} />
              <meshStandardMaterial color="#15151a" metalness={0.4} roughness={0.6} />
            </mesh>
          );
        })}
      </group>
      {/* Center hub */}
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <meshStandardMaterial color="#050507" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * v1.7: Small status display on the rack showing CPU/MEM/NET stats.
 * Uses a CanvasTexture that updates every second.
 */
function RackStatusDisplay({ position }: { position: [number, number, number] }) {
  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.createElement("canvas");
  }, []);

  const texture = useMemo(() => {
    if (!canvas) return null;
    canvas.width = 128;
    canvas.height = 64;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const update = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#020308";
      ctx.fillRect(0, 0, 128, 64);

      // Header
      ctx.fillStyle = "#22ff77";
      ctx.font = "bold 8px monospace";
      ctx.textBaseline = "top";
      ctx.fillText("SYS STATUS", 4, 4);

      // CPU
      const cpu = Math.floor(30 + Math.random() * 40);
      ctx.fillStyle = "#71717a";
      ctx.font = "7px monospace";
      ctx.fillText("CPU", 4, 18);
      ctx.fillStyle = "#22ff77";
      ctx.fillText(`${cpu}%`, 28, 18);
      // CPU bar
      ctx.fillStyle = "#1a2a1a";
      ctx.fillRect(48, 19, 76, 5);
      ctx.fillStyle = "#22ff77";
      ctx.fillRect(48, 19, (76 * cpu) / 100, 5);

      // MEM
      const mem = Math.floor(50 + Math.random() * 30);
      ctx.fillStyle = "#71717a";
      ctx.fillText("MEM", 4, 28);
      ctx.fillStyle = "#FF1E1E";
      ctx.fillText(`${mem}%`, 28, 28);
      ctx.fillStyle = "#2a1a1a";
      ctx.fillRect(48, 29, 76, 5);
      ctx.fillStyle = "#FF1E1E";
      ctx.fillRect(48, 29, (76 * mem) / 100, 5);

      // NET
      ctx.fillStyle = "#71717a";
      ctx.fillText("NET", 4, 38);
      ctx.fillStyle = "#5b9bff";
      ctx.fillText("▲ 1.2G", 28, 38);
      ctx.fillText("▼ 0.8G", 70, 38);

      // Uptime
      ctx.fillStyle = "#71717a";
      ctx.fillText("UP 14d 6h", 4, 50);
      ctx.fillStyle = "#7C3AED";
      ctx.fillText("● LIVE", 80, 50);

      if (texture) texture.needsUpdate = true;
    };
    update();
    const id = setInterval(update, 1500);
    return () => clearInterval(id);
  }, [canvas, texture]);

  useEffect(() => {
    return () => texture?.dispose();
  }, [texture]);

  if (!texture) return null;

  return (
    <mesh position={position}>
      <planeGeometry args={[0.3, 0.15]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
