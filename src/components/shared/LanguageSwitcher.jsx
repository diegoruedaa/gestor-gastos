import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  return (
    <div
      role="group"
      aria-label={t('settings.language')}
      className="inline-flex items-center overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700"
    >
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={i18n.resolvedLanguage === code}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            i18n.resolvedLanguage === code
              ? 'bg-accent-600 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
