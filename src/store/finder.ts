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
  history: string[][];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  sidebarNavigate: (folderId: string) => void;
  breadcrumbNavigate: (index: number) => void;
  select: (id: string) => void;
  open: (item: FinderItem) => void;
  goBack: () => void;
  goForward: () => void;
}

function navigateTo(s: FinderState, newPath: string[]) {
  const newHistory = [...s.history.slice(0, s.historyIndex + 1), newPath];
  const newIndex = newHistory.length - 1;
  return {
    currentPath: newPath,
    selectedItem: null,
    currentItems: getItemsAtPath(newPath),
    breadcrumbs: buildBreadcrumbs(newPath),
    history: newHistory,
    historyIndex: newIndex,
    canGoBack: newIndex > 0,
    canGoForward: false,
  };
}

const useFinderStore = create<FinderState>((set) => ({
  currentPath: [],
  selectedItem: null,
  currentItems: getItemsAtPath([]),
  breadcrumbs: buildBreadcrumbs([]),
  sidebarSections: SIDEBAR_SECTIONS,
  history: [[]],
  historyIndex: 0,
  canGoBack: false,
  canGoForward: false,

  sidebarNavigate: (folderId) =>
    set((s) => navigateTo(s, [folderId])),

  breadcrumbNavigate: (index) =>
    set((s) => {
      const newPath = index < 0 ? [] : s.currentPath.slice(0, index + 1);
      return navigateTo(s, newPath);
    }),

  select: (id) => set({ selectedItem: id }),

  open: (item) => {
    if (item.type === "folder") {
      set((s) => navigateTo(s, [...s.currentPath, item.id]));
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

  goBack: () =>
    set((s) => {
      if (s.historyIndex <= 0) return s;
      const newIndex = s.historyIndex - 1;
      const newPath = s.history[newIndex];
      return {
        currentPath: newPath,
        selectedItem: null,
        currentItems: getItemsAtPath(newPath),
        breadcrumbs: buildBreadcrumbs(newPath),
        historyIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: true,
      };
    }),

  goForward: () =>
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const newIndex = s.historyIndex + 1;
      const newPath = s.history[newIndex];
      return {
        currentPath: newPath,
        selectedItem: null,
        currentItems: getItemsAtPath(newPath),
        breadcrumbs: buildBreadcrumbs(newPath),
        historyIndex: newIndex,
        canGoBack: true,
        canGoForward: newIndex < s.history.length - 1,
      };
    }),
}));

export default useFinderStore;
