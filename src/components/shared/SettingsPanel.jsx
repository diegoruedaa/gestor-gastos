import { LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDarkMode } from '../../hooks/useDarkMode'
import { useAuth } from '../../lib/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../lib/ToastContext'
import { Modal } from './Modal'

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

function ChangePasswordForm() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { user, signIn } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (newPassword.length < 6) {
      showToast(t('settings.passwordTooShort'), 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast(t('settings.passwordMismatch'), 'error')
      return
    }

    setSaving(true)

    const { error: reauthError } = await signIn(user.email, currentPassword)
    if (reauthError) {
      setSaving(false)
      showToast(t('settings.currentPasswordIncorrect'), 'error')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)

    if (error) {
      showToast(t('settings.passwordUpdateError'), 'error')
      return
    }

    showToast(t('settings.passwordUpdated'), 'success')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="password"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        placeholder={t('settings.currentPassword')}
        autoComplete="current-password"
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      />
      <input
        type="password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        placeholder={t('settings.newPassword')}
        autoComplete="new-password"
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder={t('settings.confirmPassword')}
        autoComplete="new-password"
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      />
      <button
        type="submit"
        disabled={saving || !currentPassword || !newPassword || !confirmPassword}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-500"
      >
        {saving ? t('settings.updatingPassword') : t('settings.updatePassword')}
      </button>
    </form>
  )
}

// Gear-icon entry point + modal (reuses the shared Modal) bundling every
// account-level control: language, dark mode, password change, sign out.
// Replaces the sidebar's old standalone LanguageSwitcher/DarkModeToggle.
export function SettingsPanel({ iconOnly = false }) {
  const { t, i18n } = useTranslation()
  const { signOut } = useAuth()
  const [isDark, setIsDark] = useDarkMode()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('settings.openSettings')}
        title={iconOnly ? t('settings.openSettings') : undefined}
        className={
          iconOnly
            ? 'rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
            : 'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900'
        }
      >
        <SettingsIcon size={18} />
        {!iconOnly && t('settings.title')}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t('settings.title')}>
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {t('settings.language')}
            </span>
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
                  className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                    i18n.resolvedLanguage === code
                      ? 'bg-accent-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {t('settings.darkMode')}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              aria-label={t('settings.darkMode')}
              onClick={() => setIsDark((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                isDark ? 'bg-accent-600' : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-neutral-100 pt-5 dark:border-neutral-800">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {t('settings.changePassword')}
            </span>
            <ChangePasswordForm />
          </div>

          <button
            type="button"
            onClick={signOut}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-neutral-700 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <LogOut size={16} />
            {t('auth.signOut')}
          </button>
        </div>
      </Modal>
    </>
  )
}
