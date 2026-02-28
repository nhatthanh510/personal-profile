import useWindowStore from "@/store/window";
import { useGSAP } from "@gsap/react";
import {
  useRef,
  useEffect,
  useLayoutEffect,
  type ComponentProps,
  type ComponentType,
  type RefObject,
  type CSSProperties,
} from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
export interface WindowWrapperProps {
  titleBarRef: RefObject<HTMLDivElement | null>;
}

const WindowWrapper = (Component: ComponentType<WindowWrapperProps>, windowKey: string) => {
  const WrappedComponent = (props: Omit<ComponentProps<typeof Component>, keyof WindowWrapperProps>) => {
    const store = useWindowStore();
    const win = store.windows[windowKey];
    const { isOpen, zIndex, isMinimized, isMaximized, x, y, width, height } = win;

    const windowRef = useRef<HTMLDivElement>(null);
    const titleBarRef = useRef<HTMLDivElement>(null);
    const prevIsMinimized = useRef(isMinimized);
    const prevIsMaximized = useRef(isMaximized);

    // ── Auto-center on first open ──────────────────────────
    useEffect(() => {
      if (isOpen && x === null && !isMinimized) {
        const cx = (window.innerWidth - width) / 2;
        const cy = (window.innerHeight - height) / 2;
        store.updatePosition(windowKey, cx, cy);
      }
    }, [isOpen, x, width, height, isMinimized, store]);

    // ── Open animation ─────────────────────────────────────
    useGSAP(() => {
      const el = windowRef.current;
      if (!el || !isOpen || isMinimized) return;

      el.style.display = "block";
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
    }, [isOpen]);

    // ── Minimize / Unminimize animation ────────────────────
    useEffect(() => {
      const el = windowRef.current;
      if (!el) return;

      if (isMinimized && !prevIsMinimized.current) {
        // Animate to dock
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
      } else if (!isMinimized && prevIsMinimized.current) {
        // Restore from dock
        el.style.display = "block";
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

      prevIsMinimized.current = isMinimized;
    }, [isMinimized]);

    // ── Maximize / Restore animation ───────────────────────
    useEffect(() => {
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
        // Restored — animate to stored position
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
    }, [isMaximized, isOpen, x, y, width, height, win.prevGeometry]);

    // ── Visibility ─────────────────────────────────────────
    useLayoutEffect(() => {
      const el = windowRef.current;
      if (!el) return;
      if (!isOpen) {
        el.style.display = "none";
      }
    }, [isOpen]);

    // ── Draggable (GSAP Draggable on title bar) ────────────
    useEffect(() => {
      const el = windowRef.current;
      if (!el) return;

      const [draggable] = Draggable.create(el, {
        onPress() {
          store.focusWindow(windowKey);
        },
      });

      return () => {
        draggable.kill();
      };
    }, []);

    // ── Compute inline style ───────────────────────────────
    const computedX = x ?? (window.innerWidth - width) / 2;
    const computedY = y ?? (window.innerHeight - height) / 2;

    const style: CSSProperties = isMaximized
      ? {
          zIndex,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }
      : {
          zIndex,
          position: "absolute",
          left: computedX,
          top: computedY,
          width,
          height,
        };

    return (
      <section
        id={windowKey}
        ref={windowRef}
        style={style}
        onMouseDown={() => store.focusWindow(windowKey)}
      >
        <Component {...(props as ComponentProps<typeof Component>)} titleBarRef={titleBarRef} />
      </section>
    );
  };

  WrappedComponent.displayName = `WindowWrapper(${Component.displayName || windowKey})`;
  return WrappedComponent;
};

export default WindowWrapper;
