import { type RefObject, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { WindowControls } from "./WindowControls";
import type { WindowKey } from "@/constants";
import useWindowStore from "@/store/window";
import { useIsCompact } from "@/hooks/use-mobile";

interface WindowTitleBarProps {
  target: WindowKey;
  titleBarRef: RefObject<HTMLDivElement | null>;
  children?: ReactNode;
  className?: string;
}

export function WindowTitleBar({
  target,
  titleBarRef,
  children,
  className,
}: WindowTitleBarProps) {
  const isCompact = useIsCompact();
  const closeWindow = useWindowStore((s) => s.closeWindow);

  return (
    <div
      ref={titleBarRef}
      className={cn(
        "flex items-center h-12 bg-white/[0.06] border-b border-white/[0.06] px-3 gap-2 select-none shrink-0",
        !isCompact && "cursor-grab active:cursor-grabbing",
        className
      )}
    >
      {isCompact ? (
        <>
          <button
            type="button"
            className="flex items-center gap-0.5 text-[#007AFF] text-sm font-normal shrink-0"
            onClick={() => closeWindow(target)}
          >
            <ChevronLeft className="size-5" strokeWidth={2.5} />
            <span>Go Back</span>
          </button>
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>
          <div className="w-[72px]" />
        </>
      ) : (
        <>
          <WindowControls target={target} />
          <div className="flex-1 flex items-center justify-center">
            {children}
          </div>
          <div className="w-[52px]" />
        </>
      )}
    </div>
  );
}
