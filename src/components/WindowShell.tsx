import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WindowShellProps {
  children: ReactNode;
  className?: string;
}

export function WindowShell({ children, className }: WindowShellProps) {
  return (
    <div
      className={cn(
        "w-full h-full rounded-xl overflow-hidden border border-white/[0.08] flex flex-col",
        "shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {children}
    </div>
  );
}
