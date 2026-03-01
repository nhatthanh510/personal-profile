import { create } from "zustand";
import { galleryImages, galleryGroups, type GalleryImage } from "@/windows/gallery/galleryData";

interface GalleryState {
  selectedIndex: number | null;
  images: GalleryImage[];
  groups: typeof galleryGroups;
  selectedImage: GalleryImage | null;
  select: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

const useGalleryStore = create<GalleryState>((set) => ({
  selectedIndex: null,
  images: galleryImages,
  groups: galleryGroups,
  selectedImage: null,

  select: (index) =>
    set({ selectedIndex: index, selectedImage: galleryImages[index] }),

  close: () =>
    set({ selectedIndex: null, selectedImage: null }),

  next: () =>
    set((s) => {
      if (s.selectedIndex === null) return s;
      const i = (s.selectedIndex + 1) % galleryImages.length;
      return { selectedIndex: i, selectedImage: galleryImages[i] };
    }),

  prev: () =>
    set((s) => {
      if (s.selectedIndex === null) return s;
      const i =
        (s.selectedIndex - 1 + galleryImages.length) % galleryImages.length;
      return { selectedIndex: i, selectedImage: galleryImages[i] };
    }),
}));

export default useGalleryStore;
