import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { INITIAL_INDEX, WINDOWS_CONFIG, type WindowsConfig, type WindowKey, type FileViewerData } from '@/constants';

interface WindowState {
  windows: WindowsConfig;
  nextZIndex: number;
  openWindow: (windowKey: WindowKey, data?: FileViewerData | null) => void;
  closeWindow: (windowKey: WindowKey) => void;
  focusWindow: (windowKey: WindowKey) => void;
  minimizeWindow: (windowKey: WindowKey) => void;
  unminimizeWindow: (windowKey: WindowKey) => void;
  toggleMaximize: (windowKey: WindowKey) => void;
  updatePosition: (windowKey: WindowKey, x: number, y: number) => void;
}

const useWindowStore = create<WindowState, [['zustand/immer', never]]>(
  immer((set) => ({
    windows: WINDOWS_CONFIG,
    nextZIndex: INITIAL_INDEX + 1,

    openWindow: (windowKey, data = null) => set((state) => {
      const win = state.windows[windowKey];
      win.isOpen = true;
      win.isMinimized = false;
      win.zIndex = state.nextZIndex++;
      win.data = data ?? win.data;
    }),

    closeWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
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
      win.zIndex = state.nextZIndex++;
    }),

    minimizeWindow: (windowKey) => set((state) => {
      state.windows[windowKey].isMinimized = true;
    }),

    unminimizeWindow: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
      win.isMinimized = false;
      win.zIndex = state.nextZIndex++;
    }),

    toggleMaximize: (windowKey) => set((state) => {
      const win = state.windows[windowKey];
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
      win.x = x;
      win.y = y;
    }),
  }))
);

export default useWindowStore;
