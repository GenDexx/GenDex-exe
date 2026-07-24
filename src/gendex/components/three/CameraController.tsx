"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useSceneStore } from "../../store/useSceneStore";
import { useAudio } from "../../hooks/useAudio";

interface CameraTargetDef {
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
}

const DEFAULT_CAM: CameraTargetDef = {
  position: [0, 1.7, 2.6],
  target: [0, 1.4, -3.1],
  fov: 65,
};

const CENTER_MONITOR_FOCUS: CameraTargetDef = {
  position: [0, 1.5, 0.5],
  target: [0, 1.32, -3.12],
  fov: 38,
};

const ENTRY_START: CameraTargetDef = {
  position: [0, 5.0, 9.0],
  target: [0, 1.4, -3.0],
  fov: 55,
};

// Module-level flag — set synchronously on first execution
let introStarted = false;

/**
 * v1.4 — Camera intro orchestrator (REBUILT).
 *
 * This component runs the GSAP intro animation. It's inside the R3F Canvas
 * (so it has access to the camera via useThree), but uses a module-level
 * flag + the store to ensure the intro only runs ONCE, even if the component
 * remounts multiple times during R3F Canvas initialization.
 *
 * The flag is set SYNCHRONOUSLY in the render phase (not in useEffect), which
 * means it's set before any subsequent mount's render can check it.
 */
export function CameraController() {
  const { camera } = useThree();
  const booted = useSceneStore((s) => s.booted);
  const ready = useSceneStore((s) => s.ready);
  const setReady = useSceneStore((s) => s.setReady);
  const setTransitioning = useSceneStore((s) => s.setTransitioning);
  const setCameraOwner = useSceneStore((s) => s.setCameraOwner);
  const { enable } = useAudio();

  const cameraRef = useRef(camera);
  cameraRef.current = camera;

  // SYNCHRONOUS render-phase check: if we should start the intro and haven't
  // yet (module flag), claim it NOW. This prevents subsequent mounts from
  // starting a second intro.
  const canStart = booted && !ready && !introStarted;
  if (canStart) {
    introStarted = true;
  }

  useEffect(() => {
    if (!canStart) return;
    if (!booted) return;

    const cam = cameraRef.current;
    const targetVec = new THREE.Vector3();

    // Place camera outside the room
    cam.position.set(...ENTRY_START.position);
    targetVec.set(...ENTRY_START.target);
    cam.lookAt(targetVec);
    if (cam instanceof THREE.PerspectiveCamera) {
      cam.fov = ENTRY_START.fov;
      cam.updateProjectionMatrix();
    }

    setCameraOwner("intro");
    setTransitioning(true);
    enable();
    console.log("[GENDEX] Camera owner: intro (GSAP animation starting)");

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        console.log("[GENDEX] GSAP timeline: COMPLETE");
        setReady(true);
        setTransitioning(false);
        const newOwner = useSceneStore.getState().isMobile ? "mobile" : "player";
        setCameraOwner(newOwner);
        console.log(`[GENDEX] Camera owner: ${newOwner} (intro complete)`);
      },
    });

    tl.to({}, { duration: 1.0 });

    tl.to(cam.position, {
      x: CENTER_MONITOR_FOCUS.position[0],
      y: CENTER_MONITOR_FOCUS.position[1],
      z: CENTER_MONITOR_FOCUS.position[2],
      duration: 3.5,
      ease: "power2.inOut",
    }, ">-0.2");
    tl.to(targetVec, {
      x: CENTER_MONITOR_FOCUS.target[0],
      y: CENTER_MONITOR_FOCUS.target[1],
      z: CENTER_MONITOR_FOCUS.target[2],
      duration: 3.5,
      ease: "power2.inOut",
      onUpdate: () => cam.lookAt(targetVec),
    }, "<");
    if (cam instanceof THREE.PerspectiveCamera) {
      tl.to(cam, {
        fov: CENTER_MONITOR_FOCUS.fov,
        duration: 3.5,
        onUpdate: () => cam.updateProjectionMatrix(),
      }, "<");
    }

    tl.to({}, { duration: 1.2 });

    tl.to(cam.position, {
      x: DEFAULT_CAM.position[0],
      y: DEFAULT_CAM.position[1],
      z: DEFAULT_CAM.position[2],
      duration: 1.5,
      ease: "power2.inOut",
    }, ">");
    tl.to(targetVec, {
      x: DEFAULT_CAM.target[0],
      y: DEFAULT_CAM.target[1],
      z: DEFAULT_CAM.target[2],
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => cam.lookAt(targetVec),
    }, "<");
    if (cam instanceof THREE.PerspectiveCamera) {
      tl.to(cam, {
        fov: DEFAULT_CAM.fov,
        duration: 1.5,
        onUpdate: () => cam.updateProjectionMatrix(),
      }, "<");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, canStart]);

  return null;
}
