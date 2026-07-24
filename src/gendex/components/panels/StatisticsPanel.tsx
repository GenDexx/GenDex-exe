"use client";

import { PanelContainer } from "./PanelContainer";
import { STATISTICS } from "../../data/content";
import { useCountUp } from "../../hooks/useCountUp";

export function StatisticsPanel() {
  return (
    <PanelContainer
      panelId="stats"
      title="Statistics"
      subtitle="Numbers from the field"
      accent="red"
    >
      <div className="space-y-6">
        <p className="text-sm md:text-[15px] leading-relaxed text-gendex-text">
          A snapshot of what the past two years of community operations, creator
          management and investigation work actually looks like in numbers.
          Every counter below animates from zero on open — because raw numbers
          are more fun when you watch them climb.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STATISTICS.map((s, i) => (
            <StatCard key={s.id} stat={s} delay={i * 120} />
          ))}
        </div>

        <div className="border border-[#7C3AED]/30 bg-[#7C3AED]/5 p-4 text-center">
          <p className="text-xs text-gendex-text-dim">
            Numbers are approximate and based on internal tooling logs through 2026.
          </p>
        </div>
      </div>
    </PanelContainer>
  );
}

function StatCard({
  stat,
  delay,
}: {
  stat: (typeof STATISTICS)[number];
  delay: number;
}) {
  // Format: views get M/K suffix
  const format = (n: number) => {
    if (stat.id === "views") {
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
      return `${n}`;
    }
    return n.toLocaleString();
  };

  const { display, done } = useCountUp({
    end: stat.value,
    duration: 1600,
    startDelay: delay,
    enabled: true,
    format,
  });

  return (
    <div
      className="relative border border-gendex-border p-4 md:p-5 bg-black/30 overflow-hidden gendex-corner-tl gendex-corner-br"
      style={{ minHeight: "120px" }}
    >
      <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-2">
        › {stat.label}
      </div>
      <div className="text-3xl md:text-4xl font-bold tabular-nums text-[#FF1E1E] gendex-text-glow-red leading-none">
        {stat.prefix}
        {display}
        {stat.suffix}
      </div>
      <div className="mt-2 text-xs text-gendex-text-dim leading-snug">{stat.description}</div>
      {done && (
        <div className="absolute top-2 right-2 text-[9px] uppercase tracking-widest text-[#22ff77]">
          ✓
        </div>
      )}
    </div>
  );
}
