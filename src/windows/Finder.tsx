import { ChevronLeft, ChevronRight } from "lucide-react";
import { DynamicWindowWrapper } from "@/hoc/DynamicWindowWrapper";
import { WindowControls } from "@/components/WindowControls";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useWindowStore from "@/store/window";
import type { FinderInitData } from "@/constants";

import { FinderStoreProvider, useFinderInstance } from "@/store/finderContext";
import { FinderSidebar } from "./finder/FinderSidebar";
import { FinderContent } from "./finder/FinderContent";

// ── Back / Forward buttons (macOS pill style) ────────────────────
function FinderNavButtons() {
  const goBack = useFinderInstance((s) => s.goBack);
  const goForward = useFinderInstance((s) => s.goForward);
  const canGoBack = useFinderInstance((s) => s.canGoBack);
  const canGoForward = useFinderInstance((s) => s.canGoForward);

  return (
    <div className="flex items-center bg-white/[0.08] rounded-2xl shrink-0">
      <button
        type="button"
        onClick={goBack}
        disabled={!canGoBack}
        className="px-2.5 py-1.5"
      >
        <span
          className={cn(
            "flex items-center justify-center size-6 rounded-full transition-colors",
            canGoBack
              ? "text-white/80 hover:bg-white/[0.1] active:bg-white/[0.15]"
              : "text-white/25 cursor-default"
          )}
        >
          <ChevronLeft className="size-5" strokeWidth={2.5} />
        </span>
      </button>
      <div className="w-px h-5 bg-white/[0.1]" />
      <button
        type="button"
        onClick={goForward}
        disabled={!canGoForward}
        className="px-2.5 py-1.5"
      >
        <span
          className={cn(
            "flex items-center justify-center size-6 rounded-full transition-colors",
            canGoForward
              ? "text-white/80 hover:bg-white/[0.1] active:bg-white/[0.15]"
              : "text-white/25 cursor-default"
          )}
        >
          <ChevronRight className="size-5" strokeWidth={3} />
        </span>
      </button>
    </div>
  );
}

// ── Breadcrumb nav ───────────────────────────────────────────────
function FinderBreadcrumbs() {
  const breadcrumbs = useFinderInstance((s) => s.breadcrumbs);
  const breadcrumbNavigate = useFinderInstance((s) => s.breadcrumbNavigate);

  return (
    <nav className="flex items-center gap-0.5 text-[14px]">
      {breadcrumbs.map((crumb, i) => {
        const isLast = i === breadcrumbs.length - 1;
        return (
          <div key={crumb.pathIndex} className="flex items-center gap-0.5">
            {i > 0 && (
              <ChevronRight className="size-3.5 text-white/30 shrink-0" />
            )}
            <button
              type="button"
              onClick={() => breadcrumbNavigate(crumb.pathIndex)}
              className={cn(
                "px-1 py-0.5 rounded transition-colors",
                isLast
                  ? "font-semibold text-white/90 cursor-default"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.08]"
              )}
              disabled={isLast}
            >
              {crumb.label}
            </button>
          </div>
        );
      })}
    </nav>
  );
}

// ── Finder ───────────────────────────────────────────────────────
function isFinderInitData(data: unknown): data is FinderInitData {
  return !!data && typeof data === "object" && "initialPath" in data;
}

export function Finder({ instanceId }: { instanceId: string }) {
  const windowData = useWindowStore((s) => s.windows[instanceId]?.data);
  const initialPath = isFinderInitData(windowData) ? windowData.initialPath : undefined;

  return (
    <FinderStoreProvider initialPath={initialPath} windowId={instanceId}>
      <DynamicWindowWrapper windowId={instanceId} dockAppId="finder">
        {(titleBarRef) => (
          <TooltipProvider delayDuration={300}>
            <WindowShell className="bg-[rgba(22,24,35,0.65)] backdrop-blur-[20px]">
              <div
                ref={titleBarRef}
                className="flex items-center h-12 border-b border-white/[0.06] select-none shrink-0 cursor-grab active:cursor-grabbing"
              >
                {/* Sidebar header: traffic lights */}
                <div className="w-[180px] shrink-0 flex items-center px-3 bg-white/[0.04] h-full border-r border-white/[0.06]">
                  <WindowControls target={instanceId} />
                </div>
                {/* Content header: nav buttons + breadcrumbs centered */}
                <div className="flex-1 flex items-center bg-white/[0.06] h-full px-3 gap-2">
                  <FinderNavButtons />
                  <div className="flex-1 flex items-center">
                    <FinderBreadcrumbs />
                  </div>
                </div>
              </div>

              <div className="flex flex-1 min-h-0">
                <FinderSidebar />
                <FinderContent />
              </div>
            </WindowShell>
          </TooltipProvider>
        )}
      </DynamicWindowWrapper>
    </FinderStoreProvider>
  );
}
