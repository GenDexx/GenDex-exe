# GENDEX.EXE v1.2 — Cinematic Three.js Portfolio

> Step into the mind of a systems builder working at 3:00 AM.

A cinematic, interactive Three.js portfolio for **Abderrahmane Hadjadj (GenDex)** — a 22-year-old systems builder from Médéa, Algeria. The experience drops you into a dark room illuminated by red and purple LEDs, with rain falling outside the window, three monitors running live animated content, a server rack, a whiteboard, a desk with a coffee mug, and a mechanical keyboard.

> "I don't like black boxes."

---

## What's New in v1.2 — Deployment & Compatibility

This release focuses on **cross-platform compatibility** and **mobile experience**. Tested successfully on Windows 11 with Node.js + npm.

| Issue | Fix |
|---|---|
| **Linux-only commands** (`cp`, `tee`) | Replaced with standard `next dev` / `next build` / `next start` — works on Windows, Linux, and macOS |
| **Bun dependency** | Removed. Project now runs on standard Node.js + npm only |
| **Pointer Lock SecurityError** | Added 1-second cooldown after ESC before re-locking. Pointer lock only acquired after explicit click. Disabled entirely on mobile |
| **Mobile support** | New `MobileControls` component: swipe to orbit, tap to interact, guided auto-rotate when idle. No pointer lock on touch devices |
| **Monitor content** | All 3 monitors show live animated CanvasTexture content (TikTok ERROR + 40h, Discord bots online, Creator stats chart) |
| **[E] interaction prompts** | Floating 3D labels above Whiteboard, TikTok monitor, and Creator monitor: "[E] Open Whiteboard", "[E] Open TikTok Investigation", "[E] Open Creator Platform" |
| **Performance** | 60 FPS desktop, 30+ FPS mobile, <300k polys, instanced rendering, lazy loading, mobile skips post-processing |

---

## Quickstart (Standard Node.js + npm)

### Prerequisites

- **Node.js 18+** (tested on Node 20 and 22)
- **npm 10+** (comes with Node.js)
- A modern browser with WebGL2 support

> **No Bun required.** This project uses standard npm scripts that work identically on Windows, Linux, and macOS.

### Install & run

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev
```

Open <http://localhost:3000> in your browser.

### Production build

```bash
npm run build
npm run start
```

### Available scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev -p 3000` | Start dev server on port 3000 |
| `npm run build` | `next build` | Production build |
| `npm run start` | `next start` | Start production server |
| `npm run lint` | `eslint .` | Run ESLint |

> All scripts are **cross-platform** — no `cp`, `tee`, or platform-specific shell commands.

---

## Controls

### Desktop

| Action | Key |
|---|---|
| Walk | **W** **A** **S** **D** |
| Sprint | **Shift** (hold) |
| Look around | **Mouse** (click to lock pointer) |
| Release cursor | **ESC** (1-second cooldown before re-lock) |
| Interact with focused object | **E** (look at object, press E) |
| Open / close terminal | **~** (tilde key) |
| Close panel | **ESC** |
| Toggle audio | Click "AUDIO ON/OFF" button (bottom-left) |

### Mobile

| Action | Gesture |
|---|---|
| Look around | **Swipe** (one finger drag to orbit camera) |
| Zoom | **Pinch** (two fingers) |
| Interact with object | **Tap** the object directly |
| Navigate | **HUD buttons** (bottom-right module grid + bottom-left terminal/stats) |
| Guided camera | **Auto-rotates** after 5 seconds of inactivity for a cinematic feel |

