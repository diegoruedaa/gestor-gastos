import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDarkMode } from '../../hooks/useDarkMode'

export function DarkModeToggle({ iconOnly = false }) {
  const { t } = useTranslation()
  const [isDark, setIsDark] = useDarkMode()

  return (
    <button
      type="button"
      onClick={() => setIsDark((prev) => !prev)}
      aria-label={t('settings.darkMode')}
      title={t('settings.darkMode')}
      className={
        iconOnly
          ? 'inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white p-2 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
          : 'inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
      }
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {!iconOnly && t('settings.darkMode')}
    </button>
  )
}
