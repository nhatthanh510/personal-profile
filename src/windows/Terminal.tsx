import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";

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
interface TerminalLine {
  id: number;
  type: "input" | "output" | "ascii";
  content: string;
}

const PROMPT = "visitor@portfolio";
const PROMPT_PATH = "~";

// ── Bar chart helper ──────────────────────────────────────────────
function renderBar(level: number, width = 20): string {
  const filled = Math.round((level / 100) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${level}%`;
}

// ── ASCII welcome ─────────────────────────────────────────────────
const ASCII_WELCOME: string[] = [
  "",
  "  ╔══════════════════════════════════════════════╗",
  "  ║                                              ║",
  "  ║   Welcome to my interactive portfolio!       ║",
  "  ║   Type 'help' to see available commands.     ║",
  "  ║                                              ║",
  "  ╚══════════════════════════════════════════════╝",
  "",
];

// ── Command processor ─────────────────────────────────────────────
function processCommand(cmd: string): string[] {
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
        "  whoami        Who is the visitor?",
        "  date          Current date & time",
        "  clear         Clear terminal",
        "  neofetch      System info",
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

    case "whoami":
      return ["", "  visitor – a curious person exploring this portfolio", ""];

    case "date":
      return ["", `  ${new Date().toString()}`, ""];

    case "neofetch":
      return [
        "",
        "                    'c.          visitor@portfolio",
        "                 ,xNMM.          ─────────────────",
        "               .OMMMMo           OS: macOS Portfolio",
        "               OMMM0,            Shell: zsh 5.9",
        "     .;loddo:' loolloddol;.      Terminal: portfolio-term",
        "   cKMMMMMMMMMMNWMMMMMMMMMM0:    Theme: Dark Mode",
        "  .KMMMMMMMMMMMMMMMMMMMMMMMWK.   Resolution: ∞ × ∞",
        "  XMMMMMMMMMMMMMMMMMMMMMMMMMX.   Framework: React 19",
        " ;MMMMMMMMMMMMMMMMMMMMMMMMMM:    Bundler: Vite 7",
        " :MMMMMMMMMMMMMMMMMMMMMMMMMM:    Language: TypeScript",
        " .MMMMMMMMMMMMMMMMMMMMMMMMMMX.   Styling: Tailwind v4",
        "  kMMMMMMMMMMMMMMMMMMMMMMMMWd.   State: Zustand",
        "  .XMMMMMMMMMMMMMMMMMMMMMMMMk    Animations: GSAP",
        "   .XMMMMMMMMMMMMMMMMMMMMK.",
        "     kMMMMMMMMMMMMMMMMMMd.",
        "      ;KMMMMMMMWXXWMMMKo.",
        "",
      ];

    case "clear":
      return ["__CLEAR__"];

    default:
      return ["", `  zsh: command not found: ${command}`, ""];
  }
}

// ── Prompt component ──────────────────────────────────────────────
function PromptPrefix() {
  return (
    <span className="select-none">
      <span className="text-[#78dce8]">{PROMPT}</span>
      <span className="text-[#a9a9a9]">:</span>
      <span className="text-[#a6e22e]">{PROMPT_PATH}</span>
      <span className="text-[#a9a9a9]">$ </span>
    </span>
  );
}

// ── Terminal Component ────────────────────────────────────────────
const Terminal = ({ titleBarRef }: WindowWrapperProps) => {
  const [lines, setLines] = useState<TerminalLine[]>(() => {
    let id = 0;
    return ASCII_WELCOME.map((content) => ({
      id: id++,
      type: "ascii" as const,
      content,
    }));
  });
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const nextId = useRef(ASCII_WELCOME.length);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector(
      "[data-slot='scroll-area-viewport']"
    );
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [lines]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const newLines: TerminalLine[] = [];
    const id = () => nextId.current++;

    newLines.push({ id: id(), type: "input", content: input });

    const output = processCommand(input);

    if (output[0] === "__CLEAR__") {
      setLines([]);
      setInput("");
      if (input.trim()) {
        setCommandHistory((prev) => [...prev, input.trim()]);
      }
      setHistoryIndex(-1);
      return;
    }

    for (const line of output) {
      newLines.push({ id: id(), type: "output", content: line });
    }

    setLines((prev) => [...prev, ...newLines]);
    if (input.trim()) {
      setCommandHistory((prev) => [...prev, input.trim()]);
    }
    setInput("");
    setHistoryIndex(-1);
  }, [input]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length === 0) return;
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex === -1) return;
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        setLines([]);
      }
    },
    [handleSubmit, commandHistory, historyIndex]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/8 flex flex-col bg-[#1e1e1e]">
        <WindowTitleBar
          target="terminal"
          titleBarRef={titleBarRef}
          className="bg-[#2d2d2d] border-b-[#1a1a1a] h-9"
        >
          <div className="flex items-center gap-1.5 bg-[#1e1e1e] rounded-md px-3 py-0.5">
            <div className="size-2.5 rounded-sm bg-[#555]" />
            <span className="text-[12px] text-[#a0a0a0] font-medium tracking-wide">
              visitor — zsh — 80×24
            </span>
          </div>
        </WindowTitleBar>

        <ScrollArea
          ref={scrollRef}
          className="flex-1 bg-[#1e1e1e]/95 backdrop-blur-xl"
        >
          <div onClick={focusInput} className="p-3 font-roboto text-[13px] leading-normal cursor-text min-h-full">
            {lines.map((line) => (
              <div key={line.id} className="whitespace-pre-wrap break-all">
                {line.type === "input" ? (
                  <span>
                    <PromptPrefix />
                    <span className="text-[#e6e6e6]">{line.content}</span>
                  </span>
                ) : (
                  <span className="text-[#d4d4d4]">{line.content}</span>
                )}
              </div>
            ))}

            <div className="flex items-center whitespace-pre">
              <PromptPrefix />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-[#e6e6e6] outline-none border-none caret-[#f8f8f2] font-roboto text-[13px] leading-normal"
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
            </div>
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};

const TerminalWindow = WindowWrapper(Terminal, "terminal");
export { TerminalWindow };
