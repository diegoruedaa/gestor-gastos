// EUR is the only currency the app supports today; centralized here so
// AmountDisplay and chart tooltips/axes format amounts identically.
export function formatCurrency(amount, locale) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(amount)
}

// Whole-euro variant for tight spaces (chart axis ticks) where cents
// would just add clutter.
export function formatCurrencyCompact(amount, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}
