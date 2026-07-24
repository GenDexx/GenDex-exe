"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InteractiveObject } from "./InteractiveObject";
import { Rain } from "./Rain";

/**
 * Window on the back wall (to the right of the monitors). Rain falls behind it.
 * Interactive — opens the "future goals" panel.
 *
 * v1.7: Added a CanvasTexture info overlay showing:
 *   - Médéa, Algeria
 *   - Current time (03:12 AM style, real browser time)
 *   - Rain: ACTIVE
 *   - Connection: ONLINE
 *
 * Also added water accumulation effect on the windowsill.
 */
export function Window() {
  const frameMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0a0a0e",
        metalness: 0.5,
        roughness: 0.5,
      }),
    []
  );

  const glassMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // CanvasTexture for the info overlay
  const infoCanvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.createElement("canvas");
  }, []);

  const infoTexture = useMemo(() => {
    if (!infoCanvas) return null;
    infoCanvas.width = 256;
    infoCanvas.height = 180;
    const tex = new THREE.CanvasTexture(infoCanvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [infoCanvas]);

  // Update the info canvas every second with real time
  useEffect(() => {
    if (!infoCanvas) return;
    const update = () => {
      const ctx = infoCanvas.getContext("2d");
      if (!ctx) return;
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      const h12 = (now.getHours() % 12 || 12).toString().padStart(2, "0");

      ctx.fillStyle = "rgba(2, 3, 10, 0.85)";
      ctx.fillRect(0, 0, 256, 180);

      // Location
      ctx.fillStyle = "#7C3AED";
      ctx.font = "bold 14px monospace";
      ctx.textBaseline = "top";
      ctx.fillText("MÉDEA, ALGERIA", 12, 12);

      // Time
      ctx.fillStyle = "#FF1E1E";
      ctx.font = "bold 36px monospace";
      ctx.fillText(`${h12}:${mm}`, 12, 36);
      ctx.fillStyle = "#71717a";
      ctx.font = "bold 14px monospace";
      ctx.fillText(ampm, 130, 48);

      // Divider
      ctx.fillStyle = "rgba(255, 30, 30, 0.3)";
      ctx.fillRect(12, 92, 232, 1);

      // Rain status
      ctx.fillStyle = "#71717a";
      ctx.font = "10px monospace";
      ctx.fillText("Rain:", 12, 104);
      ctx.fillStyle = "#5b9bff";
      ctx.font = "bold 10px monospace";
      ctx.fillText("ACTIVE", 55, 104);

      // Connection
      ctx.fillStyle = "#71717a";
      ctx.font = "10px monospace";
      ctx.fillText("Connection:", 12, 122);
      ctx.fillStyle = "#22ff77";
      ctx.font = "bold 10px monospace";
      ctx.fillText("ONLINE", 95, 122);

      // Pulsing dot
      const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
      ctx.fillStyle = `rgba(34, 255, 119, ${pulse})`;
      ctx.beginPath();
      ctx.arc(180, 108, 4, 0, Math.PI * 2);
      ctx.fill();

      if (infoTexture) infoTexture.needsUpdate = true;
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [infoCanvas, infoTexture]);

  useFrame((state) => {
    if (!glassMatRef.current) return;
    const t = state.clock.elapsedTime;
    // Subtle lightning flashes from outside
    const flash = Math.sin(t * 0.3) > 0.97 ? 0.8 : 0.04;
    glassMatRef.current.emissiveIntensity = flash;
  });

  // Cleanup
  useEffect(() => {
    return () => {
      infoTexture?.dispose();
    };
  }, [infoTexture]);

  return (
    <group position={[2.7, 1.7, -3.49]}>
      {/* Rain behind the glass (further -Z) */}
      <group position={[0, 0, -0.05]}>
        <Rain count={350} area={[1.6, 1.1, 0.2]} />
      </group>

      {/* Glass plane with subtle blue tint */}
      <mesh>
        <planeGeometry args={[1.6, 1.1]} />
        <meshStandardMaterial
          ref={glassMatRef}
          color="#02030a"
          emissive="#3b82f6"
          emissiveIntensity={0.04}
          transparent
          opacity={0.32}
          roughness={0.05}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Window info overlay (CanvasTexture) — bottom-left corner of window */}
      {infoTexture && (
        <mesh position={[-0.55, -0.3, 0.02]}>
          <planeGeometry args={[0.5, 0.35]} />
          <meshBasicMaterial map={infoTexture} transparent opacity={0.9} toneMapped={false} />
        </mesh>
      )}

      {/* Window frame */}
      <mesh material={frameMat}>
        <boxGeometry args={[1.7, 1.2, 0.05]} />
      </mesh>
      {/* Inner cutout */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.6, 1.1]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Vertical divider */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[0.04, 1.1, 0.04]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Horizontal divider */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[1.6, 0.04, 0.04]} />
        <meshStandardMaterial color="#0a0a0e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Windowsill with water accumulation effect */}
      <mesh position={[0, -0.62, 0.05]}>
        <boxGeometry args={[1.85, 0.05, 0.18]} />
        <meshStandardMaterial color="#0e0e12" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Water droplets on sill (small reflective spheres) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          position={[-0.7 + i * 0.28, -0.59, 0.08 + (i % 2) * 0.04]}
        >
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshStandardMaterial
            color="#5b9bff"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.6}
            emissive="#3b82f6"
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}

      {/* Interactive overlay */}
      <InteractiveObject
        id="window-future"
        panelId="future"
        prompt="Open Future Goals"
        position={[0, 0, 0.06]}
        maxRange={2.5}
        center={[2.7, 1.7, -3.49]}
      >
        <mesh>
          <planeGeometry args={[1.6, 1.1]} />
          <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
        </mesh>
      </InteractiveObject>
    </group>
  );
}
