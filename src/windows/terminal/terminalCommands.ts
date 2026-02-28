// ── Skill data for portfolio ──────────────────────────────────────
interface Skill {
  name: string;
  level: number;
  category: string;
}

const skills: Skill[] = [
  { name: "React", level: 95, category: "Frontend" },
  { name: "TypeScript", level: 90, category: "Frontend" },
  { name: "Tailwind CSS", level: 90, category: "Frontend" },
  { name: "Next.js", level: 85, category: "Frontend" },
  { name: "Vue.js", level: 75, category: "Frontend" },
  { name: "Node.js", level: 85, category: "Backend" },
  { name: "Python", level: 80, category: "Backend" },
  { name: "PostgreSQL", level: 80, category: "Backend" },
  { name: "Docker", level: 75, category: "DevOps" },
  { name: "AWS", level: 70, category: "DevOps" },
  { name: "Git", level: 90, category: "Tools" },
  { name: "Figma", level: 70, category: "Tools" },
];

// ── Terminal line types ───────────────────────────────────────────
export interface TerminalLine {
  id: number;
  type: "input" | "output" | "ascii";
  content: string;
}

export const PROMPT = "nathan@portfolio";
export const PROMPT_PATH = "~";

// ── Bar chart helper ──────────────────────────────────────────────
function renderBar(level: number, width = 20): string {
  const filled = Math.round((level / 100) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${level}%`;
}

// ── ASCII welcome ─────────────────────────────────────────────────
export const ASCII_WELCOME: string[] = [
  "",
  "  +--------------------------------------------+",
  "  |                                            |",
  "  |   Welcome to my interactive portfolio!     |",
  "  |   Type 'help' to see available commands.   |",
  "  |                                            |",
  "  +--------------------------------------------+",
  "",
];



// ── Command processor ─────────────────────────────────────────────
export function processCommand(cmd: string): string[] {
  const trimmed = cmd.trim().toLowerCase();
  const [command, ...args] = trimmed.split(/\s+/);

  switch (command) {
    case "":
      return [""];

    case "help":
      return [
        "",
        "  Available commands:",
        "  ──────────────────────────────────────",
        "  help          Show this help message",
        "  skills        List all skills with levels",
        "  skills -c     Group skills by category",
        "  about         About me",
        "  contact       Contact information",
        "  projects      Notable projects",
        "  experience    Work experience",
        "  date          Current date & time",
        "  clear         Clear terminal",
        "  tech          Tech stack",
        "",
      ];

    case "skills": {
      if (args.includes("-c")) {
        const categories = [...new Set(skills.map((s) => s.category))];
        const lines: string[] = [""];
        for (const cat of categories) {
          lines.push(`  ┌─ ${cat} ${"─".repeat(38 - cat.length)}┐`);
          const catSkills = skills.filter((s) => s.category === cat);
          for (const s of catSkills) {
            const name = s.name.padEnd(14);
            lines.push(`  │  ${name} ${renderBar(s.level)}  │`);
          }
          lines.push(`  └${"─".repeat(43)}┘`);
          lines.push("");
        }
        return lines;
      }
      const lines = [
        "",
        "  Skills Overview:",
        "  ─────────────────────────────────────────",
      ];
      for (const s of skills) {
        const name = s.name.padEnd(14);
        lines.push(`  ${name} ${renderBar(s.level)}`);
      }
      lines.push("");
      return lines;
    }

    case "about":
      return [
        "",
        "  Hi! I'm a Full-Stack Developer passionate about",
        "  building beautiful, performant web experiences.",
        "",
        "  I love working with modern JavaScript/TypeScript",
        "  ecosystems and crafting pixel-perfect interfaces.",
        "",
      ];

    case "contact":
      return [
        "",
        "  ┌─ Contact ──────────────────────────────┐",
        "  │  Email    → hello@example.com           │",
        "  │  GitHub   → github.com/nhatthanh510     │",
        "  │  LinkedIn → linkedin.com/in/nhatthanh   │",
        "  └──────────────────────────────────────────┘",
        "",
      ];

    case "projects":
      return [
        "",
        "  Notable Projects:",
        "  ─────────────────────────────────────────",
        "  1. Portfolio OS     – This macOS-style portfolio",
        "  2. E-Commerce App   – Full-stack React + Node",
        "  3. Chat Platform    – Real-time messaging app",
        "  4. Data Dashboard   – Analytics visualization",
        "",
      ];

    case "experience":
      return [
        "",
        "  Work Experience:",
        "  ─────────────────────────────────────────",
        "  ▸ Senior Frontend Developer  (2023–now)",
        "  ▸ Full-Stack Developer       (2021–2023)",
        "  ▸ Junior Web Developer       (2019–2021)",
        "",
      ];

    case "date":
      return ["", ` ${new Date().toString()}`, ""];

    case "tech":
      return [
        "",
        "  Tech Stack:",
        "  -------------------",
        "  OS:         macOS Tahoe",
        "  Shell:      zsh 5.9",
        "  Theme:      Dark Mode",
        "  AI Agent:   Claude Code",
        "  Framework:  React 19",
        "  Bundler:    Vite 7",
        "  Language:   TypeScript",
        "  Styling:    Tailwind v4",
        "  State:      Zustand",
        "  Animations: GSAP",
        "",
      ];

    case "clear":
      return ["__CLEAR__"];

    default:
      return ["", `  zsh: command not found: ${command}`, ""];
  }
}
