export const navLinks = [
  { id: 1, name: 'Projects' },
  { id: 2, name: 'Contact' },
  { id: 3, name: 'Resume' },
];

export const navIcons = [
  { id: 1, image: '/icons/wifi.svg' },
  { id: 2, image: '/icons/search.svg' },
  { id: 3, image: '/icons/user.svg' },
  { id: 4, image: '/icons/mode.svg' },
];


export interface DockApp {
  id: string;
  name: string;
  icon: string;
  canOpen: boolean;
}

export const dockApps: DockApp[] = [
  {
    id: 'finder',
    name: "Portfolio",
    icon: "finder.png",
    canOpen: true
  },
  {
    id: 'safari',
    name: "Articles",
    icon: "safari.png",
    canOpen: true
  },
  {
    id: 'photos',
    name: "Gallery",
    icon: "photos.png",
    canOpen: true
  },
  {
    id: 'contact',
    name: "Contact",
    icon: "contact.png",
    canOpen: true
  },
  {
    id: 'terminal',
    name: "Skills",
    icon: "terminal.png",
    canOpen: true
  },
  {
    id: 'trash',
    name: "Archive",
    icon: "trash.png",
    canOpen: false
  }
]


export const DOCK_CONFIG = {
  baseSize: 50,
  maxScale: 1.8,
  magnifyRange: 150,
  animDuration: 0.3,
  bounceDuration: 0.6,
} as const;

export const INITIAL_INDEX = 1000;

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FileViewerData {
  title: string;
  src: string;
}

export interface WindowConfig {
  isOpen: boolean;
  zIndex: number;
  data: FileViewerData | null;
  x: number | null;
  y: number | null;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  prevGeometry: WindowGeometry | null;
}

export const WINDOW_DEFAULTS: Record<string, { width: number; height: number }> = {
  finder:   { width: 800, height: 500 },
  safari:   { width: 900, height: 560 },
  photos:   { width: 860, height: 540 },
  contact:  { width: 700, height: 480 },
  terminal: { width: 680, height: 460 },
  resume:   { width: 640, height: 500 },
  txtFile:  { width: 600, height: 400 },
  imgFile:  { width: 720, height: 500 },
  pdfFile:  { width: 700, height: window.innerHeight - 80 },
};

function createWindowConfig(key: string): WindowConfig {
  const defaults = WINDOW_DEFAULTS[key] ?? { width: 680, height: 460 };
  return {
    isOpen: false,
    zIndex: INITIAL_INDEX,
    data: null,
    x: null,
    y: null,
    width: defaults.width,
    height: defaults.height,
    isMinimized: false,
    isMaximized: false,
    prevGeometry: null,
  };
}

export const WINDOW_KEYS = ['contact', 'resume', 'safari', 'photos', 'terminal', 'txtFile', 'imgFile', 'pdfFile'] as const;

export type WindowKey = (typeof WINDOW_KEYS)[number];

export type WindowsConfig = Record<string, WindowConfig>;

export const WINDOWS_CONFIG: WindowsConfig = Object.fromEntries(
  WINDOW_KEYS.map(k => [k, createWindowConfig(k)])
);

export { createWindowConfig };