import { dockApps, type DockApp, type WindowKey } from "@/constants";
import { useRef, useMemo, useCallback } from "react";
import { Tooltip } from 'react-tooltip';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { DOCK_CONFIG } from "@/constants";
import useWindowStore from "@/store/window";
import { useShallow } from "zustand/react/shallow";

/** Gaussian falloff: 1 at distance=0, tapering to ~0 at magnifyRange */
const getMagnification = (distance: number): number => {
  const { magnifyRange, maxScale } = DOCK_CONFIG;
  if (distance > magnifyRange) return 1;
  const t = 1 - (distance / magnifyRange) ** 2;
  return 1 + (maxScale - 1) * Math.max(0, t * t);
};

export const Dock = () => {
  const { windows, openWindow, closeWindow, unminimizeWindow, focusWindow, openNewFinder } = useWindowStore(
    useShallow((s) => ({
      windows: s.windows,
      openWindow: s.openWindow,
      closeWindow: s.closeWindow,
      unminimizeWindow: s.unminimizeWindow,
      focusWindow: s.focusWindow,
      openNewFinder: s.openNewFinder,
    }))
  );
  const dockRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLElement[]>([]);

  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const items = dock.querySelectorAll<HTMLElement>('.dock-item');
    itemsRef.current = Array.from(items);

    const handleMouseMove = (e: MouseEvent) => {
      const dockRect = dock.getBoundingClientRect();
      const mouseX = e.clientX - dockRect.left;

      itemsRef.current.forEach(item => {
        const icon = item.querySelector<HTMLElement>('.dock-icon');
        if (!icon) return;

        const rect = item.getBoundingClientRect();
        const center = rect.left - dockRect.left + rect.width / 2;
        const distance = Math.abs(mouseX - center);
        const scale = getMagnification(distance);
        const size = DOCK_CONFIG.baseSize * scale;

        gsap.to(item, { width: size, duration: 0.15, ease: "power2.out", overwrite: true });
        gsap.to(icon, { scale, y: -(scale - 1) * 12, duration: 0.15, ease: "power2.out", overwrite: true });
      });
    };

    const handleMouseLeave = () => {
      itemsRef.current.forEach(item => {
        const icon = item.querySelector<HTMLElement>('.dock-icon');
        if (!icon) return;

        gsap.to(item, {
          width: DOCK_CONFIG.baseSize,
          duration: DOCK_CONFIG.animDuration,
          ease: "power2.out",
          overwrite: true,
        });
        gsap.to(icon, {
          scale: 1,
          y: 0,
          duration: DOCK_CONFIG.animDuration,
          ease: "power2.out",
          overwrite: true,
        });
      });
    };

    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      dock.removeEventListener('mousemove', handleMouseMove);
      dock.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, { scope: dockRef });

  const toggleApp = useCallback((app: DockApp) => {
    if (!app.canOpen) return;

    // Special handling for finder — multi-instance
    if (app.id === "finder") {
      const finderEntries = Object.entries(windows).filter(([k]) => k.startsWith("finder-"));

      if (finderEntries.length === 0) {
        // No instances exist → open a new one
        openNewFinder();
        return;
      }

      const visibleEntries = finderEntries.filter(([, w]) => w.isOpen && !w.isMinimized);
      const minimizedEntries = finderEntries.filter(([, w]) => w.isOpen && w.isMinimized);

      if (visibleEntries.length === 0 && minimizedEntries.length > 0) {
        // All minimized → unminimize the most recent one (highest zIndex)
        const [topId] = minimizedEntries.reduce((a, b) => a[1].zIndex > b[1].zIndex ? a : b);
        unminimizeWindow(topId);
      } else if (visibleEntries.length > 0) {
        // Some visible → focus the topmost one
        const [topId] = visibleEntries.reduce((a, b) => a[1].zIndex > b[1].zIndex ? a : b);
        focusWindow(topId);
      } else {
        // All closed (shouldn't happen since closed entries are removed, but fallback)
        openNewFinder();
      }
      return;
    }

    const key = app.id as WindowKey;
    const win = windows[key];
    if (win.isMinimized) {
      unminimizeWindow(key);
    } else if (win.isOpen) {
      closeWindow(key);
    } else {
      openWindow(key);
    }
  }, [windows, openWindow, closeWindow, unminimizeWindow, focusWindow, openNewFinder]);

  const trashIndex = useMemo(() => dockApps.findIndex(app => app.id === 'trash'), []);

  // Check if any finder instances exist for the dock dot
  const hasFinderInstances = useMemo(
    () => Object.keys(windows).some((k) => k.startsWith("finder-")),
    [windows]
  );

  return (
    <section id="dock">
      <div
        ref={dockRef}
        className="dock-container"
      >
        {dockApps.map(({ id, icon, name, canOpen }, index) => {
          const showDot = id === "finder"
            ? hasFinderInstances
            : canOpen && windows[id]?.isOpen;

          return (
            <div key={id} className="flex items-end">
              {index === trashIndex && trashIndex > 0 && (
                <div className="dock-separator" />
              )}
              <div className="dock-item">
                <button
                  type="button"
                  className="dock-icon"
                  aria-label={name}
                  data-app={id}
                  data-tooltip-id="dock-tooltip"
                  data-tooltip-content={name}
                  data-tooltip-delay-show={100}
                  disabled={!canOpen}
                  onClick={() => toggleApp({ id, name, icon, canOpen })}
                >
                  <img
                    src={`/images/${icon}`}
                    alt={name}
                    loading="lazy"
                    draggable={false}
                    className={canOpen ? '' : 'opacity-60'}
                  />
                </button>
                {showDot && <div className="dock-dot" />}
              </div>
            </div>
          );
        })}
        <Tooltip id="dock-tooltip" place="top" className="dock-tooltip" />
      </div>
    </section>
  );
};
