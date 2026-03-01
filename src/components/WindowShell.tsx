import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIsCompact } from "@/hooks/use-mobile";

interface WindowShellProps {
  children: ReactNode;
  className?: string;
}

export function WindowShell({ children, className }: WindowShellProps) {
  const isCompact = useIsCompact();

  return (
    <div
      className={cn(
        "w-full h-full overflow-hidden flex flex-col",
        isCompact
          ? "bg-[#0f1219]"
          : [
              "border border-white/[0.08] rounded-xl",
              "shadow-[0_25px_60px_-12px_rgba(0,0,0,0.5)]",
              className,
            ]
      )}
    >
      {children}
    </div>
  );
}
