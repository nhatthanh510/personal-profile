import { create } from "zustand";

/**
 * Tracks which Finder window is currently showing which path.
 * Single source of truth — used by both Finder navigation and Desktop/Dock
 * to prevent duplicate windows for the same path.
 */
interface LocationState {
  /** windowId → current path segments */
  paths: Record<string, string[]>;
  setPath: (windowId: string, path: string[]) => void;
  removePath: (windowId: string) => void;
  findByPath: (path: string[]) => string | null;
}

const useLocationStore = create<LocationState>((set, get) => ({
  paths: {},

  setPath: (windowId, path) =>
    set((s) => ({ paths: { ...s.paths, [windowId]: path } })),

  removePath: (windowId) =>
    set((s) => {
      const { [windowId]: _, ...rest } = s.paths;
      return { paths: rest };
    }),

  findByPath: (path) => {
    const key = JSON.stringify(path);
    for (const [id, p] of Object.entries(get().paths)) {
      if (JSON.stringify(p) === key) return id;
    }
    return null;
  },
}));

export default useLocationStore;
