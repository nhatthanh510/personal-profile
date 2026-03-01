import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import useWindowStore from "@/store/window";
import { DESKTOP_ITEMS, type DesktopAction, type DesktopItem } from "./desktopData";
import { dockApps, type DockApp } from "@/constants";
import { cn } from "@/lib/utils";
import { useIsCompact, useIsMobile } from "@/hooks/use-mobile";
import { useShallow } from "zustand/react/shallow";
import type { WindowKey } from "@/constants";

function DesktopIcon({
  item,
  selected,
  compact,
  onSelect,
  onAction,
}: {
  item: DesktopItem;
  selected: boolean;
  compact: boolean;
  onSelect: (id: string) => void;
  onAction: (action: DesktopAction) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);

  // Only enable dragging on desktop
  useLayoutEffect(() => {
    if (compact) return;
    const el = ref.current;
    if (!el) return;

    const [draggable] = Draggable.create(el, {
      type: "x,y",
      cursor: "default",
      activeCursor: "default",
      bounds: el.parentElement!,
      onDragStart() {
        dragged.current = false;
      },
      onDrag() {
        dragged.current = true;
      },
      onDragEnd() {
        setTimeout(() => { dragged.current = false; }, 50);
      },
    });

    return () => { draggable.kill(); };
  }, [compact]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragged.current) return;
    onSelect(item.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dragged.current) return;
    onAction(item.action);
  };

  // On mobile, single tap opens (like iOS)
  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!compact) return;
    onAction(item.action);
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center gap-1 pointer-events-auto select-none desktop-icon cursor-default",
        compact
          ? "w-[72px]"
          : "absolute w-[76px]"
      )}
      style={compact ? undefined : { left: `${item.x}%`, top: `${item.y}%` }}
      onClick={compact ? handleTap : handleClick}
      onDoubleClick={compact ? undefined : handleDoubleClick}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-lg transition-colors",
          compact ? "size-14 sm:size-16" : "size-14",
          selected && !compact && "bg-white/25"
        )}
      >
        <img
          src={item.icon}
          alt={item.name}
          className={cn(
            "pointer-events-none",
            compact ? "size-14 sm:size-16 rounded-[14px]" : "size-12"
          )}
          draggable={false}
        />
      </div>
      <span
        className={cn(
          "text-[11px] leading-tight text-center max-w-[76px] truncate px-1 py-0.5 rounded",
          selected && !compact
            ? "bg-[#06b6d4] text-white"
            : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        )}
      >
        {item.name}
      </span>
    </div>
  );
}

export function Desktop() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const openWindow = useWindowStore((s) => s.openWindow);
  const openNewFinder = useWindowStore((s) => s.openNewFinder);
  const isCompact = useIsCompact();
  const isMobile = useIsMobile();

  const {
    windows,
    openWindow: openWin,
    closeWindow,
    unminimizeWindow,
    focusWindow,
    openNewFinder: openNewFinderStore,
  } = useWindowStore(
    useShallow((s) => ({
      windows: s.windows,
      openWindow: s.openWindow,
      closeWindow: s.closeWindow,
      unminimizeWindow: s.unminimizeWindow,
      focusWindow: s.focusWindow,
      openNewFinder: s.openNewFinder,
    }))
  );

  const toggleDockApp = useCallback(
    (app: DockApp) => {
      if (!app.canOpen) return;
      if (app.id === "finder") {
        const finderEntries = Object.entries(windows).filter(([k]) => k.startsWith("finder-"));
        if (finderEntries.length === 0) {
          openNewFinderStore();
          return;
        }
        const visibleEntries = finderEntries.filter(([, w]) => w.isOpen && !w.isMinimized);
        const minimizedEntries = finderEntries.filter(([, w]) => w.isOpen && w.isMinimized);
        if (visibleEntries.length === 0 && minimizedEntries.length > 0) {
          const [topId] = minimizedEntries.reduce((a, b) => (a[1].zIndex > b[1].zIndex ? a : b));
          unminimizeWindow(topId);
        } else if (visibleEntries.length > 0) {
          const [topId] = visibleEntries.reduce((a, b) => (a[1].zIndex > b[1].zIndex ? a : b));
          focusWindow(topId);
        } else {
          openNewFinderStore();
        }
        return;
      }
      const key = app.id as WindowKey;
      const win = windows[key];
      if (win?.isMinimized) {
        unminimizeWindow(key);
      } else if (win?.isOpen) {
        closeWindow(key);
      } else {
        openWin(key);
      }
    },
    [windows, openWin, closeWindow, unminimizeWindow, focusWindow, openNewFinderStore]
  );

  const hasFinderInstances = Object.keys(windows).some((k) => k.startsWith("finder-"));
  const mobileOverflowApps = isMobile ? dockApps.slice(4) : [];

  // GSAP staggered fade-in on mount
  useLayoutEffect(() => {
    const icons = containerRef.current?.querySelectorAll(".desktop-icon");
    if (!icons?.length) return;

    gsap.fromTo(
      icons,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }
    );
  }, []);

  // Clear selection when clicking anywhere outside a desktop icon
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".desktop-icon")) {
        setSelectedId(null);
      }
    };
    window.addEventListener("pointerdown", handler);
    return () => window.removeEventListener("pointerdown", handler);
  }, []);

  const handleAction = useCallback(
    (action: DesktopAction) => {
      switch (action.type) {
        case "openFolder":
          openNewFinder(action.finderPath);
          break;
        case "openFile":
          openWindow(action.windowKey, { title: action.title, src: action.src });
          break;
        case "openApp":
          openWindow(action.windowKey);
          break;
        case "openLink":
          window.open(action.url, "_blank", "noopener,noreferrer");
          break;
      }
    },
    [openWindow, openNewFinder]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "z-10 pointer-events-none",
        isCompact
          ? "absolute inset-x-0 bottom-24 top-auto flex flex-wrap justify-center gap-4 px-6 sm:gap-6"
          : "absolute inset-0 top-12"
      )}
    >
      {DESKTOP_ITEMS.map((item) => (
        <DesktopIcon
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          compact={isCompact}
          onSelect={setSelectedId}
          onAction={handleAction}
        />
      ))}
      {mobileOverflowApps.map(({ id, icon, name, canOpen }) => {
        const showDot =
          id === "finder" ? hasFinderInstances : (canOpen && windows[id]?.isOpen);
        return (
          <div
            key={id}
            className="flex flex-col items-center gap-1 pointer-events-auto select-none w-[72px] cursor-default"
          >
            <button
              type="button"
              className="relative flex flex-col items-center gap-1"
              aria-label={name}
              disabled={!canOpen}
              onClick={() => toggleDockApp({ id, name, icon, canOpen })}
            >
              <span className="flex size-14 sm:size-16 items-center justify-center rounded-[14px]">
                <img
                  src={`/images/${icon}`}
                  alt={name}
                  loading="lazy"
                  draggable={false}
                  className={cn(
                    "size-14 sm:size-16 rounded-[14px] pointer-events-none",
                    !canOpen && "opacity-60"
                  )}
                />
                {showDot && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
                )}
              </span>
              <span className="text-[11px] leading-tight text-center max-w-[76px] truncate px-1 py-0.5 rounded text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {name}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
