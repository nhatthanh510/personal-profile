import { dockApps, DOCK_CONFIG } from "@/constants";
import { useRef, useState, useCallback } from "react";
import gsap from 'gsap';
import { useWindowManager } from '@/context/useWindowManager';
import type { WindowId } from '@/types/window';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/** Gaussian falloff: 1 at distance=0, tapering to ~0 at magnifyRange */
const getMagnification = (distance: number): number => {
  const { magnifyRange, maxScale } = DOCK_CONFIG;
  if (distance > magnifyRange) return 1;
  const t = 1 - (distance / magnifyRange) ** 2;
  return 1 + (maxScale - 1) * Math.max(0, t * t);
};

interface DockItemData {
  id: string;
  name: string;
  icon: string;
  canOpen: boolean;
}

export const Dock = () => {
  const dockRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const iconRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const { windows, openWindow, focusWindow, quitWindow } = useWindowManager();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuOpenRef = useRef(false);

  const setItemRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  const setIconRef = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (el) iconRefs.current.set(id, el);
    else iconRefs.current.delete(id);
  }, []);

  const resetDock = useCallback(() => {
    itemRefs.current.forEach((item, id) => {
      const icon = iconRefs.current.get(id);
      if (!icon) return;
      gsap.to(item, { width: DOCK_CONFIG.baseSize, duration: DOCK_CONFIG.animDuration, ease: "power2.out", overwrite: true });
      gsap.to(icon, { scale: 1, y: 0, duration: DOCK_CONFIG.animDuration, ease: "power2.out", overwrite: true });
    });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const dock = dockRef.current;
    if (!dock) return;
    const dockRect = dock.getBoundingClientRect();
    const mouseX = e.clientX - dockRect.left;

    itemRefs.current.forEach((item, id) => {
      const icon = iconRefs.current.get(id);
      if (!icon) return;

      const rect = item.getBoundingClientRect();
      const center = rect.left - dockRect.left + rect.width / 2;
      const distance = Math.abs(mouseX - center);
      const scale = getMagnification(distance);
      const size = DOCK_CONFIG.baseSize * scale;

      gsap.to(item, { width: size, duration: 0.15, ease: "power2.out", overwrite: true });
      gsap.to(icon, { scale, y: -(scale - 1) * 12, duration: 0.15, ease: "power2.out", overwrite: true });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (menuOpenRef.current) return;
    resetDock();
  }, [resetDock]);

  const bounceIcon = useCallback((id: string) => {
    const icon = iconRefs.current.get(id);
    if (!icon) return;

    const tl = gsap.timeline();
    tl.to(icon, { y: -30, duration: 0.2, ease: "power2.out" })
      .to(icon, { y: 0, duration: 0.25, ease: "bounce.out" })
      .to(icon, { y: -14, duration: 0.15, ease: "power2.out" })
      .to(icon, { y: 0, duration: 0.2, ease: "bounce.out" });
  }, []);

  const toggleApp = useCallback((app: DockItemData) => {
    if (!app.canOpen) return;

    bounceIcon(app.id);

    const windowId = app.id as WindowId;
    const win = windows[windowId];

    if (!win || !win.isOpen || win.isMinimized) {
      openWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  }, [windows, bounceIcon, openWindow, focusWindow]);

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string, canOpen: boolean) => {
    if (!canOpen) return;
    e.preventDefault();
    menuOpenRef.current = true;
    setOpenMenuId(id);
  }, []);

  const handleMenuClose = useCallback((closingId: string) => {
    setOpenMenuId((current) => {
      // If another menu already opened (right-click switching), don't reset
      if (current !== null && current !== closingId) return current;
      menuOpenRef.current = false;
      const dock = dockRef.current;
      if (dock && !dock.matches(':hover')) {
        resetDock();
      }
      return null;
    });
  }, [resetDock]);

  const trashIndex = dockApps.findIndex(app => app.id === 'trash');

  return (
    <section id="dock">
      <TooltipProvider delayDuration={100}>
        <div
          ref={dockRef}
          className="dock-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {dockApps.map((app, index) => {
            const { id, icon, name, canOpen } = app;
            const windowId = id as WindowId;
            const isWindowOpen = windows[windowId]?.isOpen ?? false;

            return (
              <div key={id} className="flex items-end">
                {index === trashIndex && trashIndex > 0 && (
                  <div className="dock-separator" />
                )}
                <Tooltip open={openMenuId ? false : undefined}>
                  <DropdownMenu
                    open={openMenuId === id}
                    onOpenChange={(open) => {
                      if (!open) handleMenuClose(id);
                    }}
                  >
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <div
                          ref={(el) => setItemRef(id, el)}
                          className="dock-item"
                          data-app-id={id}
                          onContextMenu={(e) => handleContextMenu(e, id, canOpen)}
                        >
                          <button
                            ref={(el) => setIconRef(id, el)}
                            type="button"
                            className="dock-icon"
                            aria-label={name}
                            disabled={!canOpen}
                            onClick={() => toggleApp(app)}
                          >
                            <img
                              src={`/images/${icon}`}
                              alt={name}
                              loading="lazy"
                              draggable={false}
                              className={canOpen ? '' : 'opacity-60'}
                            />
                          </button>
                          {isWindowOpen && (
                            <div className="dock-dot dock-dot-active" />
                          )}
                        </div>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <DropdownMenuContent>
                      {isWindowOpen ? (
                        <DropdownMenuItem onSelect={() => quitWindow(windowId)}>
                          Quit
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onSelect={() => openWindow(windowId)}>
                          Show
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <TooltipContent sideOffset={8}>{name}</TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    </section>
  );
};
