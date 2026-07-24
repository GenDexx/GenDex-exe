"use client";

import { PanelContainer } from "./PanelContainer";
import { PROJECTS } from "../../data/content";

export function CreatorManagementPanel() {
  // Two projects: KOL Tracker + Creator Management Platform
  const projects = PROJECTS.filter((p) => p.id === "kol-tracker" || p.id === "creator-mgmt-platform");

  return (
    <PanelContainer
      panelId="creator-mgmt"
      title="Creator Management Suite"
      subtitle="Internal tools for managing international content creators"
      accent="purple"
    >
      <div className="space-y-6">
        <p className="text-sm md:text-[15px] leading-relaxed text-gendex-text">
          The Blood Strike MENA creator program spans multiple platforms and dozens of creators.
          Two purpose-built internal tools keep the operation running: a multi-platform
          KOL tracker that handles data ingestion and reporting, and a creator management
          platform that holds profiles, rankings, achievements and analytics in one place.
          Together they replaced what used to be a multi-hour weekly spreadsheet ritual.
        </p>

        {projects.map((project) => (
          <div key={project.id} className="border border-gendex-border p-4 md:p-5 bg-black/30">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h3 className="text-base md:text-lg font-bold text-[#7C3AED]">{project.name}</h3>
              {project.platforms && (
                <div className="flex flex-wrap gap-1.5">
                  {project.platforms.map((p) => (
                    <span key={p} className="text-[9px] uppercase tracking-widest border border-gendex-border px-1.5 py-0.5 text-gendex-text-dim">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gendex-text-dim mb-3">{project.tagline}</p>
            <p className="text-sm leading-relaxed text-gendex-text mb-4">{project.description}</p>

            {/* Stats */}
            {project.stats && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {project.stats.map((s) => (
                  <div key={s.label} className="border border-gendex-border p-2 text-center bg-[#0c0c10]">
                    <div className="text-base md:text-lg text-[#FF1E1E] font-bold tabular-nums">{s.value}</div>
                    <div className="text-[9px] uppercase tracking-widest text-gendex-text-dim mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {project.features.map((f) => (
                <div key={f.label} className="flex items-start gap-2 border border-gendex-border/50 p-2">
                  <span className="text-[#7C3AED] mt-0.5">›</span>
                  <div>
                    <div className="text-xs text-gendex-text font-medium">{f.label}</div>
                    <div className="text-[11px] text-gendex-text-dim leading-snug">{f.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PanelContainer>
  );
}
