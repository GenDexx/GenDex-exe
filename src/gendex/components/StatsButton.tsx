"use client";

import { useSceneStore } from "../store/useSceneStore";
import { useAudio } from "../hooks/useAudio";

export function StatsButton() {
  const setActivePanel = useSceneStore((s) => s.setActivePanel);
  const { play } = useAudio();

  return (
    <button
      onClick={() => {
        play("open");
        setActivePanel("stats");
      }}
      className="group flex items-center gap-2 border border-[#7C3AED]/40 bg-black/60 backdrop-blur px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-gendex-text hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
      Statistics
    </button>
  );
}
