import { useState, useCallback } from "react";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowControls } from "@/components/WindowControls";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
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
          ? "text-[#c7c7cc] cursor-default"
          : "text-[#3c3c43] hover:bg-[#e8e8ed] active:bg-[#dcdce0]",
        className
      )}
    >
      {children}
    </button>
  );
}

// ── Safari Component ───────────────────────────────────────────────
const Safari = ({ titleBarRef }: WindowWrapperProps) => {
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
      <WindowShell className="shadow-black/50 border-white/8 bg-white">
        {/* ── Unified toolbar ─────────────────────────────────── */}
        <div
          ref={titleBarRef}
          className="flex items-center h-11 bg-[#f6f6f6] border-b border-[#d1d1d1] px-3 gap-1.5 select-none shrink-0 cursor-grab active:cursor-grabbing"
        >
          {/* Left group: traffic lights + sidebar + nav */}
          <WindowControls target="safari" />

          <div className="w-px h-4 bg-[#d5d5d5] mx-2" />

          <NavButton label="Show Sidebar">
            <PanelLeft className="size-[15px]" strokeWidth={1.8} />
            <ChevronDown className="size-2.5 -ml-0.5" strokeWidth={2} />
          </NavButton>

          <div className="w-px h-4 bg-[#d5d5d5] mx-2" />

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
            <div className="flex items-center w-full max-w-[480px] bg-white border border-[#d2d2d7] rounded-lg h-[30px] px-3 gap-1.5 shadow-sm">
              <Lock className="size-3 text-[#86868b] shrink-0" />
              <span className="flex-1 text-[12.5px] text-[#3c3c43] truncate select-all leading-none text-center">
                {currentUrl}
              </span>
              <RotateCw className="size-3 text-[#86868b] shrink-0" strokeWidth={2} />
            </div>
          </div>

          {/* Right spacer for visual balance */}
          <div className="w-[52px] shrink-0" />
        </div>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden bg-[#fafafa]">
          {activeArticle ? (
            <ArticleView article={activeArticle} onBack={handleBackToList} />
          ) : (
            <ScrollArea className="h-full">
              <div className="px-5 pt-5 pb-2">
                <h2 className="text-[18px] font-bold text-[#1d1d1f] mb-0.5">
                  Articles
                </h2>
                <p className="text-[13px] text-[#86868b]">
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
