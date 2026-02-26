import { Navbar, Welcome, Dock } from '@/components'
import { WindowManagerProvider } from '@/context/WindowManagerContext'
import { WindowLayer } from '@/components/WindowLayer'

function App() {
  return (
    <WindowManagerProvider>
      <main>
        <Navbar />
        <Welcome />
        <WindowLayer />
        <Dock />
      </main>
    </WindowManagerProvider>
  )
}

export default App