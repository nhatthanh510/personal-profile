import { useEffect } from "react";
import WindowWrapper from "@/hoc/WindowWrapper";
import type { WindowWrapperProps } from "@/hoc/WindowWrapper";
import { WindowTitleBar } from "@/components/WindowTitleBar";
import { WindowShell } from "@/components/WindowShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Grid3X3 } from "lucide-react";
import useGalleryStore from "@/store/gallery";
import { GalleryGrid } from "./gallery/GalleryGrid";
import { GalleryLightbox } from "./gallery/GalleryLightbox";

// ── Title bar content ────────────────────────────────────────────
function GalleryTitleContent() {
  const selectedIndex = useGalleryStore((s) => s.selectedIndex);
  const selectedImage = useGalleryStore((s) => s.selectedImage);
  const images = useGalleryStore((s) => s.images);
  const close = useGalleryStore((s) => s.close);

  return (
    <div className="flex items-center gap-2">
      {selectedIndex !== null && (
        <button
          type="button"
          onClick={close}
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
          {selectedIndex + 1} / {images.length}
        </span>
      )}
    </div>
  );
}

// ── Content switcher ─────────────────────────────────────────────
function GalleryContent() {
  const selectedIndex = useGalleryStore((s) => s.selectedIndex);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;

    const handler = (e: KeyboardEvent) => {
      const { prev, next, close } = useGalleryStore.getState();
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedIndex !== null]);

  return selectedIndex === null ? <GalleryGrid /> : <GalleryLightbox />;
}

// ── Gallery ──────────────────────────────────────────────────────
const Gallery = ({ titleBarRef }: WindowWrapperProps) => (
  <TooltipProvider delayDuration={300}>
    <WindowShell className="bg-[#1e1e1e]">
      <WindowTitleBar
        target="photos"
        titleBarRef={titleBarRef}
        className="bg-[#2d2d2d] border-b-[#1a1a1a]"
      >
        <GalleryTitleContent />
      </WindowTitleBar>
      <GalleryContent />
    </WindowShell>
  </TooltipProvider>
);

const GalleryWindow = WindowWrapper(Gallery, "photos");
export { GalleryWindow };
