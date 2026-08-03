import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gastos-app-dark-mode'

// No stored preference yet (new user/session) defaults to dark rather than
// following the OS preference, so the always-dark Login screen doesn't hand
// off to a jarring white flash on first run.
function getInitialDarkMode() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return true
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(STORAGE_KEY, String(isDark))
  }, [isDark])

  return [isDark, setIsDark]
}
