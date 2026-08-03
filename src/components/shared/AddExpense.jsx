import { Calendar, Camera, Loader2, StickyNote } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '../../hooks/useCategories'
import { useLastPaymentMethod } from '../../hooks/useLastPaymentMethod'
import { useAuth } from '../../lib/AuthContext'
import { applyKeypadKey } from '../../lib/keypadInput'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../lib/ToastContext'
import { AmountDisplay } from './AmountDisplay'
import { CategoryIcon } from './CategoryIcon'
import { NumericKeypad } from './NumericKeypad'
import { PaymentMethodToggle } from './PaymentMethodToggle'

function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function AddExpense({ onSaved }) {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories()
  const [paymentMethod, setPaymentMethod] = useLastPaymentMethod()

  const [rawAmount, setRawAmount] = useState('0')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [date, setDate] = useState(getTodayIso)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)
  const [receiptFile, setReceiptFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const amount = parseFloat(rawAmount) || 0
  const canSave = amount > 0 && selectedCategory && !saving
  const isToday = date === getTodayIso()
  const formattedDate = useMemo(
    () =>
      new Date(`${date}T00:00:00`).toLocaleDateString(i18n.resolvedLanguage, {
        day: 'numeric',
        month: 'short',
      }),
    [date, i18n.resolvedLanguage],
  )

  function handleKeypadKey(key) {
    setRawAmount((current) => applyKeypadKey(current, key))
  }

  function handleSelectCategory(category) {
    setSelectedSubcategory(null)
    setSelectedCategory((current) => (current?.id === category.id ? null : category))
  }

  function handleSelectSubcategory(subcategory) {
    setSelectedSubcategory((current) => (current?.id === subcategory.id ? null : subcategory))
  }

  function handleFileChange(event) {
    setReceiptFile(event.target.files?.[0] ?? null)
  }

  function resetForm() {
    setRawAmount('0')
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setDate(getTodayIso())
    setShowDatePicker(false)
    setNote('')
    setShowNote(false)
    setReceiptFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSave() {
    if (!canSave) return

    setSaving(true)
    const expenseId = crypto.randomUUID()
    let receiptPath = null

    if (receiptFile) {
      const path = `${user.id}/${expenseId}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(path, receiptFile, { contentType: receiptFile.type, upsert: true })

      if (uploadError) {
        showToast(t('expense.receiptUploadError'), 'error')
      } else {
        receiptPath = path
      }
    }

    const { error: insertError } = await supabase.from('expenses').insert({
      id: expenseId,
      user_id: user.id,
      category_id: selectedCategory.id,
      subcategory_id: selectedSubcategory?.id ?? null,
      amount,
      date,
      payment_method: paymentMethod,
      note: note.trim() || null,
      receipt_url: receiptPath,
    })

    setSaving(false)

    if (insertError) {
      showToast(t('expense.saveError'), 'error')
      return
    }

    showToast(t('expense.saved'), 'success')
    resetForm()
    onSaved?.()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <AmountDisplay amount={amount} size="xl" />
        <PaymentMethodToggle value={paymentMethod} onChange={setPaymentMethod} />
      </div>

      <div className="flex flex-col gap-2">
        {categoriesLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-neutral-400" size={20} />
          </div>
        ) : categoriesError ? (
          <p className="text-sm text-red-600 dark:text-red-400">{t('expense.loadCategoriesError')}</p>
        ) : (
          <div className="grid grid-cols-5 gap-1">
            {categories.map((category) => {
              const isSelected = selectedCategory?.id === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl p-1.5"
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color}
                    size="lg"
                    className={isSelected ? 'ring-2 ring-accent-600' : ''}
                  />
                  <span
                    className={`text-center text-[11px] font-medium leading-tight ${
                      isSelected
                        ? 'text-accent-700 dark:text-accent-300'
                        : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {category.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {selectedCategory?.subcategories?.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedCategory.subcategories.map((subcategory) => {
              const isSelected = selectedSubcategory?.id === subcategory.id
              return (
                <button
                  key={subcategory.id}
                  type="button"
                  onClick={() => handleSelectSubcategory(subcategory)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-accent-600 bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'
                      : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <CategoryIcon icon={subcategory.icon} color={selectedCategory.color} size="sm" />
                  {subcategory.name}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowDatePicker((current) => !current)}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
          >
            <Calendar size={14} />
            {isToday ? t('expense.today') : formattedDate}
          </button>

          {!showNote ? (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
            >
              <StickyNote size={14} />
              {t('expense.addNote')}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
          >
            <Camera size={14} />
            {receiptFile ? t('expense.receiptAttached') : t('expense.addReceipt')}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {showDatePicker ? (
          <input
            type="date"
            value={date}
            max={getTodayIso()}
            onChange={(event) => setDate(event.target.value)}
            className="w-fit rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        ) : null}

        {showNote ? (
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('expense.notePlaceholder')}
            autoFocus
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        ) : null}
      </div>

      <NumericKeypad onKeyPress={handleKeypadKey} />

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="flex items-center justify-center gap-2 rounded-2xl bg-accent-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : null}
        {saving ? t('expense.saving') : t('expense.save')}
      </button>
    </div>
  )
}
