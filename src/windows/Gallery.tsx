import { useState, useRef, useCallback, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, X, Grid3X3 } from "lucide-react";

// ── Gallery data ──────────────────────────────────────────────────
interface GalleryImage {
  id: string;
  src: string;
  title: string;
}

const galleryImages: GalleryImage[] = [
  { id: "gal-1", src: "/images/gal1.png", title: "Gallery 1" },
  { id: "gal-2", src: "/images/gal2.png", title: "Gallery 2" },
  { id: "gal-3", src: "/images/gal3.png", title: "Gallery 3" },
  { id: "gal-4", src: "/images/gal4.png", title: "Gallery 4" },
];

// ── Gallery Component ─────────────────────────────────────────────
const Gallery = ({ titleBarRef }: WindowWrapperProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  // ── Grid stagger animation ─────────────────────────────────────
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

  // ── Lightbox enter animation ───────────────────────────────────
  useGSAP(
    () => {
      if (!lightboxRef.current || selectedIndex === null) return;

      gsap.fromTo(
        lightboxRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );

      const img = lightboxRef.current.querySelector<HTMLElement>(".lightbox-img");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" }
        );
      }
    },
    { scope: lightboxRef, dependencies: [selectedIndex] }
  );

  const closeImage = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % galleryImages.length : null
    );
  }, []);

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null
        ? (prev - 1 + galleryImages.length) % galleryImages.length
        : null
    );
  }, []);

  // ── Keyboard navigation for lightbox ──────────────────────────
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") closeImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, goPrev, goNext, closeImage]);

  const selectedImage = selectedIndex !== null ? galleryImages[selectedIndex] : null;

  return (
    <TooltipProvider delayDuration={300}>
      <WindowShell className="bg-[#1e1e1e]">
        {/* Title Bar */}
        <WindowTitleBar
          target="photos"
          titleBarRef={titleBarRef}
          className="bg-[#2d2d2d] border-b-[#1a1a1a]"
        >
          <div className="flex items-center gap-2">
            {selectedIndex !== null && (
              <button
                type="button"
                onClick={closeImage}
                className="p-1 rounded hover:bg-white/10 text-[#aaa] hover:text-white transition-colors"
              >
                <Grid3X3 className="size-4" />
              </button>
            )}
            <span className="text-[13px] text-[#ccc] font-medium">
              {selectedImage ? selectedImage.title : "Gallery"}
            </span>
            {selectedIndex !== null && (
              <span className="text-[11px] text-[#666]">
                {selectedIndex + 1} / {galleryImages.length}
              </span>
            )}
          </div>
        </WindowTitleBar>

        {/* Content */}
        {selectedIndex === null ? (
          /* ── Thumbnail Grid ──────────────────────────────────── */
          <ScrollArea className="flex-1 bg-[#1e1e1e]">
            <div
              ref={gridRef}
              className="grid gap-2 p-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              }}
            >
              {galleryImages.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  className="gallery-thumb group relative rounded-lg overflow-hidden cursor-pointer opacity-0 aspect-[4/3]"
                  onClick={() => setSelectedIndex(index)}
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
        ) : (
          /* ── Lightbox View ───────────────────────────────────── */
          <div
            ref={lightboxRef}
            className="flex-1 flex items-center justify-center bg-[#111] relative select-none"
          >
            {/* Nav: Previous */}
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors z-10"
            >
              <ChevronLeft className="size-5" />
            </button>

            {/* Image */}
            <img
              src={selectedImage!.src}
              alt={selectedImage!.title}
              className="lightbox-img max-w-[90%] max-h-[90%] object-contain rounded"
              draggable={false}
            />

            {/* Nav: Next */}
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors z-10"
            >
              <ChevronRight className="size-5" />
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={closeImage}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </WindowShell>
    </TooltipProvider>
  );
};

const GalleryWindow = WindowWrapper(Gallery, "photos");
export { GalleryWindow };
