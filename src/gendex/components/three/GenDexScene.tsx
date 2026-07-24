"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

import { Room } from "./Room";
import { Desk } from "./Desk";
import { Whiteboard } from "./Whiteboard";
import { ServerRack } from "./ServerRack";
import { Window } from "./Window";
import { Door } from "./Door";
import { LEDLights } from "./LEDLights";
import { Dust } from "./Dust";
import { CameraController } from "./CameraController";
import { PlayerControls } from "./PlayerControls";
import { MobileControls } from "./MobileControls";
import { ExteriorRain } from "./ExteriorRain";
import { WallTimeline } from "./WallTimeline";
import { CertificationShelf } from "./CertificationShelf";
// v1.7: Living elements
import { CoffeeMugWithSteam, CeilingFan, WallClock, Lightning, Chair } from "./LivingElements";
import { Shelf, OpenNotebook, RGBKeyboard, MouseGlow } from "./Shelf";
import { useSceneStore } from "../../store/useSceneStore";

/**
 * v1.7: Scene with living elements. Lighting distribution:
 *   40% Monitor emission (handled by LiveMonitor emissive materials)
 *   20% Moonlight (directional light through window)
 *   20% Red LEDs (LEDLights component)
 *   10% Purple (ambient + hemisphere)
 *   10% Ambient (low ambient fill)
 */
function SceneObjects() {
  return (
    <>
      {/* ===== LIGHTING (v1.7 rebalanced) ===== */}
      {/* 10% Ambient — very dim warm fill */}
      <ambientLight intensity={0.08} color="#2a1a2a" />
      {/* 10% Purple hemisphere fill */}
      <hemisphereLight args={["#3b2b55", "#0a0a0e", 0.12]} />
      {/* 20% Moonlight — cool blue through the window */}
      <directionalLight position={[3, 4, -8]} intensity={0.4} color="#5b6cff" />
      {/* Small warm rim from behind camera */}
      <pointLight position={[0, 2.5, 4]} intensity={0.12} color="#FF1E1E" distance={8} decay={2} />
      {/* v1.7: Ceiling fill light (soft warm) */}
      <pointLight position={[0, 3.2, 0]} intensity={0.1} color="#FFE4B5" distance={8} decay={2} />

      {/* ===== Room + existing interactive objects ===== */}
      <Room />
      <Desk />
      <Whiteboard />
      <ServerRack />
      <Window />
      <Door />
      <WallTimeline />
      <CertificationShelf />

      {/* ===== v1.7: Living elements ===== */}
      <CoffeeMugWithSteam />
      <CeilingFan />
      <WallClock />
      <Lightning />
      <Chair />
      <Shelf />
      <OpenNotebook />
      <RGBKeyboard />
      <MouseGlow />

      {/* ===== Ambient particles ===== */}
      <Dust />
      <ExteriorRain />
      <LEDLights />
    </>
  );
}

function CameraSystems() {
  return (
    <>
      <CameraController />
      <PlayerControls />
      <MobileControls />
    </>
  );
}

export function GenDexScene() {
  const isMobile = useSceneStore((s) => s.isMobile);

  const glConfig = useMemo(
    () => ({
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance" as const,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.05,
    }),
    [isMobile]
  );

  const cameraConfig = useMemo(
    () => ({
      position: [0, 5.0, 9.0] as [number, number, number],
      fov: 55,
      near: 0.1,
      far: 100,
    }),
    []
  );

  const dprConfig = useMemo(
    () => (isMobile ? 1 : [1, 2] as [number, number]),
    [isMobile]
  );

  return (
    <Canvas
      shadows={false}
      dpr={dprConfig}
      gl={glConfig}
      camera={cameraConfig}
      onCreated={({ gl }) => {
        gl.setClearColor("#020203");
      }}
    >
      {/* Camera systems — outside Suspense, never remount */}
      <CameraSystems />

      {/* Scene objects — inside Suspense */}
      <Suspense fallback={null}>
        <SceneObjects />
        <Preload all />
        {!isMobile && (
          <EffectComposer multisampling={2}>
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.18}
              luminanceSmoothing={0.22}
              mipmapBlur
              radius={0.7}
            />
            <Vignette eskil={false} offset={0.25} darkness={0.95} />
            <Noise opacity={0.04} />
          </EffectComposer>
        )}
      </Suspense>

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  );
}
