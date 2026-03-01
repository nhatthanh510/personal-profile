export interface GalleryImage {
  id: string;
  src: string;
  title: string;
}

export interface GalleryCompanyGroup {
  company: string;
  title: string;
  images: GalleryImage[];
}

// Auto-generated from public/companies – run: node scripts/generate-gallery-images.js
const companiesGroups: GalleryCompanyGroup[] = [
  {
    company: "joinbrands",
    title: "Joinbrands",
    images: [
      {
        id: "companies-0--companies-joinbrands-landing-page.png",
        src: "/companies/joinbrands/landing-page.png",
        title: "Landing Page"
      },
      {
        id: "companies-1--companies-joinbrands-new-campaign.png",
        src: "/companies/joinbrands/new-campaign.png",
        title: "New Campaign"
      }
    ]
  },
  {
    company: "nab",
    title: "Nab",
    images: [
      {
        id: "companies-2--companies-nab-landing-page.png",
        src: "/companies/nab/landing-page.png",
        title: "Landing Page"
      }
    ]
  }
];

export const galleryGroups = companiesGroups;
export const galleryImages: GalleryImage[] = companiesGroups.flatMap((g) => g.images);
