// ── Finder file tree data ─────────────────────────────────────────

export interface FinderItem {
  id: string;
  name: string;
  type: "folder" | "txt" | "pdf" | "image" | "figma";
  icon: string;
  content?: string;
  imageSrc?: string;
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
            content: [
              "Portfolio OS",
              "============",
              "",
              "A macOS-inspired interactive portfolio built with",
              "React 19, TypeScript, Tailwind CSS, and GSAP.",
              "",
              "Features:",
              "- Draggable, resizable windows with minimize/maximize",
              "- Dock with magnification effect",
              "- Finder, Terminal, Safari, and more",
              "",
              "Tech: React 19 | TypeScript | Vite | Tailwind v4 | GSAP | Zustand",
            ].join("\n"),
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
            content: [
              "E-Commerce App",
              "==============",
              "",
              "Full-stack e-commerce platform with product management,",
              "cart system, Stripe payments, and admin dashboard.",
              "",
              "Features:",
              "- Product catalog with search and filters",
              "- Shopping cart with real-time updates",
              "- Stripe checkout integration",
              "- Admin panel for inventory management",
              "",
              "Tech: Next.js | Node.js | PostgreSQL | Stripe | Tailwind CSS",
            ].join("\n"),
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
            content: [
              "Chat Platform",
              "=============",
              "",
              "Real-time messaging application with channels,",
              "direct messages, and file sharing.",
              "",
              "Features:",
              "- Real-time messaging via WebSockets",
              "- Channel and DM support",
              "- File and image sharing",
              "- Message search and reactions",
              "",
              "Tech: React | Socket.io | Express | MongoDB | Redis",
            ].join("\n"),
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
      },
      {
        id: "cover-letter",
        name: "CoverLetter.txt",
        type: "txt",
        icon: ICONS.txt,
        content: [
          "Dear Hiring Manager,",
          "",
          "I am writing to express my interest in the Full-Stack",
          "Developer position at your company.",
          "",
          "With over 5 years of experience building modern web",
          "applications, I bring expertise in React, TypeScript,",
          "Node.js, and cloud infrastructure. I am passionate",
          "about creating intuitive, performant user experiences",
          "and writing clean, maintainable code.",
          "",
          "I would love the opportunity to discuss how my skills",
          "and experience align with your team's goals.",
          "",
          "Best regards,",
          "Nhat Thanh",
        ].join("\n"),
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
