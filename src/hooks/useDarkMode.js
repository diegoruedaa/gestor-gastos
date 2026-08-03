import { useEffect, useState } from 'react'

const STORAGE_KEY = 'gastos-app-dark-mode'

function getInitialDarkMode() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem(STORAGE_KEY, String(isDark))
  }, [isDark])

  return [isDark, setIsDark]
}
