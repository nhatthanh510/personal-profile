import { type RefObject, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WindowControls } from "./WindowControls";
import type { WindowKey } from "@/constants";

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
  return (
    <div
      ref={titleBarRef}
      className={cn(
        "flex items-center h-12 bg-white/[0.06] border-b border-white/[0.06] px-3 gap-2 select-none shrink-0",
        "cursor-grab active:cursor-grabbing",
        className
      )}
    >
      <WindowControls target={target} />
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
      <div className="w-[52px]" />
    </div>
  );
}
