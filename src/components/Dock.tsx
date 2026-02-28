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
  const { windows, openWindow, closeWindow, unminimizeWindow } = useWindowStore(
    useShallow((s) => ({
      windows: s.windows,
      openWindow: s.openWindow,
      closeWindow: s.closeWindow,
      unminimizeWindow: s.unminimizeWindow,
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
    const key = app.id as WindowKey;
    const win = windows[key];
    if (win.isMinimized) {
      unminimizeWindow(key);
    } else if (win.isOpen) {
      closeWindow(key);
    } else {
      openWindow(key);
    }
  }, [windows, openWindow, closeWindow, unminimizeWindow]);

  const trashIndex = useMemo(() => dockApps.findIndex(app => app.id === 'trash'), []);

  return (
    <section id="dock">
      <div
        ref={dockRef}
        className="dock-container"
      >
        {dockApps.map(({ id, icon, name, canOpen }, index) => (
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
              {canOpen && <div className="dock-dot" />}
            </div>
          </div>
        ))}
        <Tooltip id="dock-tooltip" place="top" className="dock-tooltip" />
      </div>
    </section>
  );
};
