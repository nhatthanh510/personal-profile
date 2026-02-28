import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { processCommand, ASCII_WELCOME, type TerminalLine } from "./terminal/terminalCommands";
import { PromptPrefix } from "./terminal/PromptPrefix";

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
      <WindowShell className="shadow-black/50 border-white/8 bg-[#1e1e1e]">
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
          className="flex-1 overflow-hidden bg-[#1e1e1e]/95 backdrop-blur-xl"
        >
          <div onClick={() => inputRef.current?.focus()} className="p-3 font-roboto text-[13px] leading-normal cursor-text min-h-full">
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
                aria-label="Terminal input"
              />
            </div>
          </div>
        </ScrollArea>
      </WindowShell>
    </TooltipProvider>
  );
};

const TerminalWindow = WindowWrapper(Terminal, "terminal");
export { TerminalWindow };
