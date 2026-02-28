import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  INITIAL_INDEX,
  WINDOWS_CONFIG,
  WINDOW_KEYS,
  createWindowConfig,
  type WindowsConfig,
  type FileViewerData,
} from '@/constants';

interface WindowState {
  windows: WindowsConfig;
  nextZIndex: number;
  finderNextId: number;
  openWindow: (windowKey: string, data?: FileViewerData | null) => void;
  closeWindow: (windowKey: string) => void;
  focusWindow: (windowKey: string) => void;
  minimizeWindow: (windowKey: string) => void;
  unminimizeWindow: (windowKey: string) => void;
  toggleMaximize: (windowKey: string) => void;
  updatePosition: (windowKey: string, x: number, y: number) => void;
  addWindow: (id: string, overrides?: Partial<WindowsConfig[string]>) => void;
  removeWindow: (id: string) => void;
  openNewFinder: () => string;
}

const useWindowStore = create<WindowState, [['zustand/immer', never]]>(
  immer((set, get) => ({
    windows: WINDOWS_CONFIG,
    nextZIndex: INITIAL_INDEX + 1,
    finderNextId: 0,

    addWindow: (id, overrides) => set((state) => {
      state.windows[id] = { ...createWindowConfig('finder'), ...overrides };
    }),

    removeWindow: (id) => set((state) => {
      delete state.windows[id];
    }),

    openWindow: (windowKey, data = null) => set((state) => {
      const win = state.windows[windowKey];
      if (!win) return;
      win.isOpen = true;
      win.isMinimized = false;
      win.zIndex = state.nextZIndex++;
      win.data = data ?? win.data;
    }),

    closeWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (!win) return;
      // For dynamic windows (not in WINDOW_KEYS), remove entirely
      const isStatic = (WINDOW_KEYS as readonly string[]).includes(windowKey);
      if (!isStatic) {
        delete state.windows[windowKey];
        return;
      }
      win.isOpen = false;
      win.zIndex = INITIAL_INDEX;
      win.data = null;
      win.isMinimized = false;
      win.isMaximized = false;
      win.prevGeometry = null;
      win.x = null;
      win.y = null;
    }),

    focusWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (win) win.zIndex = state.nextZIndex++;
    }),

    minimizeWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (win) win.isMinimized = true;
    }),

    unminimizeWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (!win) return;
      win.isMinimized = false;
      win.zIndex = state.nextZIndex++;
    }),

    toggleMaximize: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      if (!win) return;
      if (win.isMaximized) {
        if (win.prevGeometry) {
          win.x = win.prevGeometry.x;
          win.y = win.prevGeometry.y;
          win.width = win.prevGeometry.width;
          win.height = win.prevGeometry.height;
        }
        win.isMaximized = false;
        win.prevGeometry = null;
      } else {
        win.prevGeometry = {
          x: win.x ?? 0,
          y: win.y ?? 0,
          width: win.width,
          height: win.height,
        };
        win.isMaximized = true;
      }
    }),

    updatePosition: (windowKey, x, y) => set((state) => {
      const win = state.windows[windowKey];
      if (win) {
        win.x = x;
        win.y = y;
      }
    }),

    openNewFinder: () => {
      const state = get();
      const id = `finder-${state.finderNextId}`;
      const cascade = state.finderNextId * 30;
      set((s) => {
        s.finderNextId++;
        s.windows[id] = {
          ...createWindowConfig('finder'),
          isOpen: true,
          zIndex: s.nextZIndex++,
          x: (window.innerWidth - 800) / 2 + cascade,
          y: (window.innerHeight - 500) / 2 + cascade,
        };
      });
      return id;
    },
  }))
);

export default useWindowStore;
