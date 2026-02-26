import { createContext } from 'react';
import type { WindowId, WindowState } from '@/types/window';

export interface WindowManagerContextType {
  windows: Record<WindowId, WindowState>;
  openWindow: (id: WindowId) => void;
  hideWindow: (id: WindowId) => void;
  quitWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  toggleMaximize: (id: WindowId, fullSize?: { width: number; height: number }, fullPosition?: { x: number; y: number }) => void;
  updatePosition: (id: WindowId, position: { x: number; y: number }) => void;
}

export const WindowManagerContext = createContext<WindowManagerContextType | null>(null);
