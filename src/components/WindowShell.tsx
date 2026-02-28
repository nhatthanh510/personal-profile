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
        "w-full h-full rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-[#c0c0c0] flex flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}
