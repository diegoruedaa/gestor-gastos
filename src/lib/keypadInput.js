const MAX_INTEGER_DIGITS = 7
const MAX_DECIMAL_DIGITS = 2

// Pure reducer for the calculator-style amount input: takes the current
// string value and a pressed key, returns the next string value.
export function applyKeypadKey(value, key) {
  if (key === 'backspace') {
    const next = value.slice(0, -1)
    return next === '' ? '0' : next
  }

  if (key === '.') {
    return value.includes('.') ? value : `${value}.`
  }

  const [integerPart, decimalPart] = value.split('.')

  if (decimalPart !== undefined) {
    if (decimalPart.length >= MAX_DECIMAL_DIGITS) return value
    return `${value}${key}`
  }

  if (value === '0') return key
  if (integerPart.length >= MAX_INTEGER_DIGITS) return value
  return `${value}${key}`
}
