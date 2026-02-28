import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useFinderInstance } from "@/store/finderContext";

export function FinderSidebar() {
  const sidebarSections = useFinderInstance((s) => s.sidebarSections);
  const currentPath = useFinderInstance((s) => s.currentPath);
  const sidebarNavigate = useFinderInstance((s) => s.sidebarNavigate);
  const activeId = currentPath[0] ?? null;

  return (
    <div className="w-[180px] shrink-0 bg-white/[0.04] border-r border-white/[0.06]">
      <ScrollArea className="h-full">
        <div className="py-3 px-2">
          {sidebarSections.map((section) => (
            <div key={section.label}>
              <h3 className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                {section.label}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeId === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => sidebarNavigate(item.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1 rounded-md text-left",
                          "text-[13px] transition-colors duration-100",
                          isActive
                            ? "bg-[#06b6d4]/20 text-[#22d3ee]"
                            : "text-white/70 hover:bg-white/[0.08]"
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
}
