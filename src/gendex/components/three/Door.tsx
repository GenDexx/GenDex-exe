"use client";

import { InteractiveObject } from "./InteractiveObject";

/**
 * A door on the right wall (next to the whiteboard). Interactive — opens the
 * contact panel.
 *
 * Geometry is intentionally simple: a slab + handle + subtle red underlight
 * that hints at "exit / contact" semantics.
 */
export function Door() {
  return (
    <group position={[4.45, 1.05, 1.6]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Door slab */}
      <InteractiveObject
        id="door-contact"
        panelId="contact"
        prompt="Open Contact"
        position={[0, 0, 0]}
        maxRange={2.5}
        center={[4.4, 1.05, 1.6]}
      >
        <mesh>
          <boxGeometry args={[0.95, 2.1, 0.06]} />
          <meshStandardMaterial color="#0a0a0e" metalness={0.45} roughness={0.55} />
        </mesh>
        {/* Inset panel */}
        <mesh position={[0, 0.1, 0.04]}>
          <boxGeometry args={[0.7, 1.4, 0.01]} />
          <meshStandardMaterial color="#050507" metalness={0.3} roughness={0.8} />
        </mesh>
        {/* EXIT-style label */}
        <mesh position={[0, 0.85, 0.035]}>
          <planeGeometry args={[0.4, 0.08]} />
          <meshStandardMaterial
            color="#FF1E1E"
            emissive="#FF1E1E"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
        {/* Handle */}
        <mesh position={[-0.36, 0, 0.06]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#FF1E1E" emissive="#FF1E1E" emissiveIntensity={0.6} metalness={0.8} roughness={0.2} />
        </mesh>
      </InteractiveObject>

      {/* Door frame */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[1.05, 2.2, 0.04]} />
        <meshStandardMaterial color="#08080b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Underlight — red floor strip suggesting "exit path" */}
      <mesh position={[0, -1.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.18]} />
        <meshStandardMaterial
          color="#FF1E1E"
          emissive="#FF1E1E"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
