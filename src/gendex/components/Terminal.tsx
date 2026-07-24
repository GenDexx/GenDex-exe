"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSceneStore } from "../store/useSceneStore";
import { useAudio } from "../hooks/useAudio";
import { PERSON, PROJECTS, TIKTOK_INVESTIGATION_LOG } from "../data/content";

interface TerminalLine {
  type: "input" | "output" | "error" | "system";
  text: string;
}

const HELP_TEXT = `Available commands:
  whoami     — display user identity
  projects   — list known projects
  tiktok     — TikTok API investigation summary
  coffee     — brew a cup of coffee
  help       — show this help message
  clear      — clear the terminal
  exit       — close the terminal (also: ESC, ~)`;

const COFFEE_LINES = [
  "Brewing coffee...",
  "  ▓▓▓▓▓▓▓▓░░░░  60%",
  "  ▓▓▓▓▓▓▓▓▓▓▓▓ 100%",
  "Coffee ready. Mind clearing. Steam rising.",
  "[systems_builder@room ~]$ alertness +1",
];

const BANNER = `GENDEX.EXE terminal v1.2
Type 'help' for available commands.
Connection: local · user: gendex · room: 3AM`;

/**
 * Terminal overlay — toggled with the ~ key (backtick).
 * Supports 5 main commands + clear/exit. Output is appended to a scrollable
 * log. The prompt is styled to match the rest of the UI.
 */
export function Terminal() {
  const open = useSceneStore((s) => s.terminalOpen);
  const setOpen = useSceneStore((s) => s.setTerminalOpen);
  const { play } = useAudio();

  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", text: BANNER },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // ===== Toggle with ~ key =====
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "`" || e.code === "Backquote") {
        e.preventDefault();
        const next = !useSceneStore.getState().terminalOpen;
        setOpen(next);
        play(next ? "open" : "close");
      }
      if (e.key === "Escape" && useSceneStore.getState().terminalOpen) {
        setOpen(false);
        play("close");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen, play]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines]);

  const appendOutput = useCallback((out: TerminalLine[]) => {
    setLines((prev) => [...prev, ...out]);
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;

      // Echo the input
      const inputLine: TerminalLine = { type: "input", text: cmd };
      const output: TerminalLine[] = [];

      const [name, ...args] = cmd.split(/\s+/);
      switch (name.toLowerCase()) {
        case "whoami": {
          output.push(
            { type: "output", text: `name:      ${PERSON.fullName}` },
            { type: "output", text: `alias:     ${PERSON.nickname}` },
            { type: "output", text: `role:      ${PERSON.role}` },
            { type: "output", text: `employer:  ${PERSON.employer}` },
            { type: "output", text: `location:  ${PERSON.location}` },
            { type: "output", text: `age:       ${PERSON.age}` },
            { type: "output", text: `languages: ${PERSON.languages.map((l) => l.name).join(", ")}` },
            { type: "output", text: `` },
            { type: "output", text: `creed: "${PERSON.quote}"` }
          );
          break;
        }
        case "projects": {
          output.push({ type: "output", text: "Known projects:" });
          output.push({ type: "output", text: `` });
          PROJECTS.forEach((p, i) => {
            output.push({
              type: "output",
              text: `  [${i + 1}] ${p.name} — ${p.tagline}`,
            });
            if (p.platforms) {
              output.push({
                type: "output",
                text: `       platforms: ${p.platforms.join(", ")}`,
              });
            }
          });
          output.push({ type: "output", text: `` });
          output.push({ type: "output", text: "Discord bots: Music · Tournament · Creator Management" });
          break;
        }
        case "tiktok": {
          output.push({ type: "output", text: "tiktok_api_investigation.log" });
          output.push({ type: "output", text: `================================` });
          output.push({ type: "error", text: "ERROR: userInfo.user = {}" });
          output.push({ type: "output", text: `` });
          output.push({ type: "output", text: "Investigation Time: 40+ Hours" });
          output.push({ type: "output", text: "Endpoints Mapped: 30+" });
          output.push({ type: "output", text: "Anti-bot Signatures: X-Argus (VM-based JS)" });
          output.push({ type: "output", text: "Stable Extraction: verified × 5 creators" });
          output.push({ type: "output", text: "Replay Harness Determinism: 92%" });
          output.push({ type: "output", text: `` });
          output.push({ type: "output", text: "Last 5 log entries:" });
          TIKTOK_INVESTIGATION_LOG.slice(-5).forEach((l) => {
            output.push({ type: "output", text: `  [${l.timestamp}] ${l.event}` });
          });
          break;
        }
        case "coffee": {
          COFFEE_LINES.forEach((l) => {
            output.push({ type: "output", text: l });
          });
          break;
        }
        case "help": {
          HELP_TEXT.split("\n").forEach((l) => {
            output.push({ type: "output", text: l });
          });
          break;
        }
        case "clear": {
          setLines([]);
          return;
        }
        case "exit": {
          setOpen(false);
          play("close");
          return;
        }
        default: {
          output.push({
            type: "error",
            text: `command not found: ${name}`,
          });
          output.push({ type: "output", text: "type 'help' for available commands" });
        }
      }

      appendOutput([inputLine, ...output]);
    },
    [appendOutput, setOpen, play]
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    if (input.trim()) {
      setHistory((h) => [...h, input]);
    }
    setInput("");
    setHistoryIdx(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const idx = historyIdx + 1;
      if (idx >= history.length) {
        setHistoryIdx(-1);
        setInput("");
      } else {
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-3 md:p-6 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop (subtle, doesn't fully block view) */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => {
              setOpen(false);
              play("close");
            }}
          />

          {/* Terminal */}
          <motion.div
            className="relative w-full max-w-3xl h-[60vh] md:h-[55vh] gendex-panel gendex-corner-tl gendex-corner-tr gendex-corner-bl gendex-corner-br flex flex-col pointer-events-auto"
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between px-3 md:px-4 py-2 border-b border-[#FF1E1E]/20 bg-gradient-to-r from-[#FF1E1E]/5 to-transparent">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF1E1E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                <span className="w-2.5 h-2.5 rounded-full bg-gendex-text-dim" />
                <span className="ml-2 text-[10px] uppercase tracking-[0.3em] text-gendex-text-dim">
                  gendex@room: ~/investigations
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] uppercase tracking-widest text-[#7C3AED]">
                  ~ to toggle
                </span>
                <button
                  onClick={() => {
                    setOpen(false);
                    play("close");
                  }}
                  className="text-gendex-text-dim hover:text-[#FF1E1E] text-base leading-none"
                  aria-label="Close terminal"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Log */}
            <div
              className="flex-1 overflow-y-auto gendex-scrollbar p-3 md:p-4 font-mono text-[11px] md:text-xs"
              onClick={() => inputRef.current?.focus()}
            >
              {lines.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.type === "input"
                      ? "text-[#7C3AED]"
                      : l.type === "error"
                      ? "text-[#FF1E1E]"
                      : l.type === "system"
                      ? "text-gendex-text-dim"
                      : "text-[#9eff9e]"
                  }
                >
                  {l.type === "input" ? (
                    <>
                      <span className="text-[#FF1E1E]">gendex@room</span>
                      <span className="text-gendex-text-dim">:~$ </span>
                      {l.text}
                    </>
                  ) : (
                    l.text || "\u00A0"
                  )}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 px-3 md:px-4 py-2 border-t border-[#FF1E1E]/15 bg-black/40"
            >
              <span className="font-mono text-xs text-[#FF1E1E]">gendex@room</span>
              <span className="font-mono text-xs text-gendex-text-dim">:~$</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                spellCheck={false}
                className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-[#9eff9e] caret-[#9eff9e]"
                placeholder="type a command... (try 'help')"
              />
              <kbd className="hidden md:inline text-[9px] text-gendex-text-dim border border-gendex-border px-1.5 py-0.5">
                ↵
              </kbd>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
