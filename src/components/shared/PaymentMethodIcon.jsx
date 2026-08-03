import { Banknote, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ICONS = {
  cash: Banknote,
  card: CreditCard,
}

export function PaymentMethodIcon({ method, size = 14, className = '' }) {
  const { t } = useTranslation()
  const Icon = ICONS[method] ?? CreditCard

  return (
    <span
      className={`inline-flex items-center text-neutral-400 dark:text-neutral-500 ${className}`}
      title={t(`expense.${method}`)}
    >
      <Icon size={size} aria-hidden="true" />
      <span className="sr-only">{t(`expense.${method}`)}</span>
    </span>
  )
}
