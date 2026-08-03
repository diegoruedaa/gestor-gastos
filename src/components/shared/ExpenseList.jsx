import { Loader2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useExpenses } from '../../hooks/useExpenses'
import { formatIsoDate, getMonthKey } from '../../lib/date'
import { AmountDisplay } from './AmountDisplay'
import { Card } from './Card'
import { CategoryIcon } from './CategoryIcon'
import { ExpenseDetailModal } from './ExpenseDetailModal'
import { PaymentMethodIcon } from './PaymentMethodIcon'

// Groups by calendar month (rather than by day) so a long, all-time list
// stays scannable — each row already carries its own day, so the month
// header is enough context without producing a header per day.
function groupByMonth(expenses, locale) {
  const order = []
  const byKey = new Map()

  for (const expense of expenses) {
    const key = getMonthKey(expense.date)
    if (!byKey.has(key)) {
      byKey.set(key, { key, items: [], total: 0 })
      order.push(key)
    }
    const group = byKey.get(key)
    group.items.push(expense)
    group.total += expense.amount
  }

  return order.map((key) => {
    const group = byKey.get(key)
    return {
      ...group,
      label: formatIsoDate(`${key}-01`, locale, { month: 'long', year: 'numeric' }),
    }
  })
}

export function ExpenseList({
  categoryId = null,
  subcategoryId = null,
  startDate = null,
  endDate = null,
  filterLabel = null,
  onClearFilter = null,
  refreshKey = null,
}) {
  const { t, i18n } = useTranslation()
  const { expenses, loading, error, refetch } = useExpenses({ categoryId, subcategoryId, startDate, endDate })
  const [selectedExpense, setSelectedExpense] = useState(null)

  // `refreshKey` lets a parent (e.g. the sidebar's "add expense" modal)
  // signal that data changed elsewhere without remounting this list.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    refetch()
  }, [refreshKey, refetch])

  const groups = useMemo(
    () => groupByMonth(expenses, i18n.resolvedLanguage),
    [expenses, i18n.resolvedLanguage],
  )

  function handleChanged() {
    refetch()
  }

  return (
    <div className="flex flex-col gap-4">
      {filterLabel ? (
        <div className="flex items-center gap-1.5 self-start rounded-full bg-accent-50 py-1.5 pl-3 pr-1.5 text-xs font-medium text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
          <span>{filterLabel}</span>
          {onClearFilter ? (
            <button
              type="button"
              onClick={onClearFilter}
              aria-label={t('common.clearFilter')}
              className="rounded-full p-1 transition-colors hover:bg-accent-100 dark:hover:bg-accent-900/60"
            >
              <X size={12} />
            </button>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-neutral-400" size={22} />
        </div>
      ) : error ? (
        <Card className="text-center text-sm font-medium text-red-600 dark:text-red-400">
          {t('expenses.loadError')}
        </Card>
      ) : groups.length === 0 ? (
        <Card className="text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {t('expenses.empty')}
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.key} className="p-0">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {group.label}
              </h3>
              <AmountDisplay amount={group.total} size="sm" className="text-neutral-500 dark:text-neutral-400" />
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {group.items.map((expense) => (
                <button
                  key={expense.id}
                  type="button"
                  onClick={() => setSelectedExpense(expense)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                >
                  <CategoryIcon
                    icon={expense.subcategory?.icon ?? expense.category?.icon}
                    color={expense.category?.color}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {expense.subcategory?.name ?? expense.category?.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatIsoDate(expense.date, i18n.resolvedLanguage, { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <PaymentMethodIcon method={expense.payment_method} />
                  <AmountDisplay amount={expense.amount} size="sm" />
                </button>
              ))}
            </div>
          </Card>
        ))
      )}

      <ExpenseDetailModal
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onChanged={handleChanged}
      />
    </div>
  )
}
