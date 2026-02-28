import { Navbar, Welcome, Dock } from '@/components'
import { Terminal, Finder, Safari, Contact } from '@/windows'
import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

gsap.registerPlugin(Draggable);

function App() {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />
      <Terminal />
      <Finder />
      <Safari />
      <Contact />
    </main>
  )
}

export default App