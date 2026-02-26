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


export const dockApps = [
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

export const WINDOW_CONFIG = {
  openDuration: 0.35,
  closeDuration: 0.25,
  minimizeDuration: 0.4,
  restoreDuration: 0.35,
  defaultPosition: { x: 100, y: 60 },
} as const;