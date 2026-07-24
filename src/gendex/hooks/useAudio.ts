"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSceneStore } from "../store/useSceneStore";

type SoundName = "click" | "hover" | "open" | "close" | "enter" | "key" | "error" | "keystroke" | "thunder";

interface AudioCtxBundle {
  ctx: AudioContext;
  master: GainNode;
  rainSource: AudioBufferSourceNode | null;
  rainGain: GainNode | null;
  humGain: GainNode | null;
  typingTimer: ReturnType<typeof setInterval> | null;
  fanGain: GainNode | null;
  thunderTimer: ReturnType<typeof setTimeout> | null;
}

let bundle: AudioCtxBundle | null = null;

function ensureCtx(): AudioCtxBundle | null {
  if (typeof window === "undefined") return null;
  if (bundle) return bundle;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);

    bundle = {
      ctx,
      master,
      rainSource: null,
      rainGain: null,
      humGain: null,
      typingTimer: null,
      fanGain: null,
      thunderTimer: null,
    };
    return bundle;
  } catch {
    return null;
  }
}

// === Generators ===

function makeRainBuffer(ctx: AudioContext, durationSec = 4): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * durationSec;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  // White noise base
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    // low-pass-ish smoothing for "rain on window" character
    last = 0.97 * last + 0.03 * white;
    data[i] = last * 0.7;
  }

  // Sprinkle higher-frequency drops
  for (let i = 0; i < length; i += Math.floor(sampleRate * 0.002)) {
    if (Math.random() < 0.02) {
      const drop = Math.random() * 2 - 1;
      for (let j = 0; j < 20; j++) {
        if (i + j < length) data[i + j] += drop * (1 - j / 20) * 0.4;
      }
    }
  }
  return buffer;
}

function startRain(b: AudioCtxBundle) {
  if (b.rainSource) return;
  const buf = makeRainBuffer(b.ctx);
  const src = b.ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = b.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2200;
  filter.Q.value = 0.4;
  const gain = b.ctx.createGain();
  gain.gain.value = 0.0;
  src.connect(filter).connect(gain).connect(b.master);
  src.start();
  b.rainSource = src;
  b.rainGain = gain;
  // Fade in
  const now = b.ctx.currentTime;
  gain.gain.linearRampToValueAtTime(0.18, now + 2.5);
}

function stopRain(b: AudioCtxBundle) {
  if (!b.rainSource || !b.rainGain) return;
  const now = b.ctx.currentTime;
  b.rainGain.gain.cancelScheduledValues(now);
  b.rainGain.gain.setValueAtTime(b.rainGain.gain.value, now);
  b.rainGain.gain.linearRampToValueAtTime(0, now + 1.0);
  const src = b.rainSource;
  setTimeout(() => {
    try { src.stop(); } catch { /* noop */ }
  }, 1200);
  b.rainSource = null;
  b.rainGain = null;
}

function startHum(b: AudioCtxBundle) {
  if (b.humGain) return;
  const osc1 = b.ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = 60; // mains hum
  const osc2 = b.ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = 120;
  const gain = b.ctx.createGain();
  gain.gain.value = 0;
  const gain2 = b.ctx.createGain();
  gain2.gain.value = 0.25;
  osc1.connect(gain2).connect(gain).connect(b.master);
  osc2.connect(gain);
  osc1.start();
  osc2.start();
  const now = b.ctx.currentTime;
  gain.gain.linearRampToValueAtTime(0.04, now + 3);
  b.humGain = gain;
}

function stopHum(b: AudioCtxBundle) {
  if (!b.humGain) return;
  const now = b.ctx.currentTime;
  b.humGain.gain.cancelScheduledValues(now);
  b.humGain.gain.setValueAtTime(b.humGain.gain.value, now);
  b.humGain.gain.linearRampToValueAtTime(0, now + 1.0);
  b.humGain = null;
}

/**
 * Start an ambient "someone is typing on a mechanical keyboard" loop.
 * Uses random intervals (1.2–3.5s) and slight pitch variation per keystroke
 * so it never feels repetitive.
 */
function startTypingAmbience(b: AudioCtxBundle) {
  if (b.typingTimer) return;
  const tick = () => {
    playUiSound("keystroke");
    // Schedule next tick at a random interval
    const next = 1200 + Math.random() * 2300;
    b.typingTimer = setTimeout(tick, next);
  };
  // First tick after a short delay
  b.typingTimer = setTimeout(tick, 1500 + Math.random() * 2000);
}

function stopTypingAmbience(b: AudioCtxBundle) {
  if (b.typingTimer) {
    clearTimeout(b.typingTimer);
    b.typingTimer = null;
  }
}

/**
 * PC fan noise — a low-frequency rumble (brown noise through a lowpass filter).
 * Very subtle, gives the room a "PC is running" feel.
 */
function startFanNoise(b: AudioCtxBundle) {
  if (b.fanGain) return;
  const sampleRate = b.ctx.sampleRate;
  const length = sampleRate * 4;
  const buffer = b.ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    // Brown noise integration
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }
  const src = b.ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = b.ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 180;
  filter.Q.value = 0.5;
  const gain = b.ctx.createGain();
  gain.gain.value = 0;
  src.connect(filter).connect(gain).connect(b.master);
  src.start();
  const now = b.ctx.currentTime;
  gain.gain.linearRampToValueAtTime(0.025, now + 3);
  b.fanGain = gain;
}

