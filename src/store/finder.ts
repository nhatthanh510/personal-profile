import { create } from "zustand";
import useWindowStore from "@/store/window";
import {
  finderTree,
  findItemById,
  getItemsAtPath,
  SIDEBAR_SECTIONS,
  type FinderItem,
  type SidebarSection,
} from "@/windows/finder/finderData";

function buildBreadcrumbs(path: string[]) {
  const crumbs: { label: string; pathIndex: number }[] = [
    { label: "Finder", pathIndex: -1 },
  ];
  for (let i = 0; i < path.length; i++) {
    const item = findItemById(path[i], finderTree);
    if (item) crumbs.push({ label: item.name, pathIndex: i });
  }
  return crumbs;
}

interface FinderState {
  currentPath: string[];
  selectedItem: string | null;
  currentItems: FinderItem[];
  breadcrumbs: { label: string; pathIndex: number }[];
  sidebarSections: SidebarSection[];
  sidebarNavigate: (folderId: string) => void;
  breadcrumbNavigate: (index: number) => void;
  select: (id: string) => void;
  open: (item: FinderItem) => void;
}

const useFinderStore = create<FinderState>((set) => ({
  currentPath: [],
  selectedItem: null,
  currentItems: getItemsAtPath([]),
  breadcrumbs: buildBreadcrumbs([]),
  sidebarSections: SIDEBAR_SECTIONS,

  sidebarNavigate: (folderId) =>
    set({
      currentPath: [folderId],
      selectedItem: null,
      currentItems: getItemsAtPath([folderId]),
      breadcrumbs: buildBreadcrumbs([folderId]),
    }),

  breadcrumbNavigate: (index) =>
    set((s) => {
      const newPath = index < 0 ? [] : s.currentPath.slice(0, index + 1);
      return {
        currentPath: newPath,
        selectedItem: null,
        currentItems: getItemsAtPath(newPath),
        breadcrumbs: buildBreadcrumbs(newPath),
      };
    }),

  select: (id) => set({ selectedItem: id }),

  open: (item) => {
    if (item.type === "folder") {
      set((s) => {
        const newPath = [...s.currentPath, item.id];
        return {
          currentPath: newPath,
          selectedItem: null,
          currentItems: getItemsAtPath(newPath),
          breadcrumbs: buildBreadcrumbs(newPath),
        };
      });
      return;
    }

    const { openWindow } = useWindowStore.getState();
    if (item.type === "txt" && item.txtSrc) {
      openWindow("txtFile", { title: item.name, src: item.txtSrc });
    } else if (item.type === "image" && item.imageSrc) {
      openWindow("imgFile", { title: item.name, src: item.imageSrc });
    } else if (item.type === "pdf" && item.pdfSrc) {
      openWindow("pdfFile", { title: item.name, src: item.pdfSrc });
    }
  },
}));

export default useFinderStore;
