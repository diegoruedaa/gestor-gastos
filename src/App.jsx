import { useIsDesktop } from './hooks/useIsDesktop'
import { MobileLayout } from './layouts/MobileLayout'
import { DesktopLayout } from './layouts/DesktopLayout'
import { Login } from './pages/Login'
import { useAuth } from './lib/AuthContext'

function App() {
  const isDesktop = useIsDesktop()
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-white dark:bg-neutral-950" />
  }

  if (!session) {
    return <Login />
  }

  return isDesktop ? <DesktopLayout /> : <MobileLayout />
}

export default App
