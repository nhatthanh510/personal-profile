import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

const BOOT_LINES = [
  '[BIOS] POST check passed',
  '[BIOS] Memory: 16384 MB OK',
  'Loading kernel...',
  '[  0.000000] Nathan OS v2.0.26 (portfolio-x86_64)',
  '[  0.031200] CPU: Apple Silicon @ 3.2GHz',
  '[  0.058400] Initializing kernel subsystems...',
  '[  0.124800] Memory management initialized',
  '[  0.186200] Loading modules...',
  '[  0.248600] Module: portfolio-core loaded',
  '[  0.311000] Module: project-renderer loaded',
  '[  0.373400] Module: contact-handler loaded',
  '[  0.435800] Mounting /portfolio...',
  '[  0.498200] Filesystem mounted: /home/nathan',
  '[  0.560600] Starting services...',
  '[  0.623000] Service: desktop-compositor [OK]',
  '[  0.685400] Service: window-manager [OK]',
  '[  0.747800] Service: dock-service [OK]',
  '[  0.810200] All systems operational',
  '[  0.872600] Starting desktop environment...',
]

const BOOT_DURATION = 1 // seconds
const LINE_INTERVAL = (BOOT_DURATION * 1000) / BOOT_LINES.length // sync lines with progress bar

interface BootScreenProps {
  onComplete: () => void
}

export function BootScreen({ onComplete }: BootScreenProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const completedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const progressTrackRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const linesEndRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const lineTimersRef = useRef<number[]>([])

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    tlRef.current?.kill()
    lineTimersRef.current.forEach(clearTimeout)

    const container = containerRef.current
    const logo = logoRef.current
    const progressTrack = progressTrackRef.current
    const log = logRef.current
    if (!container || !logo || !progressTrack) {
      onComplete()
      return
    }

    // Exit sequence: logo falls, rest fades, then screen out
    const exitTl = gsap.timeline({ onComplete })

    // Progress bar + boot log fade out
    exitTl.to([progressTrack, log], {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    })

    // Logo drops down off screen with gentle gravity
    exitTl.to(logo, {
      y: '120vh',
      duration: 1.4,
      ease: 'power2.in',
    }, '<')

    // Screen fades out as logo falls
    exitTl.to(container, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    }, '-=0.3')
  }, [onComplete])

  // GSAP progress bar + staggered boot lines
  useEffect(() => {
    const bar = progressRef.current
    if (!bar) return

    const tl = gsap.timeline({ onComplete: finish })
    tlRef.current = tl

    // Progress bar — macOS-style pacing
    tl.to(bar, { width: '30%', duration: BOOT_DURATION * 0.35, ease: 'power1.inOut' })
      .to(bar, { width: '55%', duration: BOOT_DURATION * 0.15, ease: 'power2.out' })
      .to(bar, { width: '60%', duration: BOOT_DURATION * 0.1, ease: 'none' })
      .to(bar, { width: '85%', duration: BOOT_DURATION * 0.2, ease: 'power1.in' })
      .to(bar, { width: '100%', duration: BOOT_DURATION * 0.2, ease: 'power2.inOut' })

    // Boot lines — staggered to match progress duration
    const timers = lineTimersRef.current
    BOOT_LINES.forEach((line, i) => {
      const id = window.setTimeout(() => {
        setVisibleLines(prev => [...prev, line])
      }, i * LINE_INTERVAL)
      timers.push(id)
    })

    return () => {
      tl.kill()
      timers.forEach(clearTimeout)
    }
  }, [finish])

  // Auto-scroll log to bottom
  useEffect(() => {
    linesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [visibleLines])

  // Skip on any key / click / touch
  useEffect(() => {
    const skip = () => finish()
    window.addEventListener('keydown', skip)
    window.addEventListener('click', skip)
    window.addEventListener('touchstart', skip)
    return () => {
      window.removeEventListener('keydown', skip)
      window.removeEventListener('click', skip)
      window.removeEventListener('touchstart', skip)
    }
  }, [finish])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col bg-black"
    >
      {/* Center: Apple logo + progress bar */}
      <div className="flex flex-1 flex-col items-center justify-center">
        {/* Apple logo */}
        <svg
          ref={logoRef}
          className="mb-20 h-14 w-14 text-white"
          viewBox="0 0 814 1000"
          fill="currentColor"
        >
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.3-105.9-207.6-105.9-328.3 0-193 125.5-295.5 248.8-295.5 65.6 0 120.2 43.1 161.5 43.1 39.3 0 100.5-45.7 174.3-45.7 28.2 0 129.3 2.6 196.1 99.8zM554.1 159.4c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.2 32.4-56.2 83.6-56.2 135.6 0 7.8.7 15.6 1.3 18.1 2.6.5 6.4.6 10.2.6 45.9 0 103.6-30.4 140.6-70.7z" />
        </svg>

        {/* Progress bar */}
        <div ref={progressTrackRef} className="h-1.5 w-52 overflow-hidden rounded-full bg-white/20">
          <div
            ref={progressRef}
            className="h-full w-0 rounded-full bg-white"
          />
        </div>
      </div>

      {/* Bottom: scrolling boot log */}
      <div ref={logRef} className="h-36 overflow-hidden border-t border-white/5 px-4 py-3 font-roboto text-[10px] leading-snug text-[#4ade80]/60 sm:px-8 sm:text-xs">
        <div className="flex flex-col">
          {visibleLines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
          <div ref={linesEndRef} />
        </div>
      </div>
    </div>
  )
}
