import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { useWindowManager } from '@/context/useWindowManager';
import { WINDOW_CONFIG } from '@/constants';
import type { WindowId } from '@/types/window';

interface AppWindowProps {
  id: WindowId;
  title: string;
  children: ReactNode;
}

export const AppWindow = ({ id, title, children }: AppWindowProps) => {
  const { windows, hideWindow, minimizeWindow, focusWindow, toggleMaximize, updatePosition } = useWindowManager();
  const win = windows[id];
  const windowRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const visible = win.isOpen && !win.isMinimized;

  // Open animation
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => {
        if (!windowRef.current) return;
        isAnimating.current = true;
        gsap.fromTo(windowRef.current,
          { scale: 0.5, opacity: 0, y: 40 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: WINDOW_CONFIG.openDuration,
            ease: 'back.out(1.2)',
            onComplete: () => { isAnimating.current = false; },
          }
        );
      });
    }
  }, [visible]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnimating.current || !windowRef.current) return;
    isAnimating.current = true;

    gsap.to(windowRef.current, {
      scale: 0.5,
      opacity: 0,
      y: 30,
      duration: WINDOW_CONFIG.closeDuration,
      ease: 'power2.in',
      onComplete: () => {
        isAnimating.current = false;
        hideWindow(id);
      },
    });
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnimating.current || !windowRef.current) return;
    isAnimating.current = true;

    const dockItem = document.querySelector(`[data-app-id="${id}"]`);
    if (!dockItem) {
      minimizeWindow(id);
      isAnimating.current = false;
      return;
    }

    const dockRect = dockItem.getBoundingClientRect();
    const windowRect = windowRef.current.getBoundingClientRect();

    const deltaX = dockRect.left + dockRect.width / 2 - (windowRect.left + windowRect.width / 2);
    const deltaY = dockRect.top + dockRect.height / 2 - (windowRect.top + windowRect.height / 2);

    gsap.to(windowRef.current, {
      x: `+=${deltaX}`,
      y: `+=${deltaY}`,
      scale: 0.05,
      opacity: 0,
      duration: WINDOW_CONFIG.minimizeDuration,
      ease: 'power3.in',
      onComplete: () => {
        isAnimating.current = false;
        minimizeWindow(id);
      },
    });
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAnimating.current || !windowRef.current) return;

    const el = windowRef.current;
    const layer = el.parentElement;
    // Fullscreen: use viewport size and offset to cover nav/dock
    const layerOffsetTop = layer?.getBoundingClientRect().top ?? 0;
    const layerOffsetLeft = layer?.getBoundingClientRect().left ?? 0;
    const fullW = window.innerWidth;
    const fullH = window.innerHeight;

    if (!win.isMaximized) {
      gsap.to(el, {
        left: -layerOffsetLeft,
        top: -layerOffsetTop,
        width: fullW,
        height: fullH,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => toggleMaximize(id, { width: fullW, height: fullH }, { x: -layerOffsetLeft, y: -layerOffsetTop }),
      });
    } else if (win.preMaximize) {
      gsap.to(el, {
        left: win.preMaximize.position.x,
        top: win.preMaximize.position.y,
        width: win.preMaximize.size.width,
        height: win.preMaximize.size.height,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => toggleMaximize(id),
      });
    }
  };

  const handleFocus = () => {
    if (!isAnimating.current) focusWindow(id);
  };

  const handleDragStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.traffic-lights')) return;
    if (win.isMaximized) return;
    focusWindow(id);

    const el = windowRef.current;
    if (!el) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startLeft = el.offsetLeft;
    const startTop = el.offsetTop;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newX = Math.max(0, Math.min(window.innerWidth - 100, startLeft + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, startTop + dy));
      gsap.set(el, { left: newX, top: newY });
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      const rect = el.getBoundingClientRect();
      updatePosition(id, { x: rect.left, y: rect.top - 40 });
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  if (!visible) return null;

  return (
    <div
      ref={windowRef}
      className={`app-window${win.isMaximized ? ' rounded-none!' : ''}`}
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      }}
      onPointerDown={handleFocus}
    >
      <div className="app-window-titlebar" onPointerDown={handleDragStart}>
        <div className="traffic-lights">
          <button type="button" className="traffic-light traffic-light-close" onClick={handleClose}>
            <span className="traffic-light-icon">&times;</span>
          </button>
          <button type="button" className="traffic-light traffic-light-minimize" onClick={handleMinimize}>
            <span className="traffic-light-icon">&minus;</span>
          </button>
          <button type="button" className="traffic-light traffic-light-maximize" onClick={handleMaximize}>
            <span className="traffic-light-icon">&#x2922;</span>
          </button>
        </div>
        <span className="app-window-title">{title}</span>
        <div className="w-14" />
      </div>
      <div className="app-window-content" style={{ height: `calc(100% - 36px)` }}>
        {children}
      </div>
    </div>
  );
};
