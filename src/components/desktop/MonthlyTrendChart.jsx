import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency, formatCurrencyCompact } from '../../lib/currency'

const BAR_COLOR = '#2b5a60' // accent-600 — a single series carries the app's accent, not a category hue

function TrendTooltip({ active, payload, locale }) {
  if (!active || !payload?.length) return null
  const { label, total } = payload[0].payload

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      <p className="text-xs font-medium capitalize text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
        {formatCurrency(total, locale)}
      </p>
    </div>
  )
}

// `data`: [{ key: 'YYYY-MM', label, total }] for the trailing 6 calendar
// months (always including months with 0 spend, so the axis stays regular).
export function MonthlyTrendChart({ data, locale, isDark }) {
  const gridColor = isDark ? '#27272a' : '#e4e4e7'
  const tickColor = isDark ? '#71717a' : '#a1a1aa'

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: tickColor, fontSize: 12 }}
            className="capitalize"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: tickColor, fontSize: 12 }}
            width={56}
            tickFormatter={(value) => formatCurrencyCompact(value, locale)}
          />
          <Tooltip
            content={<TrendTooltip locale={locale} />}
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
          />
          <Bar dataKey="total" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
