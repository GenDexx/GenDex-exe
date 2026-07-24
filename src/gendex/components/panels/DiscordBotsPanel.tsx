"use client";

import { PanelContainer } from "./PanelContainer";
import { DISCORD_BOTS } from "../../data/content";

export function DiscordBotsPanel() {
  return (
    <PanelContainer
      panelId="discord-bots"
      title="Discord Bots"
      subtitle="Three production bots powering community operations"
      accent="purple"
    >
      <div className="space-y-5">
        <p className="text-sm md:text-[15px] leading-relaxed text-gendex-text">
          Three Discord bots keep the Blood Strike MENA community running 24/7.
          Each one is a self-contained Node.js service built on Discord.js,
          with its own persistence layer, scheduled jobs, and slash-command
          surface. They're not toys — they ship to production and handle real
          creator workflows.
        </p>

        {DISCORD_BOTS.map((bot) => (
          <div key={bot.name} className="border border-gendex-border p-4 md:p-5 bg-black/30">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="text-base md:text-lg font-bold text-[#7C3AED]">{bot.name}</h3>
              <span className="text-[10px] uppercase tracking-widest text-gendex-text-dim">
                {bot.stack.join(" · ")}
              </span>
            </div>
            <p className="text-sm text-gendex-text-dim mb-3">{bot.purpose}</p>

            <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-2">
              › features
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {bot.features.map((f) => (
                <div key={f} className="flex items-start gap-2 border border-gendex-border/50 p-2">
                  <span className="text-[#FF1E1E] mt-0.5">›</span>
                  <span className="text-xs text-gendex-text">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {bot.stack.map((s) => (
                <span key={s} className="text-[9px] uppercase tracking-widest border border-[#FF1E1E]/30 bg-[#FF1E1E]/5 px-1.5 py-0.5 text-[#FF1E1E]">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PanelContainer>
  );
}
