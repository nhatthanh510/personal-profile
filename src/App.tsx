import { useState, useRef, useLayoutEffect } from 'react'
import { Navbar, Welcome, Dock, Desktop } from '@/components'
import { Terminal, Finder, Safari, Contact, Gallery, ImageViewer, PDFViewer, TextViewer } from '@/windows'
import { BootScreen } from '@/components/BootScreen'
import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

gsap.registerPlugin(Draggable);

function App() {
  const [booted, setBooted] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  // Desktop entrance — staggered macOS-style reveal
  useLayoutEffect(() => {
    if (!booted || !mainRef.current) return
    const main = mainRef.current

    // Wallpaper fades in
    gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out' })

    // Menu bar drops from top
    const nav = main.querySelector('nav')
    if (nav) {
      gsap.fromTo(nav, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 })
    }

    // Desktop icons pop in
    const icons = main.querySelectorAll('.desktop-icon')
    if (icons.length) {
      gsap.fromTo(icons, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.4)', stagger: 0.05, delay: 0.4 })
    }

    // Dock slides up from bottom
    const dock = main.querySelector('#dock')
    if (dock) {
      gsap.fromTo(dock, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.5 })
    }
  }, [booted])

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />
  }

  return (
    <main ref={mainRef}>
      <Navbar />
      <Welcome />
      <Desktop />
      <Dock />
      <Terminal />
      <Finder />
      <Safari />
      <Contact />
      <Gallery />
      <ImageViewer />
      <PDFViewer />
      <TextViewer />
    </main>
  )
}

export default App