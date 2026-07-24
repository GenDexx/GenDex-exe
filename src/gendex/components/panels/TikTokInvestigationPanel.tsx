"use client";

import { useEffect, useRef, useState } from "react";
import { PanelContainer } from "./PanelContainer";
import { TIKTOK_INVESTIGATION_LOG, PROJECTS } from "../../data/content";
import { useTypewriter } from "../../hooks/useTypewriter";

export function TikTokInvestigationPanel() {
  const project = PROJECTS.find((p) => p.id === "tiktok-investigation")!;
  const header = useTypewriter({
    text: "tail -f tiktok_investigation.log",
    speed: 28,
    startDelay: 100,
    enabled: true,
  });

  // Stream logs into the terminal one by one
  const [visibleCount, setVisibleCount] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!header.done) return;
    if (visibleCount >= TIKTOK_INVESTIGATION_LOG.length) return;
    const t = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, 380);
    return () => clearTimeout(t);
  }, [header.done, visibleCount]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleCount]);

  const allDone = visibleCount >= TIKTOK_INVESTIGATION_LOG.length;

  return (
    <PanelContainer
      panelId="tiktok"
      title="TikTok API Investigation"
      subtitle="40+ hours of reverse engineering"
      accent="red"
    >
      <div className="space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          {project.stats?.map((s) => (
            <div key={s.label} className="border border-gendex-border p-3 text-center bg-[#0c0c10]">
              <div className="text-xl md:text-2xl text-[#FF1E1E] font-bold tabular-nums gendex-text-glow-red">{s.value}</div>
              <div className="text-[9px] uppercase tracking-widest text-gendex-text-dim mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-gendex-text">{project.description}</p>

        {/* Terminal */}
        <div className="border border-[#FF1E1E]/30 bg-[#020203] gendex-scanline">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#FF1E1E]/15">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF1E1E]" />
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
              <span className="w-2 h-2 rounded-full bg-gendex-text-dim" />
              <span className="ml-2 text-[10px] uppercase tracking-widest text-gendex-text-dim">
                gendex@investigation:~$
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-gendex-text-dim">session: 41h</span>
          </div>
          {/* Terminal body */}
          <div className="p-3 md:p-4 font-mono text-[11px] md:text-xs min-h-[280px] max-h-[320px] overflow-y-auto gendex-scrollbar">
            <div className="text-[#7C3AED] mb-2">
              {header.output}
              {!header.done && <span className="gendex-cursor-blink" />}
            </div>
            <div className="space-y-1">
              {TIKTOK_INVESTIGATION_LOG.slice(0, visibleCount).map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-gendex-text-dim shrink-0">[{l.timestamp}]</span>
                  <span className="text-[#9eff9e]">{l.event}</span>
                </div>
              ))}
              {!allDone && header.done && (
                <div className="text-[#FF1E1E]">
                  <span className="gendex-cursor-blink" />
                </div>
              )}
              {allDone && (
                <div className="mt-2 pt-2 border-t border-[#FF1E1E]/15 text-[#FF1E1E]">
                  [END OF LOG] — investigation archived to internal report.
                </div>
              )}
            </div>
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Findings */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-2">
            › key findings
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {project.features.map((f) => (
              <div key={f.label} className="border border-gendex-border/60 p-3 bg-black/30">
                <div className="text-xs text-[#FF1E1E] font-medium mb-1">› {f.label}</div>
                <div className="text-[11px] text-gendex-text-dim leading-snug">{f.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PanelContainer>
  );
}
