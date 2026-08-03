import { LayoutDashboard, LogOut, Plus, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddExpense } from '../components/shared/AddExpense'
import { DarkModeToggle } from '../components/shared/DarkModeToggle'
import { ExpenseList } from '../components/shared/ExpenseList'
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher'
import { Modal } from '../components/shared/Modal'
import { Dashboard } from '../components/desktop/Dashboard'
import { useAuth } from '../lib/AuthContext'

const SCREENS = {
  dashboard: 'dashboard',
  expenses: 'expenses',
}

const NAV_ITEMS = [
  { screen: SCREENS.dashboard, labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { screen: SCREENS.expenses, labelKey: 'nav.expenses', icon: Receipt },
]

export function DesktopLayout() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const [screen, setScreen] = useState(SCREENS.dashboard)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [expensesFilter, setExpensesFilter] = useState(null)
  // Bumped whenever an expense is added from the sidebar modal, so the
  // currently visible screen (which doesn't remount when the modal closes)
  // refetches instead of showing stale data.
  const [expensesVersion, setExpensesVersion] = useState(0)

  function handleExpenseAdded() {
    setIsAddExpenseOpen(false)
    setExpensesVersion((current) => current + 1)
  }

  function handleNavClick(nextScreen) {
    if (nextScreen === SCREENS.expenses) setExpensesFilter(null)
    setScreen(nextScreen)
  }

  function handleSelectCategory(category, range) {
    setExpensesFilter({ categoryId: category.id, startDate: range.start, endDate: range.end, label: range.label })
    setScreen(SCREENS.expenses)
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-neutral-950">
      <aside className="flex w-64 shrink-0 flex-col border-r border-neutral-200 px-4 py-6 dark:border-neutral-800">
        <h1 className="px-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t('common.appName')}
        </h1>

        <button
          type="button"
          onClick={() => setIsAddExpenseOpen(true)}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-700"
        >
          <Plus size={18} />
          {t('nav.addExpense')}
        </button>

        <nav className="mt-8 flex flex-col gap-1">
          {NAV_ITEMS.map(({ screen: itemScreen, labelKey, icon: Icon }) => {
            const isActive = screen === itemScreen
            return (
              <button
                key={itemScreen}
                type="button"
                onClick={() => handleNavClick(itemScreen)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900'
                }`}
              >
                <Icon size={18} />
                {t(labelKey)}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 px-2 pt-6">
          <LanguageSwitcher />
          <DarkModeToggle />
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <LogOut size={18} />
            {t('auth.signOut')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-10 py-10">
          {screen === SCREENS.dashboard ? (
            <Dashboard onSelectCategory={handleSelectCategory} refreshKey={expensesVersion} />
          ) : (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {t('nav.expenses')}
              </h2>
              <ExpenseList
                categoryId={expensesFilter?.categoryId}
                startDate={expensesFilter?.startDate}
                endDate={expensesFilter?.endDate}
                filterLabel={expensesFilter?.label}
                onClearFilter={() => setExpensesFilter(null)}
                refreshKey={expensesVersion}
              />
            </div>
          )}
        </div>
      </main>

      <Modal
        open={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        title={t('nav.addExpense')}
      >
        <AddExpense onSaved={handleExpenseAdded} />
      </Modal>
    </div>
  )
}
