"use client";

import { useEffect, useState } from "react";
import { PanelContainer } from "./PanelContainer";
import { FUTURE } from "../../data/content";
import { useTypewriter } from "../../hooks/useTypewriter";

export function FutureGoalsPanel() {
  // Stagger the three reveal strings
  const [step, setStep] = useState(0);

  const first = useTypewriter({ text: FUTURE.short, speed: 70, startDelay: 200, enabled: step >= 0 });
  const second = useTypewriter({ text: FUTURE.middle, speed: 55, startDelay: 200, enabled: step >= 1 });
  const third = useTypewriter({ text: FUTURE.long, speed: 38, startDelay: 200, enabled: step >= 2 });

  useEffect(() => {
    if (step === 0 && first.done) {
      const t = setTimeout(() => setStep(1), 400);
      return () => clearTimeout(t);
    }
    if (step === 1 && second.done) {
      const t = setTimeout(() => setStep(2), 400);
      return () => clearTimeout(t);
    }
  }, [step, first.done, second.done]);

  return (
    <PanelContainer
      panelId="future"
      title="Future Goals"
      subtitle="The story is still being written"
      accent="red"
    >
      <div className="space-y-8">
        {/* Staggered typewriter quotes */}
        <div className="space-y-6">
          <RevealQuote
            label="01 / status"
            text={first.output}
            cursor={!first.done}
            color="#7C3AED"
            big
          />
          {step >= 1 && (
            <RevealQuote
              label="02 / creed"
              text={second.output}
              cursor={!second.done}
              color="#FF1E1E"
              big
            />
          )}
          {step >= 2 && (
            <RevealQuote
              label="03 / story"
              text={third.output}
              cursor={!third.done}
              color="#d4d4d8"
            />
          )}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#FF1E1E]/50 to-transparent" />

        {/* Concrete goals */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-3">
            › next chapter
          </div>
          <div className="space-y-2">
            {FUTURE.goals.map((g, i) => (
              <div key={i} className="flex items-start gap-3 border border-gendex-border p-3 bg-black/30">
                <span className="text-[#FF1E1E] font-mono text-xs mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-gendex-text">{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Closing line */}
        <div className="border border-[#FF1E1E]/30 bg-[#FF1E1E]/5 p-4 text-center">
          <p className="text-base md:text-lg text-[#FF1E1E] gendex-text-glow-red font-bold tracking-wide">
            «&nbsp;{FUTURE.short}&nbsp;»
          </p>
        </div>
      </div>
    </PanelContainer>
  );
}

function RevealQuote({
  label,
  text,
  cursor,
  color,
  big = false,
}: {
  label: string;
  text: string;
  cursor: boolean;
  color: string;
  big?: boolean;
}) {
  return (
    <div className="border-l-2 pl-4" style={{ borderColor: color }}>
      <div className="text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim mb-1">{label}</div>
      <p
        className={big ? "text-xl md:text-2xl font-bold tracking-wide" : "text-sm md:text-base tracking-wide"}
        style={{ color, textShadow: `0 0 12px ${color}55` }}
      >
        {text}
        {cursor && <span className="gendex-cursor-blink" />}
      </p>
    </div>
  );
}
