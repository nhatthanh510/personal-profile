import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollArea } from "@/components/ui/scroll-area";
import useGalleryStore from "@/store/gallery";

export function GalleryGrid() {
  const images = useGalleryStore((s) => s.images);
  const selectedIndex = useGalleryStore((s) => s.selectedIndex);
  const select = useGalleryStore((s) => s.select);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!gridRef.current || selectedIndex !== null) return;

      const items = gridRef.current.querySelectorAll<HTMLElement>(".gallery-thumb");
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
          overwrite: true,
        }
      );
    },
    { scope: gridRef, dependencies: [selectedIndex] }
  );

  return (
    <ScrollArea className="flex-1 bg-[#1e1e1e]">
      <div
        ref={gridRef}
        className="grid gap-2 p-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        }}
      >
        {images.map((img, index) => (
          <button
            key={img.id}
            type="button"
            className="gallery-thumb group relative rounded-lg overflow-hidden cursor-pointer opacity-0 aspect-[4/3]"
            onClick={() => select(index)}
          >
            <img
              src={img.src}
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              draggable={false}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-[12px] text-white font-medium">
                {img.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
