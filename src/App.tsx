import { Navbar, Welcome, Dock, Desktop } from '@/components'
import { Terminal, Finder, Safari, Contact, Gallery, ImageViewer, PDFViewer, TextViewer } from '@/windows'
import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

gsap.registerPlugin(Draggable);

function App() {
  return (
    <main>
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