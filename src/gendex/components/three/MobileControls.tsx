"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useSceneStore } from "../../store/useSceneStore";
import { useAudio } from "../../hooks/useAudio";
import { raycastInteractivesAtScreenPoint } from "../../lib/interactiveRegistry";

// Orbit target — the center of the room at desk height
const ORBIT_TARGET = new THREE.Vector3(0, 1.3, -1.5);

// Idle time (seconds) before guided auto-rotation kicks in
const IDLE_THRESHOLD_SEC = 5;

// Max tap distance (pixels) — if finger moved more than this, it's a drag
const TAP_MAX_DIST_PX = 12;
// Max tap duration (ms) — if longer, it's a drag
const TAP_MAX_MS = 250;

// Mobile tap interaction distance — generous, since mobile users orbit
// the camera and may be further from objects. No strict range limit.
const MOBILE_TAP_MAX_DISTANCE = 15;

/**
 * v1.4 — Mobile-only controls.
 *
 * CRITICAL: This component must NEVER affect the desktop experience.
 *   - All useEffect hooks early-return if `!isMobile`.
 *   - All useFrame hooks early-return if `!isMobile`.
 *   - The <OrbitControls> element is only rendered when `isMobile` is true.
 *   - On desktop, this component is effectively a no-op.
 *
 * The cameraOwner is set to 'mobile' when this component takes control,
 * for debugging.
 */
export function MobileControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const ready = useSceneStore((s) => s.ready);
  const isMobile = useSceneStore((s) => s.isMobile);
  const setActivePanel = useSceneStore((s) => s.setActivePanel);
  const setCameraOwner = useSceneStore((s) => s.setCameraOwner);
  const { play } = useAudio();

  const lastTouchTime = useRef(Date.now());
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);

  // ===== Claim ownership when ready + mobile =====
  useEffect(() => {
    if (!ready || !isMobile) return;
    setCameraOwner("mobile");
    console.log("[GENDEX] Camera owner: mobile");
  }, [ready, isMobile, setCameraOwner]);

  // ===== Touch event listeners =====
  useEffect(() => {
    if (!ready || !isMobile) return;
    const canvas = gl.domElement;

    const onTouchStart = (e: TouchEvent) => {
      lastTouchTime.current = Date.now();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      } else {
        touchStart.current = null;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      lastTouchTime.current = Date.now();
      if (!touchStart.current) return;

      const dt = Date.now() - touchStart.current.time;
      if (dt > TAP_MAX_MS) {
        touchStart.current = null;
        return;
      }

      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      touchStart.current = null;

      if (dist > TAP_MAX_DIST_PX) return;

      const rect = canvas.getBoundingClientRect();
      const ndcX = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((t.clientY - rect.top) / rect.height) * 2 + 1;

      // Mobile tap: raycast at the tap point. Uses a generous max distance
      // (MOBILE_TAP_MAX_DISTANCE) so mobile users can tap objects from across
      // the room — no strict range restriction like desktop's 2.5m.
      const result = raycastInteractivesAtScreenPoint(camera, ndcX, ndcY, MOBILE_TAP_MAX_DISTANCE);
      if (result) {
        console.log(
          `[GENDEX] Mobile tap → id=${result.entry.id} panel=${result.entry.panelId} distance=${result.distance.toFixed(2)}m`
        );
        play("open");
        setActivePanel(result.entry.panelId);
      } else {
        console.log("[GENDEX] Mobile tap — no valid target");
      }
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [ready, isMobile, camera, gl, play, setActivePanel]);

  // ===== Guided camera: auto-rotate when idle =====
  useFrame(() => {
    // CRITICAL: early-return on desktop — never touch the camera
    if (!ready || !isMobile) return;
    if (!controlsRef.current) return;

    const idleSec = (Date.now() - lastTouchTime.current) / 1000;
    if (idleSec > IDLE_THRESHOLD_SEC) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.4;
    } else {
      controlsRef.current.autoRotate = false;
    }
    controlsRef.current.update();
  });

  // Don't render OrbitControls on desktop — this prevents any accidental
  // camera modification from the controls instance.
  if (!isMobile) return null;

  return (
    <OrbitControls
      ref={controlsRef as any}
      enabled={ready && isMobile}
      target={ORBIT_TARGET}
      enablePan={false}
      enableZoom={true}
      zoomSpeed={0.6}
      minDistance={2.5}
      maxDistance={6}
      minPolarAngle={Math.PI * 0.22}
      maxPolarAngle={Math.PI * 0.58}
      enableDamping
      dampingFactor={0.12}
      rotateSpeed={0.55}
      makeDefault={false}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      }}
    />
  );
}
