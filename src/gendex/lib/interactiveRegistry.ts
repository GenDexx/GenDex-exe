"use client";

import * as THREE from "three";
import type { PanelId } from "../data/types";

/**
 * v1.3 — Completely rebuilt interaction registry.
 *
 * Each interactable object registers:
 *   - unique id
 *   - panelId to open on interaction
 *   - human-readable prompt (shown in HUD when target is valid)
 *   - maxRange (max distance in meters for interaction)
 *   - a THREE.Object3D whose world-space meshes are raycastable
 *
 * The PlayerControls component performs a true raycast from the camera
 * center against every registered object's children, then checks distance.
 * This guarantees the object is:
 *   1. directly under the crosshair (ray hit)
 *   2. visible (not occluded — raycaster respects depth order)
 *   3. within range (distance check)
 */
export interface InteractiveEntry {
  id: string;
  panelId: PanelId;
  prompt: string;
  maxRange: number; // max interaction distance in world units (meters)
  object: THREE.Object3D; // root object whose subtree is raycastable
  /** World-space center used for distance + prompt-position checks. */
  center: THREE.Vector3;
}

const registry = new Map<string, InteractiveEntry>();

export function registerInteractive(entry: InteractiveEntry) {
  registry.set(entry.id, entry);
}

export function unregisterInteractive(id: string) {
  registry.delete(id);
}

export function getInteractives(): InteractiveEntry[] {
  return Array.from(registry.values());
}

/**
 * Reusable scratch objects — avoid per-frame allocations.
 */
const _ray = new THREE.Raycaster();
const _origin = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _hitPoint = new THREE.Vector3();
const _toObj = new THREE.Vector3();

export interface RaycastResult {
  entry: InteractiveEntry;
  distance: number;
}

/**
 * Perform a single raycast from the camera's center (crosshair) and return
 * the closest interactable object whose meshes are hit AND within range.
 *
 * Returns null if nothing is hit or everything is out of range.
 *
 * The caller passes the camera; we compute origin + direction from it.
 */
export function raycastInteractives(
  camera: THREE.Camera,
  maxDistanceFallback = 2.5
): RaycastResult | null {
  // Build the ray from camera center
  camera.getWorldPosition(_origin);
  camera.getWorldDirection(_dir);
  _ray.set(_origin, _dir);
  _ray.far = 50; // far enough to hit walls across the room; range filter below
  _ray.near = 0.05;

  // For each interactable, gather its descendant meshes and raycast.
  // We then pick the closest hit whose distance is within the entry's maxRange.
  let bestResult: RaycastResult | null = null;

  for (const entry of registry.values()) {
    if (!entry.object) continue;

    // Collect meshes under this entry's object (recursive)
    const meshes: THREE.Mesh[] = [];
    entry.object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        // Skip meshes marked as non-raycastable (e.g., invisible overlay planes
        // that are only there for visual purposes)
        if (mesh.userData.nonRaycast) return;
        meshes.push(mesh);
      }
    });
    if (meshes.length === 0) continue;

    const hits = _ray.intersectObjects(meshes, false);
    if (hits.length === 0) continue;

    // Closest hit on this object
    const hit = hits[0];
    const dist = hit.distance;

    // Distance check against this entry's max range
    if (dist > entry.maxRange) continue;

    // Pick the overall closest valid entry
    if (!bestResult || dist < bestResult.distance) {
      _hitPoint.copy(hit.point);
      _toObj.copy(_hitPoint).sub(_origin);
      bestResult = { entry, distance: dist };
    }
  }

  // Safety fallback: if nothing hit but an entry's center is essentially under
  // the crosshair (dot ~1) and within range — allow it. This handles edge
  // cases where the visual mesh doesn't fully cover the logical area.
  if (!bestResult) {
    let bestFallback: RaycastResult | null = null;
    let bestFallbackDist = Infinity;
    for (const entry of registry.values()) {
      _toObj.copy(entry.center).sub(_origin);
      const dist = _toObj.length();
      if (dist > Math.min(entry.maxRange, maxDistanceFallback)) continue;
      _toObj.normalize();
      const dot = _toObj.dot(_dir);
      // Only accept if very centered (within ~1 degree)
      if (dot < 0.99985) continue;
      if (dist < bestFallbackDist) {
        bestFallbackDist = dist;
        bestFallback = { entry, distance: dist };
      }
    }
    return bestFallback;
  }

  return bestResult;
}

/**
 * Convenience helper for the MobileControls tap-raycast: given a screen NDC
 * point (x, y in [-1, 1]) and a camera, return the closest interactable.
 *
 * `maxDistance` overrides the per-entry maxRange. Mobile uses a generous
 * distance (15m) so users can tap objects from across the room without
 * strict range restrictions. Desktop uses the per-entry maxRange (2.5m).
 */
export function raycastInteractivesAtScreenPoint(
  camera: THREE.Camera,
  ndcX: number,
  ndcY: number,
  maxDistance?: number
): RaycastResult | null {
  _origin.copy(camera.position);
  _ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
  _ray.far = 50;
  _ray.near = 0.05;

  let bestResult: RaycastResult | null = null;

  for (const entry of registry.values()) {
    if (!entry.object) continue;
    const meshes: THREE.Mesh[] = [];
    entry.object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.userData.nonRaycast) return;
        meshes.push(mesh);
      }
    });
    if (meshes.length === 0) continue;

    const hits = _ray.intersectObjects(meshes, false);
    if (hits.length === 0) continue;
    const hit = hits[0];
    const dist = hit.distance;
    // Use maxDistance override if provided (mobile), otherwise use per-entry maxRange (desktop)
    const effectiveMax = maxDistance ?? entry.maxRange;
    if (dist > effectiveMax) continue;
    if (!bestResult || dist < bestResult.distance) {
      bestResult = { entry, distance: dist };
    }
  }

  return bestResult;
}
