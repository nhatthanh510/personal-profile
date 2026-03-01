// ── Skill data for portfolio ──────────────────────────────────────
interface Skill {
  name: string;
  category: string;
}

const skills: Skill[] = [
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Vue.js", category: "Frontend" },
  { name: "Node.js", category: "Backend" },
  { name: "PostgreSQL", category: "Backend" },
  { name: "Docker", category: "DevOps" },
  { name: "AWS", category: "DevOps" },
  { name: "Git", category: "Tools" },
  { name: "Figma", category: "Tools" },
];

// ── Terminal line types ───────────────────────────────────────────
export interface TerminalLine {
  id: number;
  type: "input" | "output" | "ascii";
  content: string;
}

export const PROMPT = "nathan@portfolio";
export const PROMPT_PATH = "~";

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

// ── Mobile: narrower ASCII (fits small screens) ────────────────────
export const ASCII_WELCOME_MOBILE: string[] = [
  "",
  "  +----------------------------+",
  "  |                            |",
  "  |  Welcome to my portfolio   |",
  "  |  Type 'help' for commands  |",
  "  |                            |",
  "  +----------------------------+",
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
        "  skills        List skills by category",
        "  skills -a     List all skills (flat)",
        "  about         About me",
        "  contact       Contact information",
        "  projects      Notable projects",
        "  date          Current date & time",
        "  clear         Clear terminal",
        "  tech          Tech stack",
        "",
      ];

    case "skills": {
      const byCategory = args.includes("-a") === false;
      if (byCategory) {
        const categories = [...new Set(skills.map((s) => s.category))];
        const lines: string[] = ["", "  Skills", "  ─────────────────────────────────────────"];
        for (const cat of categories) {
          const names = skills.filter((s) => s.category === cat).map((s) => s.name);
          lines.push(`  ${cat}`);
          lines.push(`  ${names.join(", ")}`);
          lines.push("");
        }
        return lines;
      }
      const lines = ["", "  All skills", "  ─────────────────────────────────────────"];
      const names = skills.map((s) => s.name);
      lines.push(`  ${names.join(", ")}`);
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
        "  ┌─ Contact ──────────────────────────────────────┐",
        "  │  Email    → nhatthanh510@gmail.com               │",
        "  │  GitHub   → github.com/nhatthanh510              │",
        "  │  LinkedIn → linkedin.com/in/thanh-nguyen-14162911a │",
        "  └──────────────────────────────────────────────────┘",
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