> Mobile disables Pointer Lock entirely (it's unreliable on touch devices). Instead, the camera orbits around the room center using touch controls, with a gentle auto-rotation when idle.

---

## Terminal Commands

Open the terminal with the **~** key (desktop) or the **~ TERMINAL** button (mobile, bottom-left).

| Command | Output |
|---|---|
| `whoami` | Full identity: name, alias, role, employer, location, languages, creed |
| `projects` | Lists all known projects (KOL Tracker, Creator Mgmt Platform, TikTok Investigation) |
| `tiktok` | TikTok API investigation summary: `ERROR: userInfo.user = {}`, 40+ hours, last 5 log entries |
| `coffee` | Easter egg: brewing animation with progress bar, "alertness +1" |
| `help` | Lists all available commands |
| `clear` | Clears the terminal |
| `exit` | Closes the terminal (also: **ESC**, **~**) |

---

## Live Monitor Content

All 3 monitors render **real animated content** via `CanvasTexture` (redrawn every frame):

### Center Monitor — TikTok API Investigation
- Red header bar with "● LIVE" indicator
- **`ERROR: userInfo.user = {}`** in red
- **`INVESTIGATION_TIME: 40+ Hours`** in purple
- Scrolling log of 12 investigation entries with blinking cursor

### Left Monitor — Discord Bots Online
- Discord-blurple header with "3/3 ONLINE"
- 3 bot cards (Music Bot, Tournament Bot, Creator Mgmt Bot) with avatars, pulsing green status dots, latency
- Bottom: `SERVICE: bots.service · uptime: 14d 6h`

### Right Monitor — Creator Statistics
- Purple header with "WEEKLY" badge
- 3 KPI cards (Creators 51+, Views 1.0M, Emails 1K+)
- Animated 7-day bar chart with 3 platforms (TikTok red, YouTube purple, Kick green)
- Platform legend + bottom report status

---

## [E] Interaction Prompts

Floating 3D labels (visible when not in first-person mode) appear above key interactive objects:

- **Whiteboard**: `[E] Open Whiteboard`
- **Center Monitor**: `[E] Open TikTok Investigation`
- **Right Monitor**: `[E] Open Creator Platform`
- **Left Monitor**: `[E] Open Discord Bots`

On desktop, labels hide when pointer is locked (first-person mode) — the crosshair + HUD "Press E" prompt takes over. On mobile, labels are always visible to help identify tappable objects.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript 5** |
| 3D Engine | **Three.js** + **React Three Fiber** + **Drei** |
| Post-processing | **@react-three/postprocessing** (Bloom, Vignette, Noise) |
| Animation | **GSAP** (camera transitions) + **Framer Motion** (UI) |
| State | **Zustand** |
| Styling | **Tailwind CSS 4** + custom GenDex design tokens |
| Audio | **Web Audio API** (synthesized — no asset files) |

---

## Project Structure

```
src/
├── app/                              # Next.js App Router entry points
│   ├── layout.tsx                    # Root layout (fonts, metadata, dark theme)
│   ├── page.tsx                      # Home route → renders <GenDexApp />
│   └── globals.css                   # Tailwind + GenDex design tokens
│
├── gendex/                           # The whole portfolio lives here
│   ├── data/
│   │   ├── types.ts                  # TypeScript types
│   │   └── content.ts                # ALL portfolio content
│   │
│   ├── lib/
│   │   └── interactiveRegistry.ts    # Registry for E-key / tap interactions
│   │
│   ├── store/
│   │   └── useSceneStore.ts          # Zustand store
│   │
│   ├── hooks/
│   │   ├── useTypewriter.ts          # Typewriter animations
│   │   ├── useCountUp.ts             # Animated counter
│   │   └── useAudio.ts               # Web Audio: rain, hum, typing, UI
│   │
│   └── components/
│       ├── GenDexApp.tsx             # Top-level orchestrator
│       ├── LoadingScreen.tsx         # "Initializing GENDEX.EXE..."
│       ├── HUD.tsx                   # Crosshair, E-hint, prompts, module grid
│       ├── Terminal.tsx              # ~-key terminal with 5+ commands
│       ├── StatsButton.tsx           # Statistics trigger
│       │
│       ├── three/                    # All 3D scene components
│       │   ├── GenDexScene.tsx       # <Canvas> + mobile fallback
│       │   ├── Room.tsx              # Floor, walls, ceiling, LED trims
│       │   ├── Desk.tsx              # Desk + 3 LiveMonitors + keyboard + mug
│       │   ├── LiveMonitor.tsx       # CanvasTexture live animated screens
│       │   ├── Whiteboard.tsx        # Right-wall whiteboard
│       │   ├── ServerRack.tsx        # Left-wall rack with blinking LEDs
│       │   ├── Window.tsx            # Back-wall window with rain
│       │   ├── Door.tsx              # Right-wall door with EXIT underlight
│       │   ├── WallTimeline.tsx      # Career timeline 2020→2026
│       │   ├── CertificationShelf.tsx # 3 cert plaques
│       │   ├── Rain.tsx              # Line-segment rain particles
│       │   ├── ExteriorRain.tsx      # Rain outside the room
│       │   ├── Dust.tsx              # Drifting dust motes
│       │   ├── LEDLights.tsx         # Red + purple LED strips
│       │   ├── EPromptLabel.tsx      # v1.2: Floating [E] labels
│       │   ├── InteractiveObject.tsx # E-key registry wrapper
│       │   ├── PlayerControls.tsx    # v1.2: Desktop first-person (WASD + cooldown)
│       │   ├── MobileControls.tsx    # v1.2: Mobile orbit + tap + guided
│       │   └── CameraController.tsx  # Intro sequence
│       │
│       └── panels/                   # HTML overlay panels
│           ├── PanelContainer.tsx
│           ├── AboutMePanel.tsx      # Whiteboard
│           ├── CreatorManagementPanel.tsx  # Right Monitor
│           ├── TikTokInvestigationPanel.tsx # Center Monitor
│           ├── DiscordBotsPanel.tsx  # Left Monitor
│           ├── EducationPanel.tsx    # Desk
│           ├── TechnicalSkillsPanel.tsx # Server Rack
│           ├── FutureGoalsPanel.tsx  # Window
│           ├── ContactPanel.tsx      # Door
│           └── StatisticsPanel.tsx   # HUD-triggered
```

---

## Camera Intro Sequence

1. **Loading screen**: `Initializing GENDEX.EXE...` → loading lines → progress bar → `PRESS ENTER`
2. **Boot sequence**: 8 boot-log lines reveal one-by-one
3. **Fade to black**: overlay covers the screen
4. **Rain audio starts**: synthesized rain begins playing
5. **Camera enters room slowly**: GSAP flies camera from outside into the desk area (3.5s)
6. **Focus on center monitor**: holds on the TikTok monitor for 1.2s — `ERROR: userInfo.user = {}` visible
7. **Pull back to player position**: 1.5s
8. **Controls enabled**:
   - Desktop: "CLICK TO LOOK AROUND" prompt appears
   - Mobile: "SWIPE TO LOOK · TAP OBJECTS · ~ TERMINAL" prompt appears

---

## Performance

### 60 FPS desktop / 30+ FPS mobile

- **Low-poly geometry** — the whole scene uses simple boxes / cylinders / planes (~5k polygons total, well under 300k)
- **Instanced rendering** — keyboard keys (70 instances) use a single draw call via Drei `<Instances>`
- **Single particle systems** — rain (1500 line segments) and dust (220 points) each use one `BufferGeometry` updated in-place
- **Adaptive DPR** — `AdaptiveDpr` + `AdaptiveEvents` reduce render resolution during camera moves

### Mobile fallback mode

Auto-detected via user agent + screen width + touch capability. When active:
- `dpr={1}` (instead of `[1, 2]`)
- No antialiasing
- **No post-processing** (Bloom / Vignette / Noise all skipped)
- Reduced particle counts: rain 1500→600, dust 220→80
- **No pointer lock** — uses OrbitControls with touch gestures instead
- **Guided camera** — auto-rotates after 5s of inactivity

### Lazy loading

- The 3D scene (`GenDexScene`) is loaded via `next/dynamic` with `ssr: false`
- The 3D scene only mounts after the loading screen completes
- Post-processing is conditionally rendered based on mobile detection

---

## Deployment

### Vercel (recommended)

1. Push this repo to GitHub.
2. Import it on <https://vercel.com> — Vercel auto-detects Next.js 16.
3. Deploy. Done.

> No special configuration needed. Vercel runs `npm run build` automatically.

### Self-host (Node.js)

```bash
npm install
npm run build
npm run start
```

The production server starts on port 3000 by default. Set `PORT` environment variable to change:

```bash
PORT=8080 npm run start
```

### GitHub Pages (static export)

The portfolio is fully client-side after the initial HTML shell. To deploy as a static site on GitHub Pages:

1. Edit `next.config.ts` — add `output: "export"` and set `basePath`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/your-repo-name",       // your GitHub repo name
  assetPrefix: "/your-repo-name/",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  transpilePackages: [
    "three",
    "@react-three/fiber",
    "@react-three/drei",
    "@react-three/postprocessing",
  ],
  turbopack: {},
};

