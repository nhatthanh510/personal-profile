import { ChevronRight } from "lucide-react";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import useFinderStore from "@/store/finder";
import { FinderSidebar } from "./finder/FinderSidebar";
import { FinderContent } from "./finder/FinderContent";

// ── Breadcrumb nav ───────────────────────────────────────────────
function FinderBreadcrumbs() {
  const breadcrumbs = useFinderStore((s) => s.breadcrumbs);
  const breadcrumbNavigate = useFinderStore((s) => s.breadcrumbNavigate);

  return (
    <nav className="flex items-center gap-0.5 text-[13px]">
      {breadcrumbs.map((crumb, i) => {
        const isLast = i === breadcrumbs.length - 1;
        return (
          <div key={crumb.pathIndex} className="flex items-center gap-0.5">
            {i > 0 && (
              <ChevronRight className="size-3.5 text-[#999] shrink-0" />
            )}
            <button
              type="button"
              onClick={() => breadcrumbNavigate(crumb.pathIndex)}
              className={cn(
                "px-1 py-0.5 rounded transition-colors",
                isLast
                  ? "font-semibold text-[#333] cursor-default"
                  : "text-[#666] hover:text-[#333] hover:bg-[#ddd]/60"
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
const Finder = ({ titleBarRef }: WindowWrapperProps) => (
  <TooltipProvider delayDuration={300}>
    <WindowShell className="bg-white">
      <WindowTitleBar target="finder" titleBarRef={titleBarRef}>
        <FinderBreadcrumbs />
      </WindowTitleBar>

      <div className="flex flex-1 min-h-0">
        <FinderSidebar />
        <FinderContent />
      </div>
    </WindowShell>
  </TooltipProvider>
);

const FinderWindow = WindowWrapper(Finder, "finder");
export { FinderWindow };
