import type {
  EducationItem,
  Certification,
  SkillItem,
  Project,
  DiscordBot,
  StatisticItem,
  InvestigationLog,
  TimelineEvent,
} from "./types";

// ====== Personal identity ======
export const PERSON = {
  fullName: "Abderrahmane Hadjadj",
  nickname: "GenDex",
  birthDate: "25 September 2003",
  nationality: "Algerian",
  location: "Médéa, Algeria",
  age: 22,
  languages: [
    { name: "Arabic", level: "Native", proficiency: 100 },
    { name: "English", level: "Fluent", proficiency: 90 },
    { name: "French", level: "Basic", proficiency: 35 },
  ],
  quote: "I don't like black boxes.",
  tagline: "Systems builder. Automation engineer. Investigator of black boxes.",
  role: "Community Operations & Systems Builder",
  employer: "Stellar Gate Games — Blood Strike MENA",
  bio: [
    "GenDex is not a traditional software engineer. He works at the intersection of community operations, creator management, automation, data analysis, system architecture, Discord bot development, technical coordination, reverse engineering, and product thinking.",
    "His defining characteristic is curiosity. He does not accept black boxes and enjoys understanding how systems work internally — peeling apart APIs, dissecting bot frameworks, and rebuilding the parts that don't make sense.",
    "Most of his work happens at 3:00 AM, in a dark room illuminated by red and purple LEDs, with rain falling outside the window and three monitors running terminals. This portfolio is a recreation of that room.",
  ],
  traits: [
    "Analytical",
    "Persistent",
    "Curious",
    "Introverted",
    "Builder mindset",
    "Detail-oriented",
    "Problem solver",
    "Systems thinker",
  ],
  inspirations: [
    "Cyberpunk 2077",
    "Blade Runner 2049",
    "Mr. Robot",
    "Iron Man's Workshop",
    "NASA Mission Control",
    "Modern developer setups",
  ],
} as const;

// ====== Career timeline ======
export const TIMELINE: TimelineEvent[] = [
  {
    year: "2020",
    title: "First contact — Discord moderation",
    description:
      "Began moderating Discord communities. Learned how online communities scale, how moderation tooling actually works under the hood, and why most public bots break the moment a server crosses 10k members.",
    tags: ["Discord", "Moderation", "Communities"],
  },
  {
    year: "2021",
    title: "Videography, editing & special effects training",
    description:
      "Completed formal training in videography, editing and special effects. Built a visual sensibility that would later inform every dashboard and report he designs.",
    tags: ["Videography", "Editing", "VFX"],
  },
  {
    year: "2022",
    title: "Gaming communities deep-dive",
    description:
      "Continued working with gaming communities. Started mapping creator ecosystems, watching how content creators behave, churn, and grow across platforms.",
    tags: ["Gaming", "Creators", "Community"],
  },
  {
    year: "2023",
    title: "First portfolio & web development",
    description:
      "Built the first portfolio website and started learning web development in earnest. Discovered that the browser is the most powerful operating system ever shipped.",
    tags: ["Web", "Portfolio", "HTML/CSS"],
  },
  {
    year: "2024",
    title: "Blood Strike MENA — Stellar Gate Games",
    description:
      "Joined Stellar Gate Games on the Blood Strike MENA team in Community Operations. Managed creators and community activities, completed Programming & Web Development training, then completed Digital Marketing, Communication, Sales & Administration training.",
    tags: ["Stellar Gate Games", "Blood Strike", "Creators", "Training"],
  },
  {
    year: "2025",
    title: "Automation, bots & creator systems",
    description:
      "Managed creator programs, built Discord bots, automated internal workflows, and shipped the first version of an internal creator tracking system that became the KOL Tracker.",
    tags: ["Automation", "Discord.js", "Node.js", "Bots"],
  },
  {
    year: "2026",
    title: "Email reporting, TikTok investigation & higher diploma",
    description:
      "Built automated email reporting systems, investigated TikTok API changes for 40+ hours, developed additional creator management tools, and started pursuing a Higher Technician Diploma (TS) in Computer Science / IT, part-time format.",
    tags: ["Email automation", "TikTok API", "Reverse engineering", "TS Diploma"],
  },
];

// ====== Education ======
export const EDUCATION: EducationItem[] = [
  {
    title: "High School Graduate",
    institution: "Médéa, Algeria",
    period: "—",
    status: "completed",
    detail:
      "Completed high school education. Foundational academic background before pivoting fully into systems and software.",
  },
  {
    title: "Higher Technician Diploma (TS) — Computer Science / IT",
    institution: "Part-time format, Algeria",
    period: "2026 — present",
    status: "in-progress",
    detail:
      "Currently pursuing a Higher Technician Diploma in Computer Science / IT through a part-time format that lets him keep building at Stellar Gate Games in parallel.",
  },
];

