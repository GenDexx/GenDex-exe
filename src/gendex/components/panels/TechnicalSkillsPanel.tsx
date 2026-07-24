"use client";

import { PanelContainer } from "./PanelContainer";
import { SKILLS } from "../../data/content";
import type { SkillItem } from "../../data/types";

const CATEGORY_LABELS: Record<SkillItem["category"], string> = {
  language: "Languages",
  framework: "Frameworks & Libraries",
  tool: "Tools",
  automation: "Automation",
  analysis: "Data & Analysis",
};

const CATEGORY_ORDER: SkillItem["category"][] = ["language", "framework", "tool", "automation", "analysis"];

export function TechnicalSkillsPanel() {
  // Group by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: SKILLS.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <PanelContainer
      panelId="skills"
      title="Technical Skills"
      subtitle="Stack used daily for automation, bots and tooling"
      accent="purple"
    >
      <div className="space-y-6">
        <p className="text-sm md:text-[15px] leading-relaxed text-gendex-text">
          The toolkit below is what GenDex reaches for every day. He's strongest
          on the Node.js / TypeScript / Discord.js axis — the stack that powers
          the bots and automation pipelines at Stellar Gate Games — and
          increasingly comfortable in Python for data analysis and API
          investigation work. Every level is self-reported and intentionally
          honest; there's no point inflating a number you'll be tested on at
          3 AM.
        </p>

        {grouped.map((g) => (
          <div key={g.category}>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-3">
              › {CATEGORY_LABELS[g.category]}
            </div>
            <div className="space-y-2">
              {g.items.map((s) => (
                <SkillBar key={s.name} skill={s} />
              ))}
            </div>
          </div>
        ))}

        {/* Footer note */}
        <div className="border border-[#FF1E1E]/20 bg-[#FF1E1E]/5 p-3 text-xs text-gendex-text-dim">
          <span className="text-[#FF1E1E]">›</span> Always learning. Always
          investigating. Always opening the black box.
        </div>
      </div>
    </PanelContainer>
  );
}

function SkillBar({ skill }: { skill: SkillItem }) {
  const accent = skill.level >= 85 ? "#FF1E1E" : skill.level >= 75 ? "#7C3AED" : "#71717a";
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-gendex-text font-medium">{skill.name}</span>
      <div className="flex-1 h-2 bg-[#0c0c10] overflow-hidden border border-gendex-border">
        <div
          className="h-full transition-all"
          style={{
            width: `${skill.level}%`,
            background: `linear-gradient(90deg, ${accent}, ${accent}aa)`,
            boxShadow: `0 0 8px ${accent}88`,
          }}
        />
      </div>
      <span className="w-10 text-right text-[10px] tabular-nums" style={{ color: accent }}>
        {skill.level}%
      </span>
    </div>
  );
}
