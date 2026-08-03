import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

// Native <dialog> gives us the browser's top-layer isolation and ::backdrop
// for free, instead of hand-rolled position:fixed + z-index stacking.
const BACKDROP_STYLE_ID = 'modal-native-backdrop-style'
const BACKDROP_STYLE = `
dialog.modal-dialog::backdrop {
  background-color: rgb(23 23 23 / 0.4);
}
:root.dark dialog.modal-dialog::backdrop {
  background-color: rgb(0 0 0 / 0.6);
}
`

function ensureBackdropStyleInjected() {
  if (document.getElementById(BACKDROP_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = BACKDROP_STYLE_ID
  style.textContent = BACKDROP_STYLE
  document.head.appendChild(style)
}

export function Modal({ open, onClose, title, children }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)

  useEffect(() => {
    ensureBackdropStyleInjected()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
    return undefined
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    const handleCancel = (event) => {
      // Escape triggers 'cancel' natively; let onClose own the state instead
      // of allowing the dialog to close itself out of sync with React.
      event.preventDefault()
      onClose()
    }
    const handleClose = () => {
      if (open) onClose()
    }
    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('close', handleClose)
    }
  }, [open, onClose])

  function handleDialogClick(event) {
    if (event.target === dialogRef.current) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog m-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
      aria-label={title}
      onClick={handleDialogClick}
      onClose={() => open && onClose()}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="rounded-full p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </dialog>
  )
}
