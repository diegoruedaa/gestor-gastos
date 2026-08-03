import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getTodayIso } from '../../lib/date'

const MODES = [
  { value: 'month', labelKey: 'dashboard.byMonth' },
  { value: 'custom', labelKey: 'dashboard.customRange' },
]

export function DateRangeFilter({
  mode,
  onModeChange,
  monthLabel,
  onPrevMonth,
  onNextMonth,
  isCurrentMonth,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
        {MODES.map((option) => {
          const isActive = mode === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onModeChange(option.value)}
              aria-pressed={isActive}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-white text-accent-700 shadow-sm dark:bg-neutral-950 dark:text-accent-300'
                  : 'text-neutral-500 dark:text-neutral-400'
              }`}
            >
              {t(option.labelKey)}
            </button>
          )
        })}
      </div>

      {mode === 'month' ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label={t('dashboard.previousMonth')}
            className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-medium capitalize text-neutral-700 dark:text-neutral-200">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={isCurrentMonth}
            aria-label={t('dashboard.nextMonth')}
            className="rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={customStart}
            max={customEnd}
            onChange={(event) => onCustomStartChange(event.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <span className="text-neutral-400 dark:text-neutral-600">–</span>
          <input
            type="date"
            value={customEnd}
            min={customStart}
            max={getTodayIso()}
            onChange={(event) => onCustomEndChange(event.target.value)}
            className="rounded-xl border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>
      )}
    </div>
  )
}
