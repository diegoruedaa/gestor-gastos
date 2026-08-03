import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from '../locales/es.json'
import en from '../locales/en.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: 'en',
    supportedLngs: ['es', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Checks localStorage first (manual selector persistence), then
      // falls back to the browser language.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'gastos-app-language',
      caches: ['localStorage'],
    },
  })

export default i18n
