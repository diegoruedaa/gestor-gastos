import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '../../hooks/useCategories'
import { useExpenses } from '../../hooks/useExpenses'
import { useDarkMode } from '../../hooks/useDarkMode'
import { useCategoryFilter } from '../../lib/CategoryFilterContext'
import {
  formatIsoDate,
  getLastMonthsRange,
  getMonthKey,
  getMonthRange,
  getTodayIso,
  parseIsoDate,
} from '../../lib/date'
import { formatCurrency } from '../../lib/currency'
import { AmountDisplay } from '../shared/AmountDisplay'
import { Card } from '../shared/Card'
import { CategoryIcon } from '../shared/CategoryIcon'
import { CategoryDonutChart } from './CategoryDonutChart'
import { CategoryFilter } from './CategoryFilter'
import { DateRangeFilter } from './DateRangeFilter'
import { MonthlyTrendChart } from './MonthlyTrendChart'

const TREND_MONTHS = 6
const TOP_CATEGORIES_LIMIT = 5

function sumAmount(expenses) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

function groupByCategory(expenses) {
  const byId = new Map()
  for (const expense of expenses) {
    if (!expense.category) continue
    if (!byId.has(expense.category_id)) {
      byId.set(expense.category_id, { category: expense.category, amount: 0 })
    }
    byId.get(expense.category_id).amount += expense.amount
  }

  const total = [...byId.values()].reduce((sum, entry) => sum + entry.amount, 0)
  return [...byId.values()]
    .map((entry) => ({ ...entry, percent: total > 0 ? Math.round((entry.amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
}

// Same idea as groupByCategory, one level down — used to rank subcategories
// within a single category once the shared CategoryFilter has narrowed the
// dashboard to it (see the "no category selected" vs "one category selected"
// branches below).
function groupBySubcategory(expenses) {
  const byId = new Map()
  for (const expense of expenses) {
    if (!expense.subcategory) continue
    if (!byId.has(expense.subcategory_id)) {
      byId.set(expense.subcategory_id, { subcategory: expense.subcategory, amount: 0 })
    }
    byId.get(expense.subcategory_id).amount += expense.amount
  }

  const total = [...byId.values()].reduce((sum, entry) => sum + entry.amount, 0)
  return [...byId.values()]
    .map((entry) => ({ ...entry, percent: total > 0 ? Math.round((entry.amount / total) * 100) : 0 }))
    .sort((a, b) => b.amount - a.amount)
}

function daysElapsed(range, isOngoingMonth) {
  const start = parseIsoDate(range.start)
  const end = isOngoingMonth ? parseIsoDate(getTodayIso()) : parseIsoDate(range.end)
  return Math.max(1, Math.round((end - start) / 86_400_000) + 1)
}

// Dashboard is desktop-only: mobile prioritizes quick capture (see
// MobileLayout), so this never renders there.
export function Dashboard({ onJumpToExpenses, refreshKey = null }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage
  const [isDark] = useDarkMode()
  const { categories } = useCategories()
  const { categoryId, subcategoryId, selectCategory, selectSubcategory } = useCategoryFilter()

  const [mode, setMode] = useState('month')
  const [monthOffset, setMonthOffset] = useState(0)
  const [customStart, setCustomStart] = useState(() => getMonthRange(0).start)
  const [customEnd, setCustomEnd] = useState(getTodayIso)

  const monthRange = useMemo(() => getMonthRange(monthOffset), [monthOffset])
  const previousMonthRange = useMemo(() => getMonthRange(monthOffset - 1), [monthOffset])
  const isCurrentMonth = monthOffset === 0

  const activeRange = useMemo(
    () => (mode === 'month' ? monthRange : { start: customStart, end: customEnd }),
    [mode, monthRange, customStart, customEnd],
  )
  const monthLabel = useMemo(
    () => formatIsoDate(monthRange.start, locale, { month: 'long', year: 'numeric' }),
    [monthRange, locale],
  )
  const periodLabel =
    mode === 'month'
      ? monthLabel
      : `${formatIsoDate(customStart, locale, { day: 'numeric', month: 'short' })} – ${formatIsoDate(customEnd, locale, { day: 'numeric', month: 'short' })}`

  // The selected category/subcategory (full objects, with name/icon) come
  // from useCategories rather than the expense rows, so titles and the
  // trend chart still resolve a name even when the filtered range has zero
  // expenses.
  const selectedCategory = useMemo(
    () => (categoryId ? categories.find((category) => category.id === categoryId) ?? null : null),
    [categories, categoryId],
  )
  const selectedSubcategory = useMemo(
    () =>
      subcategoryId
        ? selectedCategory?.subcategories?.find((subcategory) => subcategory.id === subcategoryId) ?? null
        : null,
    [selectedCategory, subcategoryId],
  )
  const filterEntityLabel = selectedSubcategory?.name ?? selectedCategory?.name ?? null

  const {
    expenses: currentExpenses,
    loading: currentLoading,
    refetch: refetchCurrent,
  } = useExpenses({ startDate: activeRange.start, endDate: activeRange.end, categoryId, subcategoryId })
  const {
    expenses: previousExpenses,
    loading: previousLoading,
    refetch: refetchPrevious,
  } = useExpenses({
    startDate: previousMonthRange.start,
    endDate: previousMonthRange.end,
    categoryId,
    subcategoryId,
    enabled: mode === 'month',
  })
  const trendRange = useMemo(() => getLastMonthsRange(TREND_MONTHS), [])
  const {
    expenses: trendExpenses,
    loading: trendLoading,
    refetch: refetchTrend,
  } = useExpenses({ startDate: trendRange.start, endDate: trendRange.end, categoryId, subcategoryId })

  // See ExpenseList's identical pattern: a parent-driven signal that data
  // changed elsewhere (the sidebar's "add expense" modal), without this
  // screen remounting.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    refetchCurrent()
    refetchPrevious()
    refetchTrend()
  }, [refreshKey, refetchCurrent, refetchPrevious, refetchTrend])

  const totalSpent = useMemo(() => sumAmount(currentExpenses), [currentExpenses])
  const previousTotal = useMemo(() => sumAmount(previousExpenses), [previousExpenses])
  const dailyAverage = useMemo(
    () => totalSpent / daysElapsed(activeRange, mode === 'month' && isCurrentMonth),
    [totalSpent, activeRange, mode, isCurrentMonth],
  )

  // Breakdown granularity follows the active filter: by category when
  // nothing is selected, by subcategory once narrowed to one category. Once
  // narrowed further to a single subcategory there's nothing left to break
  // down — see the render below, which falls back to the plain total/average
  // cards already shown above instead of a chart.
  const categoryTotals = useMemo(
    () => (categoryId ? [] : groupByCategory(currentExpenses)),
    [categoryId, currentExpenses],
  )
  const subcategoryTotals = useMemo(
    () => (categoryId && !subcategoryId ? groupBySubcategory(currentExpenses) : []),
    [categoryId, subcategoryId, currentExpenses],
  )
  const topCategories = categoryTotals.slice(0, TOP_CATEGORIES_LIMIT)
  const topSubcategories = subcategoryTotals.slice(0, TOP_CATEGORIES_LIMIT)

  const trendData = useMemo(() => {
    const buckets = []
    for (let i = TREND_MONTHS - 1; i >= 0; i -= 1) {
      const range = getMonthRange(-i)
      buckets.push({ key: getMonthKey(range.start), label: formatIsoDate(range.start, locale, { month: 'short' }), total: 0 })
    }
    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))
    for (const expense of trendExpenses) {
      const bucket = byKey.get(getMonthKey(expense.date))
      if (bucket) bucket.total += expense.amount
    }
    return buckets
  }, [trendExpenses, locale])

  const comparisonAvailable = mode === 'month' && !previousLoading
  const delta = totalSpent - previousTotal
  const deltaPercent = previousTotal > 0 ? Math.round((delta / previousTotal) * 100) : null
  const previousMonthShortLabel = useMemo(
    () => formatIsoDate(previousMonthRange.start, locale, { month: 'long' }),
    [previousMonthRange, locale],
  )

  function handlePrevMonth() {
    setMonthOffset((current) => current - 1)
  }

  function handleNextMonth() {
    setMonthOffset((current) => Math.min(0, current + 1))
  }

  function handleSelectCategory(category) {
    selectCategory(category.id)
    onJumpToExpenses?.({ ...activeRange, label: `${category.name} · ${periodLabel}` })
  }

  function handleSelectSubcategory(subcategory) {
    selectSubcategory(subcategory.id)
    onJumpToExpenses?.({ ...activeRange, label: `${subcategory.name} · ${periodLabel}` })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{t('nav.dashboard')}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter
            mode={mode}
            onModeChange={setMode}
            monthLabel={monthLabel}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            isCurrentMonth={isCurrentMonth}
            customStart={customStart}
            customEnd={customEnd}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
          />
          <CategoryFilter />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {t('dashboard.totalSpent')}
          </p>
          <div className="mt-2">
            <AmountDisplay amount={totalSpent} size="xl" />
          </div>
          {comparisonAvailable ? (
            <p
              className={`mt-1.5 text-xs font-medium ${
                delta > 0
                  ? 'text-red-600 dark:text-red-400'
                  : delta < 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {delta === 0
                ? t('dashboard.noChange')
                : `${delta > 0 ? '+' : '−'}${formatCurrency(Math.abs(delta), locale)}${
                    deltaPercent !== null ? ` (${delta > 0 ? '+' : '−'}${Math.abs(deltaPercent)}%)` : ''
                  }`}{' '}
              {t('dashboard.vsPreviousMonth', { month: previousMonthShortLabel })}
            </p>
          ) : null}
        </Card>

        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {t('dashboard.dailyAverage')}
          </p>
          <div className="mt-2">
            <AmountDisplay amount={Number.isFinite(dailyAverage) ? dailyAverage : 0} size="xl" />
          </div>
          <p className="mt-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">{periodLabel}</p>
        </Card>
      </div>

      {!categoryId ? (
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {t('dashboard.categoryBreakdown')}
          </h3>
          {currentLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="animate-spin text-neutral-400" size={22} />
            </div>
          ) : (
            <CategoryDonutChart data={categoryTotals} locale={locale} onSelectCategory={handleSelectCategory} />
          )}
        </Card>
      ) : null}

      {!categoryId && topCategories.length > 0 ? (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {t('dashboard.topCategories')}
          </h3>
          <ol className="flex flex-col gap-1">
            {topCategories.map((entry, index) => (
              <li key={entry.category.id}>
                <button
                  type="button"
                  onClick={() => handleSelectCategory(entry.category)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                >
                  <span className="w-4 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                    {index + 1}
                  </span>
                  <CategoryIcon icon={entry.category.icon} color={entry.category.color} size="sm" />
                  <span className="flex-1 truncate text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {entry.category.name}
                  </span>
                  <AmountDisplay amount={entry.amount} size="sm" />
                </button>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      {categoryId && !subcategoryId && topSubcategories.length > 0 ? (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {t('dashboard.topSubcategories')}
          </h3>
          <ol className="flex flex-col gap-1">
            {topSubcategories.map((entry, index) => (
              <li key={entry.subcategory.id}>
                <button
                  type="button"
                  onClick={() => handleSelectSubcategory(entry.subcategory)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                >
                  <span className="w-4 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                    {index + 1}
                  </span>
                  <CategoryIcon icon={entry.subcategory.icon} color={selectedCategory?.color} size="sm" />
                  <span className="flex-1 truncate text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {entry.subcategory.name}
                  </span>
                  <AmountDisplay amount={entry.amount} size="sm" />
                </button>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {t('dashboard.trend', { count: TREND_MONTHS })}
          {filterEntityLabel ? ` · ${filterEntityLabel}` : ''}
        </h3>
        {trendLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="animate-spin text-neutral-400" size={22} />
          </div>
        ) : (
          <MonthlyTrendChart data={trendData} locale={locale} isDark={isDark} />
        )}
      </Card>
    </div>
  )
}
