import type { WindowKey } from "@/constants";

// ── Desktop action types ─────────────────────────────────────────
export type DesktopAction =
  | { type: "openFolder"; finderPath: string[] }
  | { type: "openFile"; windowKey: "txtFile" | "imgFile" | "pdfFile"; title: string; src: string }
  | { type: "openApp"; windowKey: WindowKey }
  | { type: "openLink"; url: string };

// ── Desktop item ─────────────────────────────────────────────────
export interface DesktopItem {
  id: string;
  name: string;
  icon: string;
  x: number; // percentage 0–100
  y: number; // percentage 0–100
  action: DesktopAction;
}

// ── Curated desktop items (placed along edges to avoid Welcome text) ──
export const DESKTOP_ITEMS: DesktopItem[] = [
  // Top-left cluster
  {
    id: "dt-projects",
    name: "Projects",
    icon: "/images/folder.png",
    x: 4,
    y: 4,
    action: { type: "openFolder", finderPath: ["projects"] },
  },
  {
    id: "dt-documents",
    name: "Documents",
    icon: "/images/folder.png",
    x: 4,
    y: 18,
    action: { type: "openFolder", finderPath: ["documents"] },
  },
  // Top-right cluster
  {
    id: "dt-resume",
    name: "Resume.pdf",
    icon: "/images/pdf.png",
    x: 50,
    y: 10,
    action: { type: "openFile", windowKey: "pdfFile", title: "Resume.pdf", src: "/resume.pdf" },
  },
  // Bottom-right
  {
    id: "dt-discord",
    name: "Discord",
    icon: "/icons/discord.svg",
    x: 90,
    y: 58,
    action: { type: "openLink", url: "https://discord.com/users/560680367896526848" },
  },
  {
    id: "dt-github",
    name: "GitHub",
    icon: "/icons/github.svg",
    x: 90,
    y: 72,
    action: { type: "openLink", url: "https://github.com/nhatthanh510" },
  },
  {
    id: "dt-linkedin",
    name: "LinkedIn",
    icon: "/icons/linkedin.svg",
    x: 90,
    y: 86,
    action: { type: "openLink", url: "https://www.linkedin.com/in/thanh-nguyen-14162911a/" },
  }
];
