import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../lib/currency'

const SIZE_CLASSES = {
  sm: 'text-lg font-semibold',
  md: 'text-2xl font-semibold',
  lg: 'text-3xl font-bold',
  xl: 'text-4xl font-bold',
}

export function AmountDisplay({ amount, size = 'md', className = '' }) {
  const { i18n } = useTranslation()

  const formatted = formatCurrency(amount, i18n.resolvedLanguage)

  return (
    <span
      className={`tabular-nums text-neutral-900 dark:text-neutral-50 ${SIZE_CLASSES[size]} ${className}`}
    >
      {formatted}
    </span>
  )
}
