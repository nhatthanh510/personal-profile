export type WindowId = 'finder' | 'safari' | 'photos' | 'contact' | 'terminal';

export interface WindowState {
  id: WindowId;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  preMaximize: { position: { x: number; y: number }; size: { width: number; height: number } } | null;
}

export const DEFAULT_WINDOW_SIZES: Record<WindowId, { width: number; height: number }> = {
  finder:   { width: 800, height: 500 },
  safari:   { width: 850, height: 550 },
  photos:   { width: 750, height: 500 },
  contact:  { width: 600, height: 450 },
  terminal: { width: 700, height: 450 },
};

export const CASCADE_OFFSET = 30;
