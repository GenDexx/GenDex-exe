// Type definitions for the GenDex portfolio.

export type PanelId =
  | "about"        // Whiteboard
  | "creator-mgmt" // Monitor #1
  | "tiktok"       // Monitor #2
  | "discord-bots" // Monitor #3
  | "education"    // Desk
  | "skills"       // Server Rack
  | "future"       // Window
  | "contact"      // Door
  | "stats";       // Statistics view (triggered from HUD)

export type ScenePhase = "loading" | "intro" | "ready";

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  tags?: string[];
}

export interface SkillItem {
  name: string;
  level: number; // 0..100
  category: "language" | "framework" | "tool" | "automation" | "analysis";
}

export interface ProjectFeature {
  label: string;
  detail: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  features: ProjectFeature[];
  platforms?: string[];
  stats?: { label: string; value: string }[];
}

export interface DiscordBot {
  name: string;
  purpose: string;
  features: string[];
  stack: string[];
}

export interface StatisticItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description: string;
}

export interface InvestigationLog {
  timestamp: string;
  event: string;
}

export interface Certification {
  name: string;
  year: string;
  status: "completed" | "in-progress";
}

export interface EducationItem {
  title: string;
  institution: string;
  period: string;
  status: "completed" | "in-progress";
  detail: string;
}
