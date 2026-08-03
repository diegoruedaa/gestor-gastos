import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

const TOAST_DURATION_MS = 2500

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timeoutRef = useRef(null)

  const showToast = useCallback((message, tone = 'success') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast({ message, tone })
    timeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-6">
          <div
            role="status"
            className={`pointer-events-auto max-w-sm rounded-xl px-4 py-2.5 text-center text-sm font-medium shadow-lg ${
              toast.tone === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-neutral-900 text-white dark:bg-neutral-50 dark:text-neutral-900'
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
