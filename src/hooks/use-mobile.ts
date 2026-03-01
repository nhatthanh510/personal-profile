import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 640  // Tailwind sm
const COMPACT_BREAKPOINT = 1024 // Tailwind lg

const useMediaQuery = (query: string): boolean => {
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(query)
    mql.addEventListener("change", callback)
    return () => mql.removeEventListener("change", callback)
  }

  const getSnapshot = () => window.matchMedia(query).matches

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export const useIsMobile = () =>
  useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

export const useIsCompact = () =>
  useMediaQuery(`(max-width: ${COMPACT_BREAKPOINT - 1}px)`)
