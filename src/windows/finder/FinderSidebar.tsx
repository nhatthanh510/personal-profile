import { memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SidebarSection } from "./finderData";

interface FinderSidebarProps {
  sections: SidebarSection[];
  activePath: string[];
  onNavigate: (id: string) => void;
}

export const FinderSidebar = memo(function FinderSidebar({
  sections,
  activePath,
  onNavigate,
}: FinderSidebarProps) {
  // The active folder is the first item in the path (top-level favorite)
  const activeId = activePath[0] ?? null;

  return (
    <div className="w-[180px] shrink-0 bg-[#f5f5f5]/80 backdrop-blur-sm border-r border-[#d1d1d1]">
      <ScrollArea className="h-full">
        <div className="py-3 px-2">
          {sections.map((section) => (
            <div key={section.label}>
              <h3 className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8a8a8a]">
                {section.label}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeId === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1 rounded-md text-left",
                          "text-[13px] transition-colors duration-100",
                          isActive
                            ? "bg-[#0058d0] text-white"
                            : "text-[#333] hover:bg-[#e0e0e0]"
                        )}
                      >
                        <img
                          src={item.icon}
                          alt=""
                          className="size-4 shrink-0"
                          draggable={false}
                        />
                        <span className="truncate">{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});