export const CERTIFICATIONS: Certification[] = [
  {
    name: "Videography, Editing & Special Effects",
    year: "2021",
    status: "completed",
  },
  {
    name: "Programming & Web Development",
    year: "2024",
    status: "completed",
  },
  {
    name: "Digital Marketing, Communication, Sales & Administration",
    year: "2024",
    status: "completed",
  },
];

// ====== Skills ======
export const SKILLS: SkillItem[] = [
  { name: "JavaScript", level: 88, category: "language" },
  { name: "TypeScript", level: 82, category: "language" },
  { name: "Python", level: 78, category: "language" },
  { name: "HTML/CSS", level: 85, category: "language" },
  { name: "Node.js", level: 86, category: "framework" },
  { name: "React", level: 80, category: "framework" },
  { name: "Electron", level: 68, category: "framework" },
  { name: "Discord.js", level: 92, category: "framework" },
  { name: "Playwright", level: 75, category: "tool" },
  { name: "Git", level: 84, category: "tool" },
  { name: "Automation", level: 90, category: "automation" },
  { name: "Data Analysis", level: 83, category: "analysis" },
];

// ====== Projects ======
export const PROJECTS: Project[] = [
  {
    id: "kol-tracker",
    name: "KOL Tracker",
    tagline: "Multi-platform creator tracking with email automation",
    description:
      "An internal system that tracks Key Opinion Leader (creator) performance across TikTok, YouTube and Kick. Generates weekly and monthly reports, exports CSVs, and dispatches them via automated email pipelines. Replaces what used to be a multi-hour manual spreadsheet ritual.",
    features: [
      { label: "Multi-platform tracking", detail: "TikTok, YouTube, Kick — unified schema" },
      { label: "Weekly reports", detail: "Auto-generated every Monday, sent before the team wakes up" },
      { label: "Monthly reports", detail: "Aggregated views, growth, churn, top performers" },
      { label: "CSV exports", detail: "Clean CSV output for downstream BI tooling" },
      { label: "Email automation", detail: "Scheduled dispatch with templated bodies" },
      { label: "Creator statistics", detail: "Per-creator time-series + leaderboard" },
    ],
    platforms: ["TikTok", "YouTube", "Kick"],
    stats: [
      { label: "Creators tracked", value: "51+" },
      { label: "Platforms", value: "3" },
      { label: "Report cadence", value: "Weekly + Monthly" },
    ],
  },
  {
    id: "creator-mgmt-platform",
    name: "Creator Management Platform",
    tagline: "Profiles, rankings, achievements, analytics",
    description:
      "An internal creator management platform with rich profiles, rankings, achievements, and analytics. Designed to give the community operations team a single pane of glass for every creator relationship.",
    features: [
      { label: "Creator profiles", detail: "Identity, contacts, platforms, contract metadata" },
      { label: "Rankings", detail: "Leaderboards across multiple KPIs, weekly + monthly" },
      { label: "Achievements", detail: "Milestone badges, contract renewals, growth awards" },
      { label: "Analytics", detail: "Performance over time, churn risk, audience overlap" },
      { label: "Performance tracking", detail: "Per-campaign attribution + cohort views" },
    ],
  },
  {
    id: "tiktok-investigation",
    name: "TikTok API Investigation",
    tagline: "40+ hours of reverse engineering",
    description:
      "Spent over 40 hours investigating TikTok API behavior, scraping limitations and anti-bot protections. Mapped the request flow, identified the fingerprinting techniques in use, and documented every endpoint that still worked at the time of writing.",
    features: [
      { label: "Endpoint mapping", detail: "Catalogued public + semi-public endpoints" },
      { label: "Anti-bot fingerprinting", detail: "Identified signature + device-id techniques" },
      { label: "Rate-limit profile", detail: "Mapped soft vs hard limits per endpoint" },
      { label: "Stable data extraction", detail: "Documented the subset of data that can be reliably pulled" },
    ],
    stats: [
      { label: "Hours invested", value: "40+" },
      { label: "Endpoints mapped", value: "30+" },
      { label: "Output", value: "Internal report" },
    ],
  },
];

// ====== Discord bots ======
export const DISCORD_BOTS: DiscordBot[] = [
  {
    name: "Music Bot",
    purpose: "High-quality audio playback for community voice channels.",
    features: [
      "Multi-source queue with gapless playback",
      "Per-DJ role permissions",
      "Lyrics + now-playing embeds",
      "Auto-resume on node restart",
    ],
    stack: ["Discord.js", "Node.js", "FFmpeg", "Lavalink"],
  },
  {
    name: "Tournament Bot",
    purpose: "Run community tournaments end-to-end inside Discord.",
    features: [
      "Bracket generation (single + double elim)",
      "Auto role assignment for participants",
      "Live match tracking + result reporting",
      "Replay archive channel",
    ],
    stack: ["Discord.js", "TypeScript", "SQLite", "Challonge API"],
  },
  {
    name: "Creator Management Bot",
    purpose: "In-Discord creator onboarding, stats lookup, and reporting.",
    features: [
      "Creator onboarding flow with verification",
      "Slash-command stats lookup (live)",
      "Auto-generated weekly recap cards",
      "Role sync with creator management platform",
    ],
    stack: ["Discord.js", "TypeScript", "REST", "Cron"],
  },
];

