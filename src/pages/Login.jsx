import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../lib/AuthContext'

export function Login() {
  const { t } = useTranslation()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const action = mode === 'signIn' ? signIn : signUp
    const { data, error: authError } = await action(email, password)

    if (authError) {
      setError(authError.message)
    } else if (mode === 'signUp' && !data.session) {
      setInfo(t('auth.signUpSuccess'))
    }

    setSubmitting(false)
  }

  function toggleMode() {
    setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'))
    setError(null)
    setInfo(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="mb-6 text-center text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {t('common.appName')}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('auth.email')}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('auth.password')}
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-accent-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>

          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          {info ? <p className="text-sm text-accent-600 dark:text-accent-400">{info}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-700 disabled:opacity-60"
          >
            {mode === 'signIn' ? t('auth.submitSignIn') : t('auth.submitSignUp')}
          </button>
        </form>

        <button
          type="button"
          onClick={toggleMode}
          className="mt-4 w-full text-center text-sm font-medium text-accent-600 hover:underline dark:text-accent-400"
        >
          {mode === 'signIn' ? t('auth.toggleToSignUp') : t('auth.toggleToSignIn')}
        </button>
      </div>
    </div>
  )
}
