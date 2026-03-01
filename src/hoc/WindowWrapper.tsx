import useWindowStore from "@/store/window";
import { useShallow } from "zustand/react/shallow";
import { useGSAP } from "@gsap/react";
import {
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  type ComponentProps,
  type ComponentType,
  type RefObject,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import type { WindowKey } from "@/constants";
import { useIsCompact } from "@/hooks/use-mobile";

export interface WindowWrapperProps {
  titleBarRef: RefObject<HTMLDivElement | null>;
}

const WindowWrapper = (Component: ComponentType<WindowWrapperProps>, windowKey: WindowKey) => {
  const WrappedComponent = (props: Omit<ComponentProps<typeof Component>, keyof WindowWrapperProps>) => {
    const { win, focusWindow, updatePosition } = useWindowStore(
      useShallow((s) => ({
        win: s.windows[windowKey],
        focusWindow: s.focusWindow,
        updatePosition: s.updatePosition,
      }))
    );
    const { isOpen, zIndex, isMinimized, isMaximized, x, y, width, height } = win;
    const isCompact = useIsCompact();

    const windowRef = useRef<HTMLDivElement>(null);
    const titleBarRef = useRef<HTMLDivElement>(null);
    const prevIsMinimized = useRef(isMinimized);
    const prevIsMaximized = useRef(isMaximized);
    const hasCentered = useRef(false);

    // ── Auto-center on first open ──────────────────────────
    useEffect(() => {
      if (isCompact) return;
      if (isOpen && x === null && !isMinimized && !hasCentered.current) {
        hasCentered.current = true;
        const cx = (window.innerWidth - width) / 2;
        const cy = (window.innerHeight - height) / 2;
        updatePosition(windowKey, cx, cy);
      }
      if (!isOpen) {
        hasCentered.current = false;
      }
    }, [isOpen, x, width, height, isMinimized, updatePosition, isCompact]);

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
          const dockIcon = document.querySelector<HTMLElement>(`[data-app="${windowKey}"]`);
          const dockRect = dockIcon?.getBoundingClientRect();
          const elRect = el.getBoundingClientRect();

          const targetX = dockRect ? dockRect.left - elRect.left + dockRect.width / 2 : 0;
          const targetY = dockRect ? dockRect.top - elRect.top : window.innerHeight;

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
    }, [isMinimized, isCompact]);

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

    // Draggable (desktop only)
    useLayoutEffect(() => {
      if (isCompact) return;
      const el = windowRef.current;
      const trigger = titleBarRef.current;

      if (!el || !trigger) return;

      const [draggable] = Draggable.create(el, {
        trigger,
        onPress() {
          focusWindow(windowKey);
        },
        onDragEnd() {
          const rect = el.getBoundingClientRect();
          gsap.set(el, { clearProps: "transform" });
          gsap.set(el, { left: rect.left, top: rect.top });
          updatePosition(windowKey, rect.left, rect.top);
        },
      });

      return () => {
        draggable.kill();
      };
    }, [isOpen, focusWindow, updatePosition, isCompact]);

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
      focusWindow(windowKey);
    }, [focusWindow]);

    return (
      <section
        id={windowKey}
        ref={windowRef}
        style={style}
        onMouseDown={handleMouseDown}
      >
        <Component {...(props as ComponentProps<typeof Component>)} titleBarRef={titleBarRef} />
      </section>
    );
  };

  WrappedComponent.displayName = `WindowWrapper(${Component.displayName || windowKey})`;
  return WrappedComponent;
};

export default WindowWrapper;