// ====== Investigation log (TikTok) ======
export const TIKTOK_INVESTIGATION_LOG: InvestigationLog[] = [
  { timestamp: "00:00", event: "Session start. Goal: enumerate public creator endpoints." },
  { timestamp: "01:42", event: "Identified /api/user/detail — requires X-Argus signature." },
  { timestamp: "03:11", event: "Captured device-id header flow. Token rotates per session." },
  { timestamp: "05:30", event: "Reverse-engineered X-Argus: VM-based JS interpreter." },
  { timestamp: "08:15", event: "Mapped rate-limits: 30 req / 60s soft, 100 / 60s hard." },
  { timestamp: "12:40", event: "Found stable /api/user/posts endpoint with cursor pagination." },
  { timestamp: "18:22", event: "Anti-bot trigger confirmed: headless Chromium fingerprint." },
  { timestamp: "22:05", event: "Mitigation: Playwright + residential proxy + human-like input." },
  { timestamp: "27:30", event: "Documented 30+ endpoints in internal Notion." },
  { timestamp: "31:18", event: "Stable extraction path verified across 5 creators." },
  { timestamp: "36:50", event: "Wrote replay harness — determinism 92%." },
  { timestamp: "41:02", event: "Final report compiled. Session closed." },
];

// ====== Statistics ======
export const STATISTICS: StatisticItem[] = [
  {
    id: "creators",
    label: "Creators Managed",
    value: 51,
    suffix: "+",
    description: "International content creators managed across the Blood Strike MENA creator program.",
  },
  {
    id: "views",
    label: "Views Tracked",
    value: 1000000,
    suffix: "+",
    description: "Cumulative creator views tracked across TikTok, YouTube and Kick through the KOL Tracker.",
  },
  {
    id: "tiktok-hours",
    label: "Hours Investigating TikTok APIs",
    value: 40,
    suffix: "+",
    description: "Dedicated hours reverse-engineering TikTok API behavior, anti-bot protections and rate limits.",
  },
  {
    id: "tools",
    label: "Internal Tools Built",
    value: 4,
    suffix: "+",
    description: "Internal tools shipped: KOL Tracker, Creator Management Platform, Email Reporting, Discord bots.",
  },
  {
    id: "emails",
    label: "Automated Emails Sent",
    value: 1000,
    suffix: "+",
    description: "Automated report emails dispatched by the KOL Tracker pipeline since launch.",
  },
  {
    id: "languages",
    label: "Languages Spoken",
    value: 3,
    description: "Arabic (native), English (fluent), French (basic).",
  },
];

// ====== Future ======
export const FUTURE = {
  short: "Still Building.",
  middle: "I don't like black boxes.",
  long: "Every system has a story. Mine is still being written.",
  goals: [
    "Finish the Higher Technician Diploma in Computer Science / IT.",
    "Deepen system-architecture and reverse-engineering skills.",
    "Scale the creator management tooling to additional regions.",
    "Ship more open-source Discord bots and automation libraries.",
    "Investigate every black box that stands in the way.",
  ],
};

// ====== Contact ======
export const CONTACT = {
  email: "hadjadj.abderrahmane@gmail.com",
  location: "Médéa, Algeria",
  availability: "Open to collaboration on automation, Discord bots, and creator systems.",
  channels: [
    { label: "Email", value: "hadjadj.abderrahmane@gmail.com", href: "mailto:hadjadj.abderrahmane@gmail.com" },
    { label: "Discord", value: "GenDex", href: "#" },
    { label: "GitHub", value: "Available on request", href: "#" },
    { label: "Location", value: "Médéa, Algeria", href: "#" },
  ],
};

// ====== Loading sequence strings ======
export const LOADING_LINES = [
  "Initializing GENDEX.EXE...",
  "Loading memories...",
  "Loading systems...",
  "Loading investigations...",
  "Loading projects...",
];

// ====== Boot sequence strings (post-ENTER) ======
export const BOOT_LINES = [
  "[ OK ] mounting /dev/gendex ........................ OK",
  "[ OK ] loading modules: curiosity, persistence ..... OK",
  "[ OK ] starting daemon: systems_builder ............ OK",
  "[ OK ] connecting to stellar_gate_games ............ OK",
  "[ OK ] spinning up discord_bots.service ............ OK",
  "[ OK ] arming KOL_Tracker cron ..................... OK",
  "[ OK ] tiktok_investigation.log → 41h recorded ..... OK",
  "[ OK ] entering room ................................ OK",
];
