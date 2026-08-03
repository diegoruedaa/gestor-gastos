import { Delete } from 'lucide-react'

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace']

export function NumericKeypad({ onKeyPress }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKeyPress(key)}
          aria-label={key === 'backspace' ? 'backspace' : key}
          className="flex h-14 items-center justify-center rounded-2xl bg-neutral-100 text-xl font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        >
          {key === 'backspace' ? <Delete size={20} /> : key}
        </button>
      ))}
    </div>
  )
}
