"use client";

import { PanelContainer } from "./PanelContainer";
import { CONTACT, PERSON } from "../../data/content";

export function ContactPanel() {
  return (
    <PanelContainer
      panelId="contact"
      title="Contact"
      subtitle={CONTACT.availability}
      accent="red"
    >
      <div className="space-y-6">
        {/* Identity strip */}
        <div className="flex items-center gap-4 border border-gendex-border p-4 bg-black/30">
          <div className="w-14 h-14 md:w-16 md:h-16 border-2 border-[#FF1E1E] flex items-center justify-center text-2xl md:text-3xl font-bold text-[#FF1E1E] gendex-text-glow-red">
            AH
          </div>
          <div>
            <div className="text-base md:text-lg font-bold text-gendex-text">{PERSON.fullName}</div>
            <div className="text-xs text-[#7C3AED]">@{PERSON.nickname}</div>
            <div className="text-[11px] text-gendex-text-dim mt-1">{PERSON.role}</div>
          </div>
        </div>

        {/* Channels */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-3">
            › channels
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {CONTACT.channels.map((c) => {
              const isEmail = c.href.startsWith("mailto:");
              const isLink = c.href !== "#";
              return (
                <a
                  key={c.label}
                  href={isLink ? c.href : undefined}
                  className={`flex items-center justify-between gap-3 border border-gendex-border p-3 bg-black/30 transition-colors ${
                    isLink ? "hover:border-[#FF1E1E] hover:bg-[#FF1E1E]/5 cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-1">
                      › {c.label}
                    </div>
                    <div className={`text-sm ${isEmail ? "text-[#FF1E1E]" : "text-gendex-text"}`}>
                      {c.value}
                    </div>
                  </div>
                  {isLink && (
                    <span className="text-gendex-text-dim group-hover:text-[#FF1E1E]">↗</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Availability */}
        <div className="border border-[#7C3AED]/30 bg-[#7C3AED]/5 p-4">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#7C3AED] mb-1">
            › availability
          </div>
          <p className="text-sm text-gendex-text leading-relaxed">{CONTACT.availability}</p>
        </div>

        {/* Closing quote */}
        <div className="text-center pt-2">
          <p className="text-base md:text-lg text-[#FF1E1E] gendex-text-glow-red font-bold italic">
            «&nbsp;{PERSON.quote}&nbsp;»
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mt-2">
            — {PERSON.nickname}, {PERSON.location}
          </p>
        </div>
      </div>
    </PanelContainer>
  );
}