export default nextConfig;
```

2. Build the static export:

```bash
npm run build
```

This produces an `out/` directory with static HTML/JS/CSS.

3. Deploy to GitHub Pages:

**Option A — `gh-pages` npm package:**

```bash
npx gh-pages -d out
```

**Option B — GitHub Actions (recommended):**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_BASE_PATH: /${{ github.event.repository.name }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. Enable GitHub Pages in your repo settings: Settings → Pages → Source: **GitHub Actions**.

> **Note:** The 3D scene is loaded via `next/dynamic` with `ssr: false`, which works correctly in static export mode.

---

## Visual Identity

| Token | Value | Usage |
|---|---|---|
| `--gendex-red` | `#FF1E1E` | Primary brand color, baseboards, header text, E labels |
| `--gendex-black` | `#080808` | Room walls, desk, base surfaces |
| `--gendex-purple` | `#7C3AED` | Secondary accent, side-wall LED strips, terminal hint |
| `--gendex-bg` | `#050507` | Page background |

### Inspirations

Cyberpunk 2077 · Blade Runner 2049 · Mr. Robot · Iron Man's Workshop · NASA Mission Control · Modern developer setups

---

## Customization

All content lives in **`src/gendex/data/content.ts`** — edit the constants there to update bio, projects, skills, timeline, statistics, contact info, etc.

Terminal commands are defined in `src/gendex/components/Terminal.tsx`.

Color tokens are CSS variables in `src/app/globals.css`.

---

## Browser Support

- Chrome / Edge 110+ (WebGL2, Web Audio, Pointer Lock API)
- Firefox 110+
- Safari 16+
- Mobile Safari / Chrome Mobile — touch controls (swipe + tap), terminal accessible via button

---

## Windows Compatibility

Tested successfully on **Windows 11** with:
- Node.js 20+
- npm 10+
- PowerShell / cmd.exe / Git Bash

All npm scripts use standard cross-platform commands. No `cp`, `tee`, or Bun required.

```cmd
C:\gendex> npm install
C:\gendex> npm run dev
C:\gendex> npm run build
C:\gendex> npm run start
```

---

## License

Personal portfolio of Abderrahmane Hadjadj. Code is provided for reference. Content (bio, projects, statistics) is personal and not for redistribution.

---

## Credits

Built for **Abderrahmane "GenDex" Hadjadj** — Community Operations & Systems Builder, Stellar Gate Games (Blood Strike MENA).

> « I don't like black boxes. »
