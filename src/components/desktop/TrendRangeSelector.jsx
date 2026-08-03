import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MIN_MONTHS = 1
const MAX_MONTHS = 24

// Deliberately quieter than DateRangeFilter/CategoryFilter's pill buttons:
// a plain number ("8M") with two tiny stacked chevrons, so it reads as a
// bit of clickable text rather than a form control competing for
// attention inside the trend card header.
export function TrendRangeSelector({ months, onChange }) {
  const { t } = useTranslation()

  const canDecrement = months > MIN_MONTHS
  const canIncrement = months < MAX_MONTHS

  function decrement() {
    onChange(Math.max(MIN_MONTHS, months - 1))
  }

  function increment() {
    onChange(Math.min(MAX_MONTHS, months + 1))
  }

  return (
    <div
      role="group"
      aria-label={t('dashboard.trendRangeLabel')}
      className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500"
    >
      <span className="text-xs font-medium tabular-nums">{t('dashboard.trendRangeOption', { count: months })}</span>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={increment}
          disabled={!canIncrement}
          aria-label={t('dashboard.trendRangeIncrement')}
          className="rounded-t-sm text-current transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          <ChevronUp size={11} />
        </button>
        <button
          type="button"
          onClick={decrement}
          disabled={!canDecrement}
          aria-label={t('dashboard.trendRangeDecrement')}
          className="rounded-b-sm text-current transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          <ChevronDown size={11} />
        </button>
      </div>
    </div>
  )
}
