import { LayoutDashboard, Plus, Receipt } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AddExpense } from '../components/shared/AddExpense'
import { ExpenseList } from '../components/shared/ExpenseList'
import { Modal } from '../components/shared/Modal'
import { SettingsPanel } from '../components/shared/SettingsPanel'
import { CategoryFilter } from '../components/desktop/CategoryFilter'
import { Dashboard } from '../components/desktop/Dashboard'
import { CategoryFilterProvider, useCategoryFilter } from '../lib/CategoryFilterContext'

const SCREENS = {
  dashboard: 'dashboard',
  expenses: 'expenses',
}

const NAV_ITEMS = [
  { screen: SCREENS.dashboard, labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { screen: SCREENS.expenses, labelKey: 'nav.expenses', icon: Receipt },
]

export function DesktopLayout() {
  return (
    <CategoryFilterProvider>
      <DesktopLayoutContent />
    </CategoryFilterProvider>
  )
}

function DesktopLayoutContent() {
  const { t } = useTranslation()
  const { categoryId, subcategoryId, clear: clearCategoryFilter } = useCategoryFilter()
  const [screen, setScreen] = useState(SCREENS.dashboard)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  // Ad hoc date-range + label chip for when the user drills into a period
  // from the Dashboard (e.g. clicking a category slice) — independent of
  // the persistent category filter, which lives in CategoryFilterContext.
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

  function handleJumpToExpenses(range) {
    setExpensesFilter({ startDate: range.start, endDate: range.end, label: range.label })
    setScreen(SCREENS.expenses)
  }

  function handleClearExpensesFilter() {
    setExpensesFilter(null)
    clearCategoryFilter()
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-neutral-950">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-neutral-200 dark:border-neutral-800">
        <div className="shrink-0 px-4 pb-2 pt-6">
          <h1 className="px-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {t('common.appName')}
          </h1>

          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-700"
          >
            <Plus size={18} />
            {t('nav.addExpense')}
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto px-4">
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

        <div className="shrink-0 border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
          <SettingsPanel />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-10 py-10">
          {screen === SCREENS.dashboard ? (
            <Dashboard onJumpToExpenses={handleJumpToExpenses} refreshKey={expensesVersion} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {t('nav.expenses')}
                </h2>
                <CategoryFilter />
              </div>
              <ExpenseList
                categoryId={categoryId}
                subcategoryId={subcategoryId}
                startDate={expensesFilter?.startDate}
                endDate={expensesFilter?.endDate}
                filterLabel={expensesFilter?.label}
                onClearFilter={expensesFilter ? handleClearExpensesFilter : null}
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
