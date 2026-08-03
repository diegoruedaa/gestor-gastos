import { useTranslation } from 'react-i18next'
import { DarkModeToggle } from '../components/shared/DarkModeToggle'
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher'

export function MobileLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t('common.appName')}
        </h1>
        <DarkModeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-base font-medium text-neutral-600 dark:text-neutral-300">
          {t('layout.mobilePlaceholder')}
        </p>
        <LanguageSwitcher />
      </main>
    </div>
  )
}
