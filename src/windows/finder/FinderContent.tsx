import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import useFinderStore from "@/store/finder";

export function FinderContent() {
  const currentItems = useFinderStore((s) => s.currentItems);
  const selectedItem = useFinderStore((s) => s.selectedItem);
  const select = useFinderStore((s) => s.select);
  const open = useFinderStore((s) => s.open);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current || currentItems.length === 0) return;

      const children = gridRef.current.querySelectorAll<HTMLElement>(".finder-grid-item");
      if (children.length === 0) return;

      gsap.fromTo(
        children,
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.25,
          stagger: 0.03,
          ease: "power2.out",
          overwrite: true,
        }
      );
    },
    { scope: gridRef, dependencies: [currentItems] }
  );

  if (currentItems.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[13px] text-[#999]">
        This folder is empty
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div
        ref={gridRef}
        className="grid gap-1 p-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
        }}
      >
        {currentItems.map((item) => {
          const isSelected = selectedItem === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "finder-grid-item flex flex-col items-center gap-1 p-2 rounded-lg",
                "cursor-default transition-colors duration-100 opacity-0",
                isSelected
                  ? "bg-[#0058d0]/10 ring-1 ring-[#0058d0]/30"
                  : "hover:bg-[#f0f0f0]"
              )}
              onClick={() => select(item.id)}
              onDoubleClick={() => open(item)}
            >
              <img
                src={item.icon}
                alt=""
                className="size-14 object-contain drop-shadow-sm"
                draggable={false}
              />
              <span
                className={cn(
                  "text-[11px] leading-tight text-center break-all line-clamp-2 px-0.5",
                  isSelected ? "bg-[#0058d0] text-white rounded-sm px-1" : "text-[#333]"
                )}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
