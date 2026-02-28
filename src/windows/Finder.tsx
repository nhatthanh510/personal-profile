import { useState, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import useWindowStore from "@/store/window";
import { cn } from "@/lib/utils";

import { FinderSidebar } from "./finder/FinderSidebar";
import { FinderContent } from "./finder/FinderContent";
import {
  finderTree,
  findItemById,
  getItemsAtPath,
  getSidebarSections,
  type FinderItem,
} from "./finder/finderData";

// ── Finder Component ─────────────────────────────────────────────
const Finder = ({ titleBarRef }: WindowWrapperProps) => {
  const openWindow = useWindowStore((s) => s.openWindow);

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const sections = getSidebarSections();
  const currentItems = getItemsAtPath(currentPath);

  // ── Sidebar navigation → jump to top-level folder ────────────
  const handleSidebarNavigate = useCallback((folderId: string) => {
    setCurrentPath([folderId]);
    setSelectedItem(null);
  }, []);

  // ── Breadcrumb navigation → navigate to a specific depth ─────
  const handleBreadcrumbNavigate = useCallback((index: number) => {
    // index -1 = root
    if (index < 0) {
      setCurrentPath([]);
    } else {
      setCurrentPath((prev) => prev.slice(0, index + 1));
    }
    setSelectedItem(null);
  }, []);

  // ── Select item in grid ──────────────────────────────────────
  const handleSelect = useCallback((id: string) => {
    setSelectedItem(id);
  }, []);

  // ── Open item (double-click) ─────────────────────────────────
  const handleOpen = useCallback(
    (item: FinderItem) => {
      if (item.type === "folder") {
        setCurrentPath((prev) => [...prev, item.id]);
        setSelectedItem(null);
        return;
      }

      if (item.type === "txt" && item.txtSrc) {
        openWindow("txtFile", { title: item.name, src: item.txtSrc });
        return;
      }

      if (item.type === "image" && item.imageSrc) {
        openWindow("imgFile", { title: item.name, src: item.imageSrc });
        return;
      }

      if (item.type === "pdf" && item.pdfSrc) {
        openWindow("pdfFile", { title: item.name, src: item.pdfSrc });
        return;
      }

      // figma — no handler yet, could add later
    },
    [openWindow]
  );

  // ── Build breadcrumb labels ──────────────────────────────────
  const breadcrumbs: { label: string; pathIndex: number }[] = [
    { label: "Finder", pathIndex: -1 },
  ];
  for (let i = 0; i < currentPath.length; i++) {
    const item = findItemById(currentPath[i], finderTree);
    if (item) {
      breadcrumbs.push({ label: item.name, pathIndex: i });
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <WindowShell className="bg-white">
        {/* ── Title Bar ────────────────────────────────────────── */}
        <WindowTitleBar target="finder" titleBarRef={titleBarRef}>
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
                    onClick={() => handleBreadcrumbNavigate(crumb.pathIndex)}
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
        </WindowTitleBar>

        {/* ── Body: Sidebar + Content ──────────────────────────── */}
        <div className="flex flex-1 min-h-0">
          <FinderSidebar
            sections={sections}
            activePath={currentPath}
            onNavigate={handleSidebarNavigate}
          />
          <FinderContent
            items={currentItems}
            selectedItem={selectedItem}
            onSelect={handleSelect}
            onOpen={handleOpen}
          />
        </div>
      </WindowShell>
    </TooltipProvider>
  );
};

const FinderWindow = WindowWrapper(Finder, "finder");
export { FinderWindow };
