"use client";

import { useSceneStore } from "../../store/useSceneStore";

interface ExteriorRainProps {
  intensity?: "high" | "low";
}

/**
 * Rain particle system positioned OUTSIDE the room (behind the back wall,
 * spread across a wide area). Visible through the window as falling streaks.
 *
 * Uses the existing Rain component but with a much larger area and origin
 * positioned beyond the back wall.
 */
export function ExteriorRain({ intensity = "high" }: ExteriorRainProps) {
  const isMobile = useSceneStore((s) => s.isMobile);
  const count = intensity === "high" ? (isMobile ? 600 : 1500) : 300;

  return (
    <group position={[0, 0, -8]}>
      <RainWrapper count={count} />
    </group>
  );
}

// Lazy import of Rain to keep this file self-contained
import { Rain } from "./Rain";

function RainWrapper({ count }: { count: number }) {
  return (
    <Rain
      count={count}
      area={[20, 8, 4]}
      origin={[0, 0, 0]}
      speed={12}
      streakLength={0.2}
      color="#9bb8ff"
    />
  );
}