function stopFanNoise(b: AudioCtxBundle) {
  if (!b.fanGain) return;
  const now = b.ctx.currentTime;
  b.fanGain.gain.cancelScheduledValues(now);
  b.fanGain.gain.setValueAtTime(b.fanGain.gain.value, now);
  b.fanGain.gain.linearRampToValueAtTime(0, now + 1.0);
  b.fanGain = null;
}

/**
 * Distant thunder — scheduled at random intervals (30-60s).
 * Each thunder is a low-frequency rumble with a slow attack and long decay.
 */
function playThunderRumble(b: AudioCtxBundle) {
  const ctx = b.ctx;
  const now = ctx.currentTime;

  // Brown noise buffer for the rumble
  const length = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 120;
  filter.Q.value = 0.3;

  const gain = ctx.createGain();
  // Slow attack + long decay = distant thunder
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

  src.connect(filter).connect(gain).connect(b.master);
  src.start(now);
  src.stop(now + 4);
}

function startThunderAmbience(b: AudioCtxBundle) {
  if (b.thunderTimer) return;
  const scheduleNext = () => {
    // Random interval 30-60 seconds
    const delay = 30000 + Math.random() * 30000;
    b.thunderTimer = setTimeout(() => {
      playThunderRumble(b);
      scheduleNext();
    }, delay);
  };
  // First thunder after 15-30 seconds
  b.thunderTimer = setTimeout(() => {
    playThunderRumble(b);
    scheduleNext();
  }, 15000 + Math.random() * 15000);
}

function stopThunderAmbience(b: AudioCtxBundle) {
  if (b.thunderTimer) {
    clearTimeout(b.thunderTimer);
    b.thunderTimer = null;
  }
}

/**
 * Play a thunder sound on demand (called by the Lightning component when
 * a visual lightning flash occurs).
 */
function playThunderOnDemand() {
  const b = ensureCtx();
  if (!b) return;
  playThunderRumble(b);
}

function playUiSound(name: SoundName) {
  const b = ensureCtx();
  if (!b) return;
  const ctx = b.ctx;
  const now = ctx.currentTime;

  const cfg: Record<SoundName, { freq: number; type: OscillatorType; gain: number; dur: number; sweep?: number }> = {
    click:  { freq: 660, type: "square",   gain: 0.06, dur: 0.05 },
    hover:  { freq: 880, type: "sine",     gain: 0.025, dur: 0.04 },
    open:   { freq: 220, type: "sawtooth", gain: 0.05, dur: 0.18, sweep: 660 },
    close:  { freq: 660, type: "sawtooth", gain: 0.05, dur: 0.18, sweep: 220 },
    enter:  { freq: 110, type: "sawtooth", gain: 0.08, dur: 0.6, sweep: 440 },
    key:    { freq: 1200, type: "square",  gain: 0.018, dur: 0.02 },
    error:  { freq: 140, type: "square",   gain: 0.06, dur: 0.2 },
    keystroke: { freq: 1800 + Math.random() * 600, type: "square", gain: 0.012, dur: 0.015 },
  };

  const c = cfg[name];
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = c.type;
  osc.frequency.setValueAtTime(c.freq, now);
  if (c.sweep) osc.frequency.exponentialRampToValueAtTime(c.sweep, now + c.dur);
  gain.gain.setValueAtTime(c.gain, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + c.dur);
  osc.connect(gain).connect(b.master);
  osc.start(now);
  osc.stop(now + c.dur + 0.02);
}

// === Hook ===

export function useAudio() {
  const audioEnabled = useSceneStore((s) => s.audioEnabled);
  const setAudioEnabled = useSceneStore((s) => s.setAudioEnabled);
  const phase = useSceneStore((s) => s.phase);
  const booted = useSceneStore((s) => s.booted);

  // Whenever audio toggles on/off, (re)sync ambience state
  useEffect(() => {
    const b = ensureCtx();
    if (!b) return;
    if (b.ctx.state === "suspended") {
      b.ctx.resume().catch(() => { /* noop */ });
    }
    if (audioEnabled) {
      startRain(b);
      if (booted) {
        startHum(b);
        startTypingAmbience(b);
        startFanNoise(b);
        startThunderAmbience(b);
      }
    } else {
      stopRain(b);
      stopHum(b);
      stopTypingAmbience(b);
      stopFanNoise(b);
      stopThunderAmbience(b);
    }
  }, [audioEnabled, booted]);

  // Start hum + typing + fan + thunder after boot
  useEffect(() => {
    if (!booted || !audioEnabled) return;
    const b = ensureCtx();
    if (!b) return;
    startHum(b);
    startTypingAmbience(b);
    startFanNoise(b);
    startThunderAmbience(b);
  }, [booted, audioEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const b = bundle;
      if (!b) return;
      stopRain(b);
      stopHum(b);
      stopTypingAmbience(b);
      stopFanNoise(b);
      stopThunderAmbience(b);
      try { b.ctx.close(); } catch { /* noop */ }
      bundle = null;
    };
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (!audioEnabled) return;
      playUiSound(name);
    },
    [audioEnabled]
  );

  const toggle = useCallback(() => {
    setAudioEnabled(!audioEnabled);
  }, [audioEnabled, setAudioEnabled]);

  const enable = useCallback(() => {
    setAudioEnabled(true);
  }, [setAudioEnabled]);

  return { play, toggle, enable, enabled: audioEnabled, phase };
}

/**
 * Exported function so the Lightning component can trigger thunder sounds
 * in sync with visual flashes.
 */
export function triggerThunder() {
  playThunderOnDemand();
}
