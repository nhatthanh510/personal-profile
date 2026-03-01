import { useState } from 'react'
import { Navbar, Welcome, Dock, Desktop } from '@/components'
import { Terminal, Finder, Safari, Contact, Gallery, ImageViewer, PDFViewer, TextViewer } from '@/windows'
import { BootScreen } from '@/components/BootScreen'
import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

gsap.registerPlugin(Draggable);

function App() {
  const [booted, setBooted] = useState(false)

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />
  }

  return (
    <main className="animate-fade-in">
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