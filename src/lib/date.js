// Shared date helpers. Dates are stored/passed as 'YYYY-MM-DD' strings
// throughout the app (matching the Postgres `date` column and <input type="date">).

export function getTodayIso() {
  return new Date().toISOString().slice(0, 10)
}

// Parsing with an explicit T00:00:00 avoids UTC-shift off-by-one-day bugs
// that `new Date('YYYY-MM-DD')` (parsed as UTC midnight) can cause.
export function parseIsoDate(iso) {
  return new Date(`${iso}T00:00:00`)
}

export function formatIsoDate(iso, locale, options) {
  return parseIsoDate(iso).toLocaleDateString(locale, options)
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function toIso(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`
}

// Calendar-month range, `offset` months relative to the current month
// (0 = this month, -1 = last month, ...).
export function getMonthRange(offset = 0) {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const last = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0)

  return {
    start: toIso(first.getFullYear(), first.getMonth(), 1),
    end: toIso(last.getFullYear(), last.getMonth(), last.getDate()),
    year: first.getFullYear(),
    month: first.getMonth(),
  }
}

// Inclusive range spanning the `count` most recent calendar months,
// ending with the current month.
export function getLastMonthsRange(count) {
  const current = getMonthRange(0)
  const oldest = getMonthRange(-(count - 1))
  return { start: oldest.start, end: current.end }
}

export function getMonthKey(iso) {
  return iso.slice(0, 7)
}
