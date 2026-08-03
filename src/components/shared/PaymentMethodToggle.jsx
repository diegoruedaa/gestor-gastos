import { Banknote, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const OPTIONS = [
  { value: 'cash', icon: Banknote, labelKey: 'expense.cash' },
  { value: 'card', icon: CreditCard, labelKey: 'expense.card' },
]

export function PaymentMethodToggle({ value, onChange }) {
  const { t } = useTranslation()

  return (
    <div className="inline-flex items-center rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
      {OPTIONS.map(({ value: optionValue, icon: Icon, labelKey }) => {
        const isActive = value === optionValue
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            aria-label={t(labelKey)}
            aria-pressed={isActive}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isActive
                ? 'bg-white text-accent-600 shadow-sm dark:bg-neutral-950 dark:text-accent-400'
                : 'text-neutral-400 dark:text-neutral-500'
            }`}
          >
            <Icon size={16} />
          </button>
        )
      })}
    </div>
  )
}
