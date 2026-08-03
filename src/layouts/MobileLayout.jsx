import { CirclePlus, LogOut, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddExpense } from '../components/shared/AddExpense'
import { Card } from '../components/shared/Card'
import { DarkModeToggle } from '../components/shared/DarkModeToggle'
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher'
import { useAuth } from '../lib/AuthContext'

const SCREENS = {
  add: 'add',
  expenses: 'expenses',
}

const NAV_ITEMS = [
  { screen: SCREENS.add, labelKey: 'nav.add', icon: CirclePlus },
  { screen: SCREENS.expenses, labelKey: 'nav.expenses', icon: Receipt },
]

export function MobileLayout() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const [screen, setScreen] = useState(SCREENS.add)

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t('common.appName')}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <DarkModeToggle iconOnly />
          <button
            type="button"
            onClick={signOut}
            aria-label={t('auth.signOut')}
            className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-24">
        {screen === SCREENS.add ? (
          <div className="flex flex-1 flex-col pt-4">
            <AddExpense />
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              {t('nav.expenses')}
            </h2>
            <Card className="flex flex-1 items-center justify-center text-center">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t('layout.expensesListPlaceholder')}
              </p>
            </Card>
          </div>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map(({ screen: itemScreen, labelKey, icon: Icon }) => {
            const isActive = screen === itemScreen
            return (
              <button
                key={itemScreen}
                type="button"
                onClick={() => setScreen(itemScreen)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-accent-600 dark:text-accent-400'
                    : 'text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.25 : 2} />
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
