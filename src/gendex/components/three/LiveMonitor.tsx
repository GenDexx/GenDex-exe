"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type MonitorContent = "tiktok" | "discord" | "creators";

interface LiveMonitorScreenProps {
  content: MonitorContent;
}

/**
 * A monitor screen that renders live animated content via CanvasTexture.
 *
 * Each content type draws its own UI (terminal log, status grid, stats panel)
 * to an offscreen 2D canvas, which is then used as the texture on the screen
 * plane. The canvas is redrawn every frame so animations (typing, blinking
 * cursor, scrolling values) stay smooth.
 */
export function LiveMonitorScreen({ content }: LiveMonitorScreenProps) {
  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    return document.createElement("canvas");
  }, []);

  const texture = useMemo(() => {
    if (!canvas) return null;
    canvas.width = 512;
    canvas.height = 320;
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [canvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  useFrame((state) => {
    if (!canvas || !texture) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const t = state.clock.elapsedTime;
    if (content === "tiktok") drawTikTok(ctx, t);
    else if (content === "discord") drawDiscord(ctx, t);
    else drawCreators(ctx, t);
    texture.needsUpdate = true;
  });

  if (!texture) return null;

  return (
    <mesh>
      <planeGeometry args={[0.78, 0.46]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// ===== TikTok Investigation Monitor =====
const TIKTOK_LOG = [
  "[00:00] session start. goal: enumerate endpoints.",
  "[01:42] /api/user/detail requires X-Argus signature.",
  "[03:11] device-id header flow captured.",
  "[05:30] X-Argus reverse-engineered (VM-based JS).",
  "[08:15] rate-limits: 30/60s soft, 100/60s hard.",
  "[12:40] /api/user/posts stable w/ cursor pagination.",
  "[18:22] anti-bot trigger: headless fingerprint.",
  "[22:05] mitigation: playwright + residential proxy.",
  "[27:30] 30+ endpoints documented in Notion.",
  "[31:18] stable extraction verified × 5 creators.",
  "[36:50] replay harness — determinism 92%.",
  "[41:02] final report compiled. session closed.",
];

function drawTikTok(ctx: CanvasRenderingContext2D, t: number) {
  const W = 512;
  const H = 320;

  // Background
  ctx.fillStyle = "#020203";
  ctx.fillRect(0, 0, W, H);

  // Scanline overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }

  // Top red header bar
  ctx.fillStyle = "#FF1E1E";
  ctx.fillRect(0, 0, W, 36);
  ctx.fillStyle = "#000000";
  ctx.font = "bold 16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillText("▶ TIKTOK_API_INVESTIGATION", 12, 18);
  // Live indicator
  ctx.fillStyle = "#000000";
  ctx.fillRect(W - 80, 8, 70, 20);
  ctx.fillStyle = "#FF1E1E";
  ctx.font = "bold 12px monospace";
  ctx.fillText("● LIVE", W - 70, 19);

  // ERROR block
  const errY = 56;
  ctx.fillStyle = "#FF1E1E";
  ctx.font = "bold 11px monospace";
  ctx.fillText("ERROR:", 12, errY);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px monospace";
  ctx.fillText("userInfo.user = {}", 70, errY);

  // Subtle red glow under error
  const pulse = 0.5 + 0.5 * Math.sin(t * 3);
  ctx.fillStyle = `rgba(255, 30, 30, ${0.05 + pulse * 0.05})`;
  ctx.fillRect(0, errY - 14, W, 28);

  // Investigation time
  const timeY = 90;
  ctx.fillStyle = "#7C3AED";
  ctx.font = "bold 11px monospace";
  ctx.fillText("INVESTIGATION_TIME:", 12, timeY);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px monospace";
  ctx.fillText("40+ Hours", 160, timeY);

  // Divider
  ctx.fillStyle = "rgba(255, 30, 30, 0.3)";
  ctx.fillRect(0, 108, W, 1);

  // Log header
  ctx.fillStyle = "#71717a";
  ctx.font = "10px monospace";
  ctx.fillText("› tail -f tiktok_investigation.log", 12, 124);

  // Scrolling log lines
  ctx.font = "10px monospace";
  ctx.fillStyle = "#9eff9e";
  const visibleLines = 11;
  const lineH = 14;
  const startY = 140;
  // Slowly cycle through log entries
  const totalLines = TIKTOK_LOG.length;
  const baseIdx = Math.floor(t * 0.4) % totalLines;
  for (let i = 0; i < visibleLines; i++) {
    const idx = (baseIdx + i) % totalLines;
    const line = TIKTOK_LOG[idx];
    const y = startY + i * lineH;
    if (i === visibleLines - 1) {
      // Last line: dim + cursor
      ctx.fillStyle = "#5a7a5a";
      ctx.fillText(line, 12, y);
      // Blinking cursor
      if (Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = "#9eff9e";
        const w = ctx.measureText(line).width;
        ctx.fillRect(12 + w + 2, y - 6, 7, 11);
      }
    } else {
      ctx.fillStyle = "#9eff9e";
      ctx.fillText(line, 12, y);
    }
  }

  // Bottom status bar
  ctx.fillStyle = "rgba(255, 30, 30, 0.15)";
  ctx.fillRect(0, H - 22, W, 22);
  ctx.fillStyle = "#FF1E1E";
  ctx.font = "bold 10px monospace";
  ctx.fillText("STATUS: INVESTIGATING", 12, H - 11);
  ctx.fillStyle = "#71717a";
  ctx.fillText(`frame ${Math.floor(t * 60)}`, W - 80, H - 11);
}

// ===== Discord Bots Monitor =====
const DISCORD_BOTS = [
  { name: "Music Bot", status: "ONLINE", latency: "32ms", color: "#5865F2" },
  { name: "Tournament Bot", status: "ONLINE", latency: "45ms", color: "#22ff77" },
  { name: "Creator Mgmt Bot", status: "ONLINE", latency: "28ms", color: "#7C3AED" },
];

function drawDiscord(ctx: CanvasRenderingContext2D, t: number) {
  const W = 512;
  const H = 320;

  // Background
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, W, H);

  // Header bar (Discord blurple)
  ctx.fillStyle = "#5865F2";
  ctx.fillRect(0, 0, W, 36);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillText("◆ DISCORD_BOTS_ONLINE", 12, 18);
  // Online count
  ctx.fillStyle = "#22ff77";
  ctx.font = "bold 12px monospace";
  ctx.fillText("3/3 ONLINE", W - 100, 19);

  // Subtle Discord logo dots
  for (let i = 0; i < 5; i++) {
    const x = 200 + i * 12 + Math.sin(t + i) * 2;
    const y = 18 + Math.cos(t * 1.5 + i) * 2;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + 0.3 * Math.sin(t * 2 + i)})`;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bot cards
  const cardY = 56;
  const cardH = 64;
  const cardGap = 12;
  DISCORD_BOTS.forEach((bot, i) => {
    const y = cardY + i * (cardH + cardGap);

    // Card background
    ctx.fillStyle = "#13131f";
    ctx.fillRect(8, y, W - 16, cardH);
    // Left accent stripe
    ctx.fillStyle = bot.color;
    ctx.fillRect(8, y, 4, cardH);

    // Bot avatar (circle)
    ctx.fillStyle = bot.color;
    ctx.beginPath();
    ctx.arc(40, y + cardH / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    // Avatar initials
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(bot.name[0], 40, y + cardH / 2 + 1);
    ctx.textAlign = "left";

    // Bot name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.fillText(bot.name, 72, y + 22);

    // Status
    const pulse = 0.7 + 0.3 * Math.sin(t * 3 + i);
    ctx.fillStyle = `rgba(34, 255, 119, ${pulse})`;
    ctx.beginPath();
    ctx.arc(75, y + 42, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#22ff77";
    ctx.font = "11px monospace";
    ctx.fillText(bot.status, 86, y + 44);

    // Latency (right side)
    ctx.fillStyle = "#71717a";
    ctx.font = "10px monospace";
    ctx.fillText("latency", W - 100, y + 22);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.fillText(bot.latency, W - 100, y + 44);
  });

  // Bottom bar with CPU/mem
  ctx.fillStyle = "rgba(88, 101, 242, 0.15)";
  ctx.fillRect(0, H - 22, W, 22);
  ctx.fillStyle = "#5865F2";
  ctx.font = "bold 10px monospace";
  ctx.fillText("SERVICE: bots.service  ·  uptime: 14d 6h", 12, H - 11);
}

// ===== Creator Management Statistics Monitor =====
function drawCreators(ctx: CanvasRenderingContext2D, t: number) {
  const W = 512;
  const H = 320;

  // Background
  ctx.fillStyle = "#0a0612";
  ctx.fillRect(0, 0, W, H);

  // Header (purple)
  ctx.fillStyle = "#7C3AED";
  ctx.fillRect(0, 0, W, 36);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px monospace";
  ctx.textBaseline = "middle";
  ctx.fillText("▲ CREATOR_MGMT_STATISTICS", 12, 18);
  ctx.fillStyle = "#000000";
  ctx.fillRect(W - 80, 8, 70, 20);
  ctx.fillStyle = "#7C3AED";
  ctx.font = "bold 12px monospace";
  ctx.fillText("WEEKLY", W - 70, 19);

  // KPI row (3 stat cards)
  const kpis = [
    { label: "CREATORS", value: "51", suffix: "+", color: "#FF1E1E" },
    { label: "VIEWS", value: "1.0", suffix: "M", color: "#7C3AED" },
    { label: "EMAILS", value: "1K", suffix: "+", color: "#22ff77" },
  ];
  const kpiY = 48;
  const kpiH = 56;
  const kpiW = (W - 24 - 16) / 3;
  kpis.forEach((k, i) => {
    const x = 8 + i * (kpiW + 8);
    ctx.fillStyle = "#13101a";
    ctx.fillRect(x, kpiY, kpiW, kpiH);
    // Top border accent
    ctx.fillStyle = k.color;
    ctx.fillRect(x, kpiY, kpiW, 2);

    ctx.fillStyle = "#71717a";
    ctx.font = "9px monospace";
    ctx.fillText(k.label, x + 8, kpiY + 16);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px monospace";
    const valStr = `${k.value}${k.suffix}`;
    ctx.fillText(valStr, x + 8, kpiY + 38);
  });

  // Bar chart: weekly views per platform
  const chartY = 122;
  const chartH = 130;
  ctx.fillStyle = "#71717a";
  ctx.font = "9px monospace";
  ctx.fillText("› VIEWS BY PLATFORM (last 7 days)", 12, chartY);

  // Y-axis gridlines
  ctx.strokeStyle = "rgba(124, 58, 237, 0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = chartY + 12 + (i * (chartH - 20)) / 3;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 12, y);
    ctx.stroke();
  }

  // Animated bar values (3 platforms × 7 days = 21 bars)
  const platforms = [
    { name: "TT", color: "#FF1E1E", base: 0.85 },
    { name: "YT", color: "#7C3AED", base: 0.65 },
    { name: "KK", color: "#22ff77", base: 0.40 },
  ];
  const days = 7;
  const chartLeft = 60;
  const chartRight = W - 12;
  const chartTop = chartY + 16;
  const chartBot = chartY + chartH - 8;
  const barGroupW = (chartRight - chartLeft) / days;
  const barW = (barGroupW - 4) / platforms.length;

  for (let d = 0; d < days; d++) {
    platforms.forEach((p, pi) => {
      // Per-day per-platform variation, animated subtly
      const variation = 0.5 + 0.5 * Math.sin(t * 0.5 + d * 0.7 + pi * 1.3);
      const v = p.base * (0.6 + 0.4 * variation);
      const h = v * (chartBot - chartTop);
      const x = chartLeft + d * barGroupW + 2 + pi * barW;
      const y = chartBot - h;
      ctx.fillStyle = p.color;
      ctx.fillRect(x, y, barW - 1, h);
      // Top highlight
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(x, y, barW - 1, 1);
    });
    // Day label
    ctx.fillStyle = "#71717a";
    ctx.font = "8px monospace";
    ctx.fillText(`d${d + 1}`, chartLeft + d * barGroupW + 8, chartBot + 10);
  }

  // Platform legend
  const legY = H - 28;
  platforms.forEach((p, i) => {
    const x = 60 + i * 100;
    ctx.fillStyle = p.color;
    ctx.fillRect(x, legY, 8, 8);
    ctx.fillStyle = "#d4d4d8";
    ctx.font = "9px monospace";
    ctx.fillText(
      p.name === "TT" ? "TikTok" : p.name === "YT" ? "YouTube" : "Kick",
      x + 12,
      legY + 7
    );
  });

  // Bottom bar
  ctx.fillStyle = "rgba(124, 58, 237, 0.15)";
  ctx.fillRect(0, H - 22, W, 22);
  ctx.fillStyle = "#7C3AED";
  ctx.font = "bold 10px monospace";
  ctx.fillText("REPORT: weekly.csv  ·  dispatched", 12, H - 11);
}
