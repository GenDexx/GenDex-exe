"use client";

import { PanelContainer } from "./PanelContainer";
import { EDUCATION, CERTIFICATIONS, TIMELINE } from "../../data/content";

export function EducationPanel() {
  return (
    <PanelContainer
      panelId="education"
      title="Education & Certifications"
      subtitle="Formal training + self-taught path"
      accent="red"
    >
      <div className="space-y-6">
        {/* Education */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-3">
            › education
          </div>
          <div className="space-y-3">
            {EDUCATION.map((e) => (
              <div key={e.title} className="border border-gendex-border p-4 bg-black/30">
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <h3 className="text-sm md:text-base font-bold text-gendex-text">{e.title}</h3>
                  <span
                    className={`text-[9px] uppercase tracking-widest px-2 py-0.5 border ${
                      e.status === "completed"
                        ? "border-[#22ff77]/40 text-[#22ff77]"
                        : "border-[#FF1E1E]/40 text-[#FF1E1E]"
                    }`}
                  >
                    {e.status === "completed" ? "completed" : "in-progress"}
                  </span>
                </div>
                <div className="text-xs text-[#7C3AED] mb-1">{e.institution}</div>
                <div className="text-[10px] text-gendex-text-dim mb-2">{e.period}</div>
                <p className="text-xs md:text-sm leading-relaxed text-gendex-text">{e.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-3">
            › certifications
          </div>
          <div className="grid grid-cols-1 gap-2">
            {CERTIFICATIONS.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between gap-3 border border-gendex-border p-3 bg-black/30"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#22ff77]">✓</span>
                  <span className="text-sm text-gendex-text">{c.name}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-gendex-text-dim">{c.year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Career timeline (compact) */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-3">
            › career timeline
          </div>
          <div className="relative pl-4 border-l border-[#FF1E1E]/30 space-y-4">
            {TIMELINE.map((t) => (
              <div key={t.year} className="relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[#FF1E1E] rounded-full gendex-pulse-red" />
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-base font-bold text-[#FF1E1E] tabular-nums">{t.year}</span>
                  <span className="text-sm text-gendex-text font-medium">{t.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-gendex-text-dim mb-1">{t.description}</p>
                {t.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {t.tags.map((tag) => (
                      <span key={tag} className="text-[9px] uppercase tracking-widest border border-gendex-border px-1.5 py-0.5 text-gendex-text-dim">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelContainer>
  );
}
