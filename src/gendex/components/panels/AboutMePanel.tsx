"use client";

import { PanelContainer } from "./PanelContainer";
import { PERSON } from "../../data/content";
import { useTypewriter } from "../../hooks/useTypewriter";

export function AboutMePanel() {
  const tagline = useTypewriter({
    text: PERSON.tagline,
    speed: 28,
    startDelay: 200,
    enabled: true,
  });

  return (
    <PanelContainer
      panelId="about"
      title={PERSON.fullName}
      subtitle={PERSON.role}
      accent="purple"
    >
      <div className="space-y-6">
        {/* Identity card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <Field label="alias" value={PERSON.nickname} accent />
          <Field label="age" value={`${PERSON.age}`} />
          <Field label="location" value={PERSON.location} />
          <Field label="nationality" value={PERSON.nationality} />
        </div>

        {/* Tagline */}
        <div className="border-l-2 border-[#FF1E1E] pl-4 py-1">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-1">
            › tagline
          </div>
          <p className="text-sm md:text-base text-gendex-text">
            {tagline.output}
            {!tagline.done && <span className="gendex-cursor-blink" />}
          </p>
        </div>

        {/* Bio */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-2">
            › who is gendex?
          </div>
          <div className="space-y-3 text-sm md:text-[15px] leading-relaxed text-gendex-text">
            {PERSON.bio.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* The quote */}
        <div className="relative border border-[#FF1E1E]/30 bg-[#FF1E1E]/5 p-4 md:p-5">
          <div className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.3em] text-[#FF1E1E]">
            › favorite quote
          </div>
          <p className="text-lg md:text-2xl text-[#FF1E1E] gendex-text-glow-red font-bold tracking-wide mt-4">
            «&nbsp;{PERSON.quote}&nbsp;»
          </p>
        </div>

        {/* Personality traits */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-2">
            › personality
          </div>
          <div className="flex flex-wrap gap-2">
            {PERSON.traits.map((t) => (
              <span
                key={t}
                className="text-[11px] uppercase tracking-wider border border-gendex-border px-2.5 py-1 text-gendex-text hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-3">
            › languages
          </div>
          <div className="space-y-2">
            {PERSON.languages.map((l) => (
              <div key={l.name} className="flex items-center gap-3">
                <span className="w-20 text-xs text-gendex-text">{l.name}</span>
                <span className="w-16 text-[10px] uppercase tracking-widest text-gendex-text-dim">{l.level}</span>
                <div className="flex-1 h-1.5 bg-[#0c0c10] overflow-hidden border border-gendex-border">
                  <div
                    className="h-full"
                    style={{
                      width: `${l.proficiency}%`,
                      background: "linear-gradient(90deg, #FF1E1E, #7C3AED)",
                    }}
                  />
                </div>
                <span className="w-10 text-right text-[10px] tabular-nums text-gendex-text-dim">{l.proficiency}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inspirations */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-2">
            › inspirations
          </div>
          <div className="flex flex-wrap gap-2">
            {PERSON.inspirations.map((ins) => (
              <span
                key={ins}
                className="text-[11px] uppercase tracking-wider border border-[#7C3AED]/30 bg-[#7C3AED]/5 px-2.5 py-1 text-gendex-text"
              >
                {ins}
              </span>
            ))}
          </div>
        </div>
      </div>
    </PanelContainer>
  );
}

function Field({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border border-gendex-border p-2 bg-black/30">
      <div className="text-[9px] uppercase tracking-[0.3em] text-gendex-text-dim mb-1">› {label}</div>
      <div className={accent ? "text-[#FF1E1E] font-bold" : "text-gendex-text"}>{value}</div>
    </div>
  );
}
