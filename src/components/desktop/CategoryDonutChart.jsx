import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../../lib/currency'
import { AmountDisplay } from '../shared/AmountDisplay'
import { CategoryIcon } from '../shared/CategoryIcon'

function DonutTooltip({ active, payload, locale }) {
  if (!active || !payload?.length) return null
  const { category, amount, percent } = payload[0].payload

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{category.name}</p>
      <p className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
        {formatCurrency(amount, locale)}
        <span className="ml-1 font-normal text-neutral-400 dark:text-neutral-500">· {percent}%</span>
      </p>
    </div>
  )
}

// `data`: [{ category: { id, name, icon, color }, amount, percent }], sorted
// desc by amount. The legend list is not decorative — the app's fixed
// category palette doesn't clear a colorblind-safety check on its own, so
// every slice is paired with its icon + name as a non-color identity channel.
export function CategoryDonutChart({ data, locale, onSelectCategory }) {
  const { t } = useTranslation()

  if (data.length === 0) {
    return (
      <p className="flex h-56 items-center justify-center text-center text-sm text-neutral-500 dark:text-neutral-400">
        {t('dashboard.noExpensesInRange')}
      </p>
    )
  }

  function handleSliceClick(entry) {
    const category = entry?.payload?.category ?? entry?.category
    if (category) onSelectCategory?.(category)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="h-56 w-full shrink-0 sm:w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              innerRadius="62%"
              outerRadius="98%"
              paddingAngle={2}
              cornerRadius={4}
              stroke="none"
              onClick={handleSliceClick}
              className="cursor-pointer outline-none"
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.category.id} fill={entry.category.color} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip locale={locale} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-1 flex-col gap-1">
        {data.map((entry) => (
          <li key={entry.category.id}>
            <button
              type="button"
              onClick={() => onSelectCategory?.(entry.category)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
            >
              <CategoryIcon icon={entry.category.icon} color={entry.category.color} size="sm" />
              <span className="flex-1 truncate text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {entry.category.name}
              </span>
              <span className="text-xs tabular-nums text-neutral-400 dark:text-neutral-500">{entry.percent}%</span>
              <AmountDisplay amount={entry.amount} size="sm" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
