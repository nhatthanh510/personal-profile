// ── Finder file tree data ─────────────────────────────────────────

export interface FinderItem {
  id: string;
  name: string;
  type: "folder" | "txt" | "pdf" | "image" | "figma";
  icon: string;
  txtSrc?: string;
  imageSrc?: string;
  pdfSrc?: string;
  children?: FinderItem[];
}

// ── Icon mapping by file type ────────────────────────────────────
const ICONS: Record<FinderItem["type"], string> = {
  folder: "/images/folder.png",
  txt: "/images/txt.png",
  pdf: "/images/pdf.png",
  image: "/images/image.png",
  figma: "/images/figma.png",
};

// ── File tree ────────────────────────────────────────────────────
export const finderTree: FinderItem[] = [
  {
    id: "projects",
    name: "Projects",
    type: "folder",
    icon: ICONS.folder,
    children: [
      {
        id: "project-portfolio-os",
        name: "Portfolio OS",
        type: "folder",
        icon: ICONS.folder,
        children: [
          {
            id: "project-1-screenshot",
            name: "Screenshot.png",
            type: "image",
            icon: ICONS.image,
            imageSrc: "/images/project-1.png",
          },
          {
            id: "project-1-readme",
            name: "README.txt",
            type: "txt",
            icon: ICONS.txt,
            txtSrc: "/texts/portfolio-os-readme.txt",
          },
        ],
      },
      {
        id: "project-ecommerce",
        name: "E-Commerce App",
        type: "folder",
        icon: ICONS.folder,
        children: [
          {
            id: "project-2-screenshot",
            name: "Screenshot.png",
            type: "image",
            icon: ICONS.image,
            imageSrc: "/images/project-2.png",
          },
          {
            id: "project-2-readme",
            name: "README.txt",
            type: "txt",
            icon: ICONS.txt,
            txtSrc: "/texts/ecommerce-readme.txt",
          },
        ],
      },
      {
        id: "project-chat",
        name: "Chat Platform",
        type: "folder",
        icon: ICONS.folder,
        children: [
          {
            id: "project-3-screenshot",
            name: "Screenshot.png",
            type: "image",
            icon: ICONS.image,
            imageSrc: "/images/project-3.png",
          },
          {
            id: "project-3-readme",
            name: "README.txt",
            type: "txt",
            icon: ICONS.txt,
            txtSrc: "/texts/chat-platform-readme.txt",
          },
        ],
      },
    ],
  },
  {
    id: "documents",
    name: "Documents",
    type: "folder",
    icon: ICONS.folder,
    children: [
      {
        id: "resume-pdf",
        name: "Resume.pdf",
        type: "pdf",
        icon: ICONS.pdf,
        pdfSrc: "/resume.pdf",
      },
      {
        id: "cover-letter",
        name: "cover-letter.txt",
        type: "txt",
        icon: ICONS.txt,
        txtSrc: "/cover-letter.txt",
      },
    ],
  },
  {
    id: "designs",
    name: "Designs",
    type: "folder",
    icon: ICONS.folder,
    children: [
      {
        id: "portfolio-fig",
        name: "Portfolio.fig",
        type: "figma",
        icon: ICONS.figma,
      },
    ],
  },
];

// ── Sidebar favorites (top-level folders) ────────────────────────
export interface SidebarSection {
  label: string;
  items: { id: string; name: string; icon: string }[];
}

export function getSidebarSections(): SidebarSection[] {
  return [
    {
      label: "Favorites",
      items: finderTree.map((item) => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
      })),
    },
  ];
}

// ── Utility: find an item by ID in the tree ──────────────────────
export function findItemById(
  id: string,
  items: FinderItem[] = finderTree
): FinderItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(id, item.children);
      if (found) return found;
    }
  }
  return null;
}

// ── Utility: get children for a given path ───────────────────────
export function getItemsAtPath(path: string[]): FinderItem[] {
  if (path.length === 0) return finderTree;

  let current: FinderItem[] = finderTree;
  for (const id of path) {
    const folder = current.find((item) => item.id === id);
    if (!folder?.children) return [];
    current = folder.children;
  }
  return current;
}
