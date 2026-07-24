"use client";

import { useEffect, useRef, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "../../store/useSceneStore";
import { useAudio } from "../../hooks/useAudio";
import { raycastInteractives } from "../../lib/interactiveRegistry";

const EYE_HEIGHT = 1.7;
const ROOM_HALF_W = 4.2;
const ROOM_MIN_Z = -3.0;
const ROOM_MAX_Z = 3.5;

const WALK_SPEED = 2.2;
const SPRINT_SPEED = 4.4;

/**
 * v1.4 constants
 */
// 1-second cooldown after ESC before pointer lock can be re-acquired.
const ESC_COOLDOWN_MS = 1000;
// 250ms cooldown between interactions.
const INTERACTION_COOLDOWN_MS = 250;
// Max distance for the per-frame center-crosshair raycast.
const RAYCAST_MAX_DISTANCE = 2.5;

// === Look controller constants ===
// Mouse sensitivity (radians per pixel of mouse movement).
const MOUSE_SENSITIVITY = 0.0022;
// Smoothing factor for mouse look. Higher = snappier, lower = smoother.
// 0.15 means we close 15% of the gap to the target each frame at 60fps.
const LOOK_SMOOTHING = 0.18;
// Pitch clamp in radians. ±80° = ~1.396 rad. Prevents gimbal lock.
const PITCH_MIN = -80 * (Math.PI / 180);
const PITCH_MAX = 80 * (Math.PI / 180);

// Reusable temp objects (avoid per-frame allocations)
const _quatYaw = new THREE.Quaternion();
const _quatPitch = new THREE.Quaternion();
const _eulerTemp = new THREE.Euler(0, 0, 0, "YXZ"); // YXZ order = yaw then pitch

/**
 * v1.4 — Completely rebuilt desktop first-person controller.
 *
 * ROOT CAUSE of v1.3 camera bugs:
 *   drei's <PointerLockControls> internally modifies camera.rotation (Euler XYZ).
 *   When pitch approaches ±90°, Euler decomposition becomes ambiguous and the
 *   camera flips 90-180° instantly. This is classic gimbal lock.
 *
 * FIX:
 *   Replace PointerLockControls with a CUSTOM pointer-lock + mouse-look
 *   controller that:
 *     1. Tracks yaw + pitch as separate scalar values (NOT Euler).
 *     2. Clamps pitch to ±80° (never reaches 90° → no gimbal lock).
 *     3. Applies rotation via camera.quaternion (composed from yaw × pitch),
 *        never touches camera.rotation directly.
 *     4. Smoothes mouse movement by lerping current yaw/pitch toward target.
 *
 * OWNERSHIP:
 *   This is the ONLY component that modifies camera.rotation/quaternion during
 *   desktop gameplay. CameraController only runs during the intro (GSAP),
 *   and hands off ownership here when intro completes. MobileControls returns
 *   null on desktop and never registers any useFrame work.
 *
 * DEBUG LOGGING:
 *   - Mouse delta (on significant movement)
 *   - Camera rotation (yaw/pitch in degrees, on change)
 *   - Pointer lock state (lock/unlock events)
 *   - Active controller (cameraOwner transitions)
 */
export function PlayerControls() {
  const { camera, gl } = useThree();
  const ready = useSceneStore((s) => s.ready);
  const isMobile = useSceneStore((s) => s.isMobile);
  const setPlayerLocked = useSceneStore((s) => s.setPlayerLocked);
  const setFocusedObject = useSceneStore((s) => s.setFocusedObject);
  const setActivePanel = useSceneStore((s) => s.setActivePanel);
  const setCameraOwner = useSceneStore((s) => s.setCameraOwner);
  const { play } = useAudio();

  // === ESC cooldown ===
  const lastUnlockTime = useRef(0);
  const cooldownActive = useRef(false);

  // === Interaction cooldown ===
  const lastInteractionTime = useRef(0);

  // === Keyboard state ===
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());

  // === Look state (the core of the fix) ===
  // Yaw (left/right) and pitch (up/down) tracked as scalars.
  // `target` is where the mouse wants to be; `current` is where we actually
  // are (lerped toward target for smoothness).
  const yaw = useRef({ target: 0, current: 0 });
  const pitch = useRef({ target: 0, current: 0 });

  // === Pointer lock state ===
  const isLockedRef = useRef(false);
  const pointerLockElementRef = useRef<HTMLElement | null>(null);

  // === Debug logging throttle ===
  const lastFocusedId = useRef<string | null>(null);

  // ===== Initialize yaw/pitch from camera's current orientation on ready =====
  // This ensures the camera doesn't snap when pointer lock begins — we read
  // the camera's current look direction and derive yaw/pitch from it.
  useEffect(() => {
    if (!ready || isMobile) return;
    // Extract yaw + pitch from camera quaternion using YXZ Euler
    _eulerTemp.setFromQuaternion(camera.quaternion, "YXZ");
    yaw.current.target = _eulerTemp.y;
    yaw.current.current = _eulerTemp.y;
    pitch.current.target = _eulerTemp.x;
    pitch.current.current = _eulerTemp.x;
    console.log(
      `[GENDEX] Look init: yaw=${(_eulerTemp.y * 180 / Math.PI).toFixed(1)}° pitch=${(_eulerTemp.x * 180 / Math.PI).toFixed(1)}°`
    );
  }, [ready, isMobile, camera]);

  // ===== Mouse move handler (only active when pointer locked) =====
  // v1.6: Added spike guard — when pointer lock is first acquired, the browser
  // may fire a single mousemove event with a large movementX/movementY (the
  // cursor jumping to center). This was causing an instant camera flick.
  // Solution: ignore the first mousemove event after each lock acquisition.
  const firstEventAfterLock = useRef(true);

  useEffect(() => {
    if (!ready || isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!isLockedRef.current) return;

      // v1.6: Skip the first event after lock acquisition (spike guard)
      if (firstEventAfterLock.current) {
        firstEventAfterLock.current = false;
        return;
      }

      const dx = e.movementX || 0;
      const dy = e.movementY || 0;

      // v1.6: Clamp absurd deltas (another spike guard — some browsers fire
      // huge values on focus regain or window re-entry)
      const clampedDx = Math.max(-100, Math.min(100, dx));
      const clampedDy = Math.max(-100, Math.min(100, dy));

      yaw.current.target -= clampedDx * MOUSE_SENSITIVITY;
      pitch.current.target -= clampedDy * MOUSE_SENSITIVITY;

      pitch.current.target = Math.max(PITCH_MIN, Math.min(PITCH_MAX, pitch.current.target));

      if (yaw.current.target > Math.PI) yaw.current.target -= 2 * Math.PI;
      if (yaw.current.target < -Math.PI) yaw.current.target += 2 * Math.PI;
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [ready, isMobile]);

  // ===== Pointer lock lifecycle =====
  const onPointerLockChange = useCallback(() => {
    const locked = pointerLockElementRef.current === document.pointerLockElement;
    isLockedRef.current = locked;
    setPlayerLocked(locked);

    if (locked) {
      cooldownActive.current = false;
      setCameraOwner("player");
      // v1.6: Reset spike guard — first mousemove after lock will be ignored
      firstEventAfterLock.current = true;
      console.log("[GENDEX] PointerLock: LOCKED | owner: player");
    } else {
      lastUnlockTime.current = Date.now();
      cooldownActive.current = true;
      setFocusedObject(null);
      // Don't claim ownership back to 'none' — the intro might still own it
      // if we're in the transition phase. Only set to 'player' when locked.
      console.log("[GENDEX] PointerLock: UNLOCKED (cooldown 1s)");
      setTimeout(() => {
        cooldownActive.current = false;
      }, ESC_COOLDOWN_MS);
    }
  }, [setPlayerLocked, setFocusedObject, setCameraOwner]);

  useEffect(() => {
    if (!ready || isMobile) return;
    document.addEventListener("pointerlockchange", onPointerLockChange);
    return () => document.removeEventListener("pointerlockchange", onPointerLockChange);
  }, [ready, isMobile, onPointerLockChange]);

  // ===== Click-to-lock: explicit user gesture only =====
  // Left-click ONLY acquires pointer lock. NEVER triggers interactions.
  useEffect(() => {
    if (!ready || isMobile) return;
    const canvas = gl.domElement;
    pointerLockElementRef.current = canvas;

    const onClick = () => {
      const s = useSceneStore.getState();
      if (s.activePanel !== null || s.terminalOpen) return;
      if (cooldownActive.current) return;
      if (isLockedRef.current) return;
      canvas.requestPointerLock();
    };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [ready, isMobile, gl]);

  // ===== E key handler =====
  useEffect(() => {
    if (isMobile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;

      if (e.code === "KeyE") {
        const s = useSceneStore.getState();
        if (!s.ready) return;
        if (s.activePanel !== null) return;
        if (s.terminalOpen) return;
        if (!isLockedRef.current) return;

        const now = Date.now();
        if (now - lastInteractionTime.current < INTERACTION_COOLDOWN_MS) return;

        const result = raycastInteractives(camera, RAYCAST_MAX_DISTANCE);
        if (!result) {
          console.log("[GENDEX] E pressed — no valid target under crosshair");
          return;
        }

        lastInteractionTime.current = now;
        console.log(
          `[GENDEX] E interact → id=${result.entry.id} panel=${result.entry.panelId} distance=${result.distance.toFixed(2)}m`
        );
        play("open");
        setActivePanel(result.entry.panelId);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [camera, isMobile, play, setActivePanel]);

  // ===== When a panel opens: release pointer lock immediately =====
  const activePanel = useSceneStore((s) => s.activePanel);
  const terminalOpen = useSceneStore((s) => s.terminalOpen);
  useEffect(() => {
    if ((activePanel !== null || terminalOpen) && isLockedRef.current) {
      document.exitPointerLock();
    }
    if (activePanel === null && !terminalOpen) {
      velocity.current.set(0, 0, 0);
    }
  }, [activePanel, terminalOpen]);

  // ===== Per-frame: look application + movement + raycast =====
  const fwdVec = useRef(new THREE.Vector3());
  const rightVec = useRef(new THREE.Vector3());
  const moveVec = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!ready || isMobile) return;
    const s = useSceneStore.getState();
    const controlsPaused = s.activePanel !== null || s.terminalOpen;
    const locked = isLockedRef.current;

    // ===== 1. APPLY LOOK (smoothed) =====
    // Lerp current toward target for smooth mouse feel.
    // Only when locked — otherwise the camera stays where the intro left it.
    if (locked && !controlsPaused) {
      // Frame-rate independent smoothing
      const t = 1 - Math.pow(1 - LOOK_SMOOTHING, delta * 60);
      yaw.current.current += (yaw.current.target - yaw.current.current) * t;
      pitch.current.current += (pitch.current.target - pitch.current.current) * t;

      // Build quaternion from yaw + pitch (YXZ order = yaw around Y, then pitch around X)
      // This avoids Euler gimbal lock entirely because we compose two rotations
      // as quaternions, never decomposing a single Euler.
      _eulerTemp.set(
        pitch.current.current,
        yaw.current.current,
        0,
        "YXZ"
      );
      camera.quaternion.setFromEuler(_eulerTemp);
    }

    // ===== 2. MOVEMENT (only when locked AND no panel open) =====
    if (locked && !controlsPaused) {
      const sprinting = keys.current["ShiftLeft"] || keys.current["ShiftRight"];
      const speed = sprinting ? SPRINT_SPEED : WALK_SPEED;

      // Forward vector from yaw only (no pitch — we don't fly)
      fwdVec.current.set(
        -Math.sin(yaw.current.current),
        0,
        -Math.cos(yaw.current.current)
      );
      rightVec.current.set(
        Math.cos(yaw.current.current),
        0,
        -Math.sin(yaw.current.current)
      );

      moveVec.current.set(0, 0, 0);
      if (keys.current["KeyW"]) moveVec.current.add(fwdVec.current);
      if (keys.current["KeyS"]) moveVec.current.sub(fwdVec.current);
      if (keys.current["KeyD"]) moveVec.current.add(rightVec.current);
      if (keys.current["KeyA"]) moveVec.current.sub(rightVec.current);

      if (moveVec.current.lengthSq() > 0) {
        moveVec.current.normalize().multiplyScalar(speed * delta);
        velocity.current.lerp(moveVec.current, 0.25);
        camera.position.add(velocity.current);
      } else {
        velocity.current.multiplyScalar(0.8);
        camera.position.add(velocity.current);
      }

      // Clamp to room bounds
      camera.position.x = Math.max(-ROOM_HALF_W, Math.min(ROOM_HALF_W, camera.position.x));
      camera.position.z = Math.max(ROOM_MIN_Z, Math.min(ROOM_MAX_Z, camera.position.z));
      camera.position.y = EYE_HEIGHT;
    } else {
      velocity.current.multiplyScalar(0.5);
    }

    // ===== 3. FOCUS DETECTION =====
    // v1.6: Only update the store when the FOCUSED OBJECT ID changes.
    // Previously, this fired every frame when distance changed (even by
    // 0.05m), causing constant store updates → all InteractiveObjects
    // re-rendered → R3F reconciler churn → visual stutter.
    // Now: one store update when you look ON an object, one when you look OFF.
    // That's it. No per-frame distance updates.
    if (locked && !controlsPaused) {
      const result = raycastInteractives(camera, RAYCAST_MAX_DISTANCE);
      const newId = result?.entry.id ?? null;
      const newPrompt = result?.entry.prompt ?? null;

      if (newId !== lastFocusedId.current) {
        lastFocusedId.current = newId;
        // Only pass distance on the initial focus (for the HUD display).
        // No per-frame distance updates after that.
        setFocusedObject(newId, newPrompt, result?.distance ?? null);
      }
    } else {
      if (lastFocusedId.current !== null) {
        lastFocusedId.current = null;
        setFocusedObject(null);
      }
    }
  });

  // Render nothing on mobile
  if (isMobile) return null;

  // Render nothing visually — this is a pure logic component.
  // No <PointerLockControls> — we handle pointer lock manually via the
  // Pointer Lock API (canvas.requestPointerLock + pointerlockchange event).
  return null;
}
