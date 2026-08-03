import { useTranslation } from 'react-i18next'
import { DarkModeToggle } from '../components/shared/DarkModeToggle'
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher'

export function DesktopLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-8 py-4 dark:border-neutral-800">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {t('common.appName')}
        </h1>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-8">
        <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
          {t('layout.desktopPlaceholder')}
        </p>
      </main>
    </div>
  )
}
