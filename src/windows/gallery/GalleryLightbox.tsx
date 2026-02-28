import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import useGalleryStore from "@/store/gallery";

export function GalleryLightbox() {
  const selectedImage = useGalleryStore((s) => s.selectedImage);
  const selectedIndex = useGalleryStore((s) => s.selectedIndex);
  const prev = useGalleryStore((s) => s.prev);
  const next = useGalleryStore((s) => s.next);
  const close = useGalleryStore((s) => s.close);
  const lightboxRef = useRef<HTMLDivElement>(null);

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

  if (!selectedImage) return null;

  return (
    <div
      ref={lightboxRef}
      className="flex-1 flex items-center justify-center bg-[#111] relative select-none"
    >
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors z-10"
      >
        <ChevronLeft className="size-5" />
      </button>

      <img
        src={selectedImage.src}
        alt={selectedImage.title}
        className="lightbox-img max-w-[90%] max-h-[90%] object-contain rounded"
        draggable={false}
      />

      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors z-10"
      >
        <ChevronRight className="size-5" />
      </button>

      <button
        type="button"
        onClick={close}
        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors z-10"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
