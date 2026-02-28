export interface GalleryImage {
  id: string;
  src: string;
  title: string;
}

export const galleryImages: GalleryImage[] = [
  { id: "gal-1", src: "/images/gal1.png", title: "Gallery 1" },
  { id: "gal-2", src: "/images/gal2.png", title: "Gallery 2" },
  { id: "gal-3", src: "/images/gal3.png", title: "Gallery 3" },
  { id: "gal-4", src: "/images/gal4.png", title: "Gallery 4" },
];
