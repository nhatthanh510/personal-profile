import { useState, useCallback } from "react";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  PanelLeft,
  Share,
  Plus,
  Shield,
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
      <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/8 flex flex-col bg-white">
        {/* ── Title bar with address bar ───────────────────────── */}
        <WindowTitleBar
          target="safari"
          titleBarRef={titleBarRef}
          className="bg-[#f6f6f6] border-b-[#d1d1d1] h-[52px]"
        >
          <div className="flex items-center w-full max-w-[480px] mx-auto">
            <div className="flex items-center flex-1 bg-white border border-[#d2d2d7] rounded-lg h-[30px] px-3 gap-1.5 shadow-sm transition-shadow focus-within:shadow-md focus-within:border-[#0071e3]/40">
              <Lock className="size-3 text-[#86868b] shrink-0" />
              <span className="text-[12.5px] text-[#3c3c43] truncate select-all leading-none">
                {currentUrl}
              </span>
            </div>
          </div>
        </WindowTitleBar>

        {/* ── Navigation toolbar ───────────────────────────────── */}
        <div className="flex items-center h-9 bg-[#fafafa] border-b border-[#e5e5e5] px-2.5 gap-0.5 shrink-0">
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

          <div className="w-px h-4 bg-[#e5e5e5] mx-1" />

          <NavButton label="Show Sidebar">
            <PanelLeft className="size-[15px]" strokeWidth={1.8} />
          </NavButton>

          <div className="flex-1" />

          <NavButton label="Share">
            <Share className="size-[14px]" strokeWidth={1.8} />
          </NavButton>

          <NavButton label="New Tab">
            <Plus className="size-4" strokeWidth={2} />
          </NavButton>

          <NavButton label="Privacy Report">
            <Shield className="size-[14px]" strokeWidth={1.8} />
          </NavButton>
        </div>

        {/* ── Tab bar ──────────────────────────────────────────── */}
        <div className="flex items-center h-[30px] bg-[#f0f0f0] border-b border-[#d9d9d9] px-2 shrink-0">
          <div className="flex items-center h-full max-w-[220px] bg-white border-x border-t border-[#d1d1d1] rounded-t-md px-3 text-[11.5px] text-[#1d1d1f] font-medium truncate">
            <span className="truncate">
              {activeArticle ? activeArticle.title : "Articles"}
            </span>
          </div>
          <button
            type="button"
            aria-label="New tab"
            className="flex items-center justify-center size-5 ml-1 rounded text-[#86868b] hover:bg-[#e0e0e0] transition-colors"
          >
            <Plus className="size-3" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="flex-1 min-h-0 bg-[#fafafa]">
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
      </div>
    </TooltipProvider>
  );
};

const SafariWindow = WindowWrapper(Safari, "safari");
export { SafariWindow };
