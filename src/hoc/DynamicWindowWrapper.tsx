import useWindowStore from "@/store/window";
import { useShallow } from "zustand/react/shallow";
import { useGSAP } from "@gsap/react";
import {
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  type RefObject,
  type CSSProperties,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useIsCompact } from "@/hooks/use-mobile";

interface DynamicWindowWrapperProps {
  windowId: string;
  dockAppId?: string;
  children: (titleBarRef: RefObject<HTMLDivElement | null>) => ReactNode;
}

export function DynamicWindowWrapper({
  windowId,
  dockAppId = "finder",
  children,
}: DynamicWindowWrapperProps) {
  const { win, focusWindow, updatePosition } = useWindowStore(
    useShallow((s) => ({
      win: s.windows[windowId],
      focusWindow: s.focusWindow,
      updatePosition: s.updatePosition,
    }))
  );

  if (!win) return null;

  return (
    <DynamicWindowWrapperInner
      windowId={windowId}
      dockAppId={dockAppId}
      win={win}
      focusWindow={focusWindow}
      updatePosition={updatePosition}
    >
      {children}
    </DynamicWindowWrapperInner>
  );
}

function DynamicWindowWrapperInner({
  windowId,
  dockAppId,
  win,
  focusWindow,
  updatePosition,
  children,
}: {
  windowId: string;
  dockAppId: string;
  win: NonNullable<ReturnType<typeof useWindowStore.getState>["windows"][string]>;
  focusWindow: (key: string) => void;
  updatePosition: (key: string, x: number, y: number) => void;
  children: (titleBarRef: RefObject<HTMLDivElement | null>) => ReactNode;
}) {
  const { isOpen, zIndex, isMinimized, isMaximized, x, y, width, height } = win;
  const isCompact = useIsCompact();

  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);
  const prevIsMinimized = useRef(isMinimized);
  const prevIsMaximized = useRef(isMaximized);

  // ── Open animation ─────────────────────────────────────
  useGSAP(() => {
    const el = windowRef.current;
    if (!el || !isOpen || isMinimized) return;

    el.style.display = "block";

    if (isCompact) {
      gsap.fromTo(
        el,
        { y: "100%", opacity: 1 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "power3.out",
        }
      );
    } else {
      gsap.fromTo(
        el,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: "power3.out",
          onComplete: () => { gsap.set(el, { clearProps: "transform,opacity" }); },
        }
      );
    }
  }, [isOpen, isCompact]);

  // ── Minimize / Unminimize animation ────────────────────
  useEffect(() => {
    const el = windowRef.current;
    if (!el) return;

    if (isMinimized && !prevIsMinimized.current) {
      if (isCompact) {
        gsap.to(el, {
          y: "100%",
          duration: 0.3,
          ease: "power3.in",
          onComplete: () => {
            el.style.display = "none";
            gsap.set(el, { clearProps: "transform,opacity,filter,borderRadius" });
          },
        });
      } else {
        const dockIcon = document.querySelector<HTMLElement>(
          `[data-app="${dockAppId}"]`
        );
        const dockRect = dockIcon?.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        const targetX = dockRect
          ? dockRect.left - elRect.left + dockRect.width / 2
          : 0;
        const targetY = dockRect
          ? dockRect.top - elRect.top
          : window.innerHeight;

        gsap.to(el, {
          scale: 0.05,
          opacity: 0,
          x: targetX,
          y: targetY,
          duration: 0.4,
          ease: "power3.in",
          onComplete: () => {
            el.style.display = "none";
            gsap.set(el, { clearProps: "transform,opacity" });
          },
        });
      }
    } else if (!isMinimized && prevIsMinimized.current) {
      el.style.display = "block";
      if (isCompact) {
        gsap.fromTo(
          el,
          { y: "100%", opacity: 1 },
          {
            y: 0,
            opacity: 1,
            duration: 0.35,
            ease: "power3.out",
          }
        );
      } else {
        gsap.fromTo(
          el,
          { scale: 0.05, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.35,
            ease: "power3.out",
            onComplete: () => { gsap.set(el, { clearProps: "transform,opacity" }); },
          }
        );
      }
    }

    prevIsMinimized.current = isMinimized;
  }, [isMinimized, dockAppId, isCompact]);

  // ── Maximize / Restore animation (desktop only) ─────────
  useEffect(() => {
    if (isCompact) return;
    const el = windowRef.current;
    if (!el || !isOpen) return;

    if (isMaximized && !prevIsMaximized.current) {
      gsap.to(el, {
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        duration: 0.3,
        ease: "power2.inOut",
        overwrite: true,
      });
    } else if (!isMaximized && prevIsMaximized.current && win.prevGeometry === null) {
      gsap.to(el, {
        left: x ?? (window.innerWidth - width) / 2,
        top: y ?? (window.innerHeight - height) / 2,
        width,
        height,
        duration: 0.3,
        ease: "power2.inOut",
        overwrite: true,
      });
    }

    prevIsMaximized.current = isMaximized;
  }, [isMaximized, isOpen, x, y, width, height, win.prevGeometry, isCompact]);

  // ── Visibility ─────────────────────────────────────────
  useLayoutEffect(() => {
    const el = windowRef.current;
    if (!el) return;
    if (!isOpen) {
      el.style.display = "none";
    }
  }, [isOpen]);

  // ── Draggable (desktop only) ──────────────────────────
  useLayoutEffect(() => {
    if (isCompact) return;
    const el = windowRef.current;
    const trigger = titleBarRef.current;

    if (!el || !trigger) return;

    const [draggable] = Draggable.create(el, {
      trigger,
      onPress() {
        focusWindow(windowId);
      },
      onDragEnd() {
        const rect = el.getBoundingClientRect();
        gsap.set(el, { clearProps: "transform" });
        gsap.set(el, { left: rect.left, top: rect.top });
        updatePosition(windowId, rect.left, rect.top);
      },
    });

    return () => {
      draggable.kill();
    };
  }, [isOpen, focusWindow, updatePosition, windowId, isCompact]);

  // ── Compute inline style ───────────────────────────────
  const style: CSSProperties = useMemo(() => {
    if (isCompact) {
      return {
        zIndex,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100dvw",
        height: "100dvh",
        transformOrigin: "top center",
        overflow: "hidden",
      };
    }
    if (isMaximized) {
      return {
        zIndex,
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      };
    }
    return {
      zIndex,
      position: "absolute",
      left: x ?? (window.innerWidth - width) / 2,
      top: y ?? (window.innerHeight - height) / 2,
      width,
      height,
    };
  }, [isCompact, isMaximized, zIndex, x, y, width, height]);

  const handleMouseDown = useCallback(() => {
    focusWindow(windowId);
  }, [focusWindow, windowId]);

  return (
    <section
      id={windowId}
      ref={windowRef}
      style={style}
      onMouseDown={handleMouseDown}
    >
      {children(titleBarRef)}
    </section>
  );
}
