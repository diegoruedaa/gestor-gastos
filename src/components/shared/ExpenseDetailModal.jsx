import { Pencil, StickyNote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatIsoDate } from '../../lib/date'
import { supabase } from '../../lib/supabaseClient'
import { AddExpense } from './AddExpense'
import { AmountDisplay } from './AmountDisplay'
import { CategoryIcon } from './CategoryIcon'
import { Modal } from './Modal'
import { PaymentMethodIcon } from './PaymentMethodIcon'

const RECEIPT_SIGNED_URL_TTL_SECONDS = 300

// Shown when a list row is tapped/clicked: read-only detail by default, with
// an "Edit" entry point into the same AddExpense form used for creation
// (which also carries the delete action, see AddExpense).
export function ExpenseDetailModal({ expense, onClose, onChanged }) {
  const { t, i18n } = useTranslation()
  const [mode, setMode] = useState('view')
  const [receiptSignedUrl, setReceiptSignedUrl] = useState(null)

  useEffect(() => {
    setMode('view')
  }, [expense?.id])

  useEffect(() => {
    if (!expense?.receipt_url) {
      setReceiptSignedUrl(null)
      return undefined
    }

    let cancelled = false
    supabase.storage
      .from('receipts')
      .createSignedUrl(expense.receipt_url, RECEIPT_SIGNED_URL_TTL_SECONDS)
      .then(({ data }) => {
        if (!cancelled) setReceiptSignedUrl(data?.signedUrl ?? null)
      })

    return () => {
      cancelled = true
    }
  }, [expense?.receipt_url])

  function handleSaved() {
    onChanged?.()
    onClose()
  }

  function handleDeleted() {
    onChanged?.()
    onClose()
  }

  return (
    <Modal
      open={Boolean(expense)}
      onClose={onClose}
      title={mode === 'edit' ? t('expense.editTitle') : t('expense.detailTitle')}
    >
      {!expense ? null : mode === 'edit' ? (
        <AddExpense expense={expense} onSaved={handleSaved} onDeleted={handleDeleted} />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <CategoryIcon
                icon={expense.subcategory?.icon ?? expense.category?.icon}
                color={expense.category?.color}
                size="lg"
              />
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {expense.subcategory?.name ?? expense.category?.name}
                </p>
                {expense.subcategory ? (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{expense.category?.name}</p>
                ) : null}
              </div>
            </div>
            <AmountDisplay amount={expense.amount} size="lg" />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              {formatIsoDate(expense.date, i18n.resolvedLanguage, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PaymentMethodIcon method={expense.payment_method} />
              {t(`expense.${expense.payment_method}`)}
            </span>
          </div>

          {expense.note ? (
            <p className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200">
              <StickyNote size={16} className="mt-0.5 shrink-0 text-neutral-400" />
              {expense.note}
            </p>
          ) : null}

          {receiptSignedUrl ? (
            <img
              src={receiptSignedUrl}
              alt={t('expense.receiptAlt')}
              className="max-h-80 w-full rounded-xl border border-neutral-200 object-contain dark:border-neutral-800"
            />
          ) : null}

          <button
            type="button"
            onClick={() => setMode('edit')}
            className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Pencil size={16} />
            {t('expense.edit')}
          </button>
        </div>
      )}
    </Modal>
  )
}
