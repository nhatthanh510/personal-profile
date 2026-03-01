import { useState, useCallback } from "react";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowControls } from "@/components/WindowControls";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useIsCompact } from "@/hooks/use-mobile";
import useWindowStore from "@/store/window";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  PanelLeft,
  RotateCw,
} from "lucide-react";
import { articles, type Article } from "./safari/articlesData";
import { ArticleList } from "./safari/ArticleList";
import { ArticleView } from "./safari/ArticleView";

// ── Navigation button ──────────────────────────────────────────────
function NavButton({
  children,
  disabled = false,
  onClick,
  className,
  label,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex items-center justify-center size-7 rounded-md transition-colors",
        disabled
          ? "text-white/25 cursor-default"
          : "text-white/70 hover:bg-white/[0.1] active:bg-white/[0.15]",
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Safari Component ───────────────────────────────────────────────
const Safari = ({ titleBarRef }: WindowWrapperProps) => {
  const isCompact = useIsCompact();
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [history, setHistory] = useState<Article[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const currentUrl = activeArticle
    ? activeArticle.url
    : "articles.portfolio.dev";

  const canGoBack = historyIndex > 0 || (historyIndex === 0 && activeArticle !== null);
  const canGoForward = historyIndex < history.length - 1;

  const handleSelectArticle = useCallback(
    (article: Article) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(article);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setActiveArticle(article);
    },
    [history, historyIndex]
  );

  const handleBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setActiveArticle(history[newIndex]);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setActiveArticle(null);
    }
  }, [history, historyIndex]);

  const handleForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setActiveArticle(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleBackToList = useCallback(() => {
    setHistoryIndex(-1);
    setActiveArticle(null);
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <WindowShell className="bg-[rgba(22,24,35,0.65)] backdrop-blur-[20px]">
        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div
          ref={titleBarRef}
          className={cn(
            "flex items-center bg-white/[0.06] border-b border-white/[0.06] px-3 gap-1.5 select-none shrink-0",
            isCompact ? "h-12" : "h-11 cursor-grab active:cursor-grabbing"
          )}
        >
          {isCompact ? (
            <>
              <button
                type="button"
                className="flex items-center gap-0.5 text-[#007AFF] text-sm font-normal shrink-0"
                onClick={() => closeWindow("safari")}
              >
                <ChevronLeft className="size-5" strokeWidth={2.5} />
                <span>Go Back</span>
              </button>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[15px] font-semibold text-white/90">Safari</span>
              </div>
              <div className="w-[72px]" />
            </>
          ) : (
            <>
              <WindowControls target="safari" />

              <div className="w-px h-4 bg-white/[0.1] mx-2" />

              <NavButton label="Show Sidebar">
                <PanelLeft className="size-[15px]" strokeWidth={1.8} />
                <ChevronDown className="size-2.5 -ml-0.5" strokeWidth={2} />
              </NavButton>

              <div className="w-px h-4 bg-white/[0.1] mx-2" />

              <NavButton
                label="Back"
                disabled={!canGoBack}
                onClick={handleBack}
              >
                <ChevronLeft className="size-4" strokeWidth={2} />
              </NavButton>

              <NavButton
                label="Forward"
                disabled={!canGoForward}
                onClick={handleForward}
              >
                <ChevronRight className="size-4" strokeWidth={2} />
              </NavButton>

              {/* Center: address bar */}
              <div className="flex-1 flex justify-center min-w-0">
                <div className="flex items-center w-full max-w-[480px] bg-white/[0.08] border border-white/[0.08] rounded-lg h-[30px] px-3 gap-1.5">
                  <Lock className="size-3 text-white/40 shrink-0" />
                  <span className="flex-1 text-[12.5px] text-white/70 truncate select-all leading-none text-center">
                    {currentUrl}
                  </span>
                  <RotateCw className="size-3 text-white/40 shrink-0" strokeWidth={2} />
                </div>
              </div>

              <div className="w-[52px] shrink-0" />
            </>
          )}
        </div>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden bg-transparent">
          {activeArticle ? (
            <ArticleView article={activeArticle} onBack={handleBackToList} />
          ) : (
            <ScrollArea className="h-full">
              <div className="px-5 pt-5 pb-2">
                <h2 className="text-[18px] font-bold text-white/90 mb-0.5">
                  Articles
                </h2>
                <p className="text-[13px] text-white/40">
                  Thoughts on web development, architecture, and design
                </p>
              </div>
              <ArticleList articles={articles} onSelect={handleSelectArticle} />
            </ScrollArea>
          )}
        </div>
      </WindowShell>
    </TooltipProvider>
  );
};

const SafariWindow = WindowWrapper(Safari, "safari");
export { SafariWindow };
