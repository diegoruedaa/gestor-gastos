import { useIsDesktop } from './hooks/useIsDesktop'
import { MobileLayout } from './layouts/MobileLayout'
import { DesktopLayout } from './layouts/DesktopLayout'

function App() {
  const isDesktop = useIsDesktop()

  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}

export default App
