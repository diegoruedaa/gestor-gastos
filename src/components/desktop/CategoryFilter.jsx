import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCategories } from '../../hooks/useCategories'
import { useCategoryFilter } from '../../lib/CategoryFilterContext'

const ALL = 'all'

function FilterSelect({ value, onChange, options, defaultLabel, isActive, ariaLabel }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className={`appearance-none rounded-full border py-1.5 pl-3 pr-7 text-xs font-semibold outline-none transition-colors ${
          isActive
            ? 'border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-800 dark:bg-accent-900/30 dark:text-accent-300'
            : 'border-neutral-200 bg-white text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400'
        }`}
      >
        <option value={ALL}>{defaultLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-current opacity-60"
      />
    </div>
  )
}

// Discreet category/subcategory picker meant to sit next to DateRangeFilter:
// "all categories" by default (no visual noise), narrowing to a category and
// optionally a subcategory. Reads/writes the shared CategoryFilterContext so
// Dashboard and Gastos stay in sync without prop drilling.
export function CategoryFilter() {
  const { t } = useTranslation()
  const { categories } = useCategories()
  const { categoryId, subcategoryId, selectCategory, selectSubcategory, clear } = useCategoryFilter()

  const selectedCategory = categories.find((category) => category.id === categoryId) ?? null
  const subcategoryOptions = selectedCategory?.subcategories ?? []

  function handleCategoryChange(event) {
    const value = event.target.value
    if (value === ALL) clear()
    else selectCategory(value)
  }

  function handleSubcategoryChange(event) {
    const value = event.target.value
    selectSubcategory(value === ALL ? null : value)
  }

  return (
    <div className="flex items-center gap-2">
      <FilterSelect
        value={categoryId ?? ALL}
        onChange={handleCategoryChange}
        options={categories}
        defaultLabel={t('filters.allCategories')}
        isActive={Boolean(categoryId)}
        ariaLabel={t('filters.category')}
      />

      {subcategoryOptions.length > 0 ? (
        <FilterSelect
          value={subcategoryId ?? ALL}
          onChange={handleSubcategoryChange}
          options={subcategoryOptions}
          defaultLabel={t('filters.allSubcategories')}
          isActive={Boolean(subcategoryId)}
          ariaLabel={t('filters.subcategory')}
        />
      ) : null}
    </div>
  )
}
