import { useReducer, type ReactNode } from 'react';
import { type WindowId, type WindowState, DEFAULT_WINDOW_SIZES, CASCADE_OFFSET } from '@/types/window';
import { WINDOW_CONFIG } from '@/constants';
import { WindowManagerContext, type WindowManagerContextType } from './windowManagerState';

interface WindowManagerState {
  windows: Record<WindowId, WindowState>;
  topZIndex: number;
  openCount: number;
}

type Action =
  | { type: 'OPEN'; id: WindowId }
  | { type: 'HIDE'; id: WindowId }
  | { type: 'QUIT'; id: WindowId }
  | { type: 'MINIMIZE'; id: WindowId }
  | { type: 'FOCUS'; id: WindowId }
  | { type: 'TOGGLE_MAXIMIZE'; id: WindowId; fullSize?: { width: number; height: number }; fullPosition?: { x: number; y: number } }
  | { type: 'UPDATE_POSITION'; id: WindowId; position: { x: number; y: number } };

const WINDOW_IDS: WindowId[] = ['finder', 'safari', 'photos', 'contact', 'terminal'];

const createInitialState = (): WindowManagerState => {
  const windows = {} as Record<WindowId, WindowState>;
  for (const id of WINDOW_IDS) {
    windows[id] = {
      id,
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 0,
      preMaximize: null,
      position: { ...WINDOW_CONFIG.defaultPosition },
      size: { ...DEFAULT_WINDOW_SIZES[id] },
    };
  }
  return { windows, topZIndex: 100, openCount: 0 };
};

const reducer = (state: WindowManagerState, action: Action): WindowManagerState => {
  switch (action.type) {
    case 'OPEN': {
      const win = state.windows[action.id];
      if (win.isOpen && !win.isMinimized) {
        const nextZ = state.topZIndex + 1;
        return {
          ...state,
          topZIndex: nextZ,
          windows: {
            ...state.windows,
            [action.id]: { ...win, zIndex: nextZ },
          },
        };
      }
      const nextZ = state.topZIndex + 1;
      const cascadeIndex = win.isMinimized ? 0 : state.openCount;
      const position = win.isMinimized
        ? win.position
        : {
            x: WINDOW_CONFIG.defaultPosition.x + cascadeIndex * CASCADE_OFFSET,
            y: WINDOW_CONFIG.defaultPosition.y + cascadeIndex * CASCADE_OFFSET,
          };
      return {
        ...state,
        topZIndex: nextZ,
        openCount: win.isMinimized ? state.openCount : state.openCount + 1,
        windows: {
          ...state.windows,
          [action.id]: {
            ...win,
            isOpen: true,
            isMinimized: false,
            zIndex: nextZ,
            position,
          },
        },
      };
    }
    case 'HIDE': {
      const win = state.windows[action.id];
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...win, isMinimized: true },
        },
      };
    }
    case 'QUIT': {
      const win = state.windows[action.id];
      return {
        ...state,
        openCount: Math.max(0, state.openCount - 1),
        windows: {
          ...state.windows,
          [action.id]: {
            ...win,
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
            preMaximize: null,
          },
        },
      };
    }
    case 'MINIMIZE': {
      const win = state.windows[action.id];
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...win, isMinimized: true },
        },
      };
    }
    case 'FOCUS': {
      const nextZ = state.topZIndex + 1;
      return {
        ...state,
        topZIndex: nextZ,
        windows: {
          ...state.windows,
          [action.id]: { ...state.windows[action.id], zIndex: nextZ },
        },
      };
    }
    case 'TOGGLE_MAXIMIZE': {
      const win = state.windows[action.id];
      if (win.isMaximized && win.preMaximize) {
        return {
          ...state,
          windows: {
            ...state.windows,
            [action.id]: {
              ...win,
              isMaximized: false,
              position: win.preMaximize.position,
              size: win.preMaximize.size,
              preMaximize: null,
            },
          },
        };
      }
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: {
            ...win,
            isMaximized: true,
            preMaximize: { position: win.position, size: win.size },
            position: action.fullPosition ?? { x: 0, y: 0 },
            size: action.fullSize ?? { width: window.innerWidth, height: window.innerHeight },
          },
        },
      };
    }
    case 'UPDATE_POSITION': {
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...state.windows[action.id], position: action.position },
        },
      };
    }
    default:
      return state;
  }
};

export const WindowManagerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const value: WindowManagerContextType = {
    windows: state.windows,
    openWindow: (id) => dispatch({ type: 'OPEN', id }),
    hideWindow: (id) => dispatch({ type: 'HIDE', id }),
    quitWindow: (id) => dispatch({ type: 'QUIT', id }),
    minimizeWindow: (id) => dispatch({ type: 'MINIMIZE', id }),
    focusWindow: (id) => dispatch({ type: 'FOCUS', id }),
    toggleMaximize: (id, fullSize, fullPosition) => dispatch({ type: 'TOGGLE_MAXIMIZE', id, fullSize, fullPosition }),
    updatePosition: (id, position) => dispatch({ type: 'UPDATE_POSITION', id, position }),
  };

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  );
};
