import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

// Purely decorative — heights/colors are hand-picked, not derived from data.
const CHART_BARS = [
  { height: 14, color: '#1e3a3e' },
  { height: 20, color: '#25464b' },
  { height: 16, color: '#2b5a60' },
  { height: 28, color: '#37727a' },
  { height: 22, color: '#1e3a3e' },
  { height: 34, color: '#4fd1a5' },
  { height: 18, color: '#25464b' },
  { height: 26, color: '#2b5a60' },
  { height: 30, color: '#4fd1a5' },
  { height: 20, color: '#37727a' },
  { height: 24, color: '#4fd1a5' },
]

export function Login() {
  const { t, i18n } = useTranslation()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0f14] px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(#1a2a30 1px, transparent 1px), linear-gradient(90deg, #1a2a30 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }}
      />

      <div className="absolute right-5 top-5 flex items-center gap-1.5 font-mono text-[11px]">
        {LANGUAGES.map(({ code, label }, index) => (
          <span key={code} className="flex items-center gap-1.5">
            {index > 0 ? <span className="text-[#2f4149]">/</span> : null}
            <button
              type="button"
              onClick={() => i18n.changeLanguage(code)}
              aria-pressed={i18n.resolvedLanguage === code}
              className={
                i18n.resolvedLanguage === code
                  ? 'text-[#4fd1a5]'
                  : 'text-[#6b8a94] transition-colors hover:text-[#eaf2f0]'
              }
            >
              {label}
            </button>
          </span>
        ))}
      </div>

      <div className="relative w-full max-w-sm rounded-lg border border-[#1a2a30] bg-[#0a0f14]">
        <div className="flex flex-col items-center gap-3 border-b border-[#1a2a30] px-6 py-8">
          <div className="flex w-48 flex-col items-center">
            <div className="flex h-10 w-full items-end justify-center gap-1">
              {CHART_BARS.map((bar, index) => (
                <div
                  key={index}
                  className="w-2 rounded-t-sm"
                  style={{ height: `${bar.height}px`, backgroundColor: bar.color }}
                />
              ))}
            </div>
            <div className="h-px w-full bg-[#1e2f36]" />
          </div>

          <h1 className="text-xl font-medium text-[#eaf2f0]">{t('common.appName')}</h1>
          <p className="font-mono text-xs text-[#6b8a94]">{t('auth.tagline')}</p>
        </div>

        <div className="flex flex-col gap-4 px-6 py-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#6b8a94]">
            {mode === 'signIn' ? t('auth.commentSignIn') : t('auth.commentSignUp')}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#6b8a94]">
              {t('auth.email')}
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 rounded-md border border-[#1e2f36] bg-[#10181d] px-3 text-sm normal-case tracking-normal text-[#eaf2f0] outline-none focus:border-[#4fd1a5]"
              />
            </label>

            <label className="flex flex-col gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[#6b8a94]">
              {t('auth.password')}
              <span className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 w-full rounded-md border border-[#1e2f36] bg-[#10181d] px-3 pr-10 text-sm normal-case tracking-normal text-[#eaf2f0] outline-none focus:border-[#4fd1a5]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  className="absolute right-3 text-[#6b8a94] transition-colors hover:text-[#eaf2f0]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>

            {error ? <p className="font-mono text-xs text-red-400">{error}</p> : null}
            {info ? <p className="font-mono text-xs text-[#4fd1a5]">{info}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 h-11 rounded-md bg-[#2b5a60] text-sm font-semibold text-[#eaf2f0] transition-colors hover:bg-[#37727a] disabled:opacity-60"
            >
              {mode === 'signIn' ? t('auth.submitSignIn') : t('auth.submitSignUp')}
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between border-t border-[#1a2a30] pt-4">
            <button
              type="button"
              onClick={toggleMode}
              className="font-mono text-xs text-[#6b8a94] hover:text-[#eaf2f0]"
            >
              {mode === 'signIn' ? t('auth.toggleToSignUpPrefix') : t('auth.toggleToSignInPrefix')}{' '}
              <span className="text-[#4fd1a5]">
                {mode === 'signIn' ? t('auth.toggleToSignUpAction') : t('auth.toggleToSignInAction')}
              </span>
            </button>
            <span className="font-mono text-[11px] text-[#2f4149]">v1.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}
