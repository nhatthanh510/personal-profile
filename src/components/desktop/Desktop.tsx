import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import useWindowStore from "@/store/window";
import { DESKTOP_ITEMS, type DesktopAction, type DesktopItem } from "./desktopData";
import { cn } from "@/lib/utils";

function DesktopIcon({
  item,
  selected,
  onSelect,
  onAction,
}: {
  item: DesktopItem;
  selected: boolean;
  onSelect: (id: string) => void;
  onAction: (action: DesktopAction) => void;
}) {
  return (
    <button
      type="button"
      className="absolute flex flex-col items-center gap-1 w-[76px] pointer-events-auto select-none desktop-icon"
      style={{ left: `${item.x}%`, top: `${item.y}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onAction(item.action);
      }}
    >
      <div
        className={cn(
          "flex items-center justify-center size-14 rounded-lg transition-colors",
          selected && "bg-white/25"
        )}
      >
        <img
          src={item.icon}
          alt={item.name}
          className="size-12 pointer-events-none"
          draggable={false}
        />
      </div>
      <span
        className={cn(
          "text-[11px] leading-tight text-center max-w-[76px] truncate px-1 py-0.5 rounded",
          selected
            ? "bg-[#3478f6] text-white"
            : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
        )}
      >
        {item.name}
      </span>
    </button>
  );
}

export function Desktop() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const openWindow = useWindowStore((s) => s.openWindow);
  const openNewFinder = useWindowStore((s) => s.openNewFinder);

  // GSAP staggered fade-in on mount
  useEffect(() => {
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
      className="absolute inset-0 top-12 z-10 pointer-events-none"
    >
      {DESKTOP_ITEMS.map((item) => (
        <DesktopIcon
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          onSelect={setSelectedId}
          onAction={handleAction}
        />
      ))}
    </div>
  );
}
