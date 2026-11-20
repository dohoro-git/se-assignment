import { useState } from 'react'
import type { FormEvent } from 'react'
import { signup } from '../hooks/useSession'
import type { Credentials, SignupChallenge } from '../interfaces/auth'

type Mode = 'signin' | 'signup' | 'verify'

export function AuthPage({ signIn, reason }: { signIn: (credentials: Credentials) => Promise<void>; reason: string }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState<SignupChallenge | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(reason)

  function navigate(next: Mode) {
    setMode(next)
    setError('')
    setMessage('')
    setPassword('')
    setCode('')
    setChallenge(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setPending(true)
    try {
      if (mode === 'signin') {
        await signIn({ email, password })
      } else if (mode === 'signup') {
        const next = await signup.request({ email, password })
        setChallenge(next)
        setMode('verify')
        setPassword('')
      } else if (challenge) {
        await signup.verify(challenge.challengeId, code)
        navigate('signin')
        setMessage('Account verified. Sign in with your email and password.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="wrap auth-layout">
      <section className="panel" aria-labelledby="auth-title">
        <p className="eyebrow">Personal task workspace</p>
        <h1 id="auth-title">{mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create an account' : 'Verify your email'}</h1>
        <p>{mode === 'verify' ? `Enter the one-time code for ${email}.` : 'Sign in to organize your tasks, or create a local demo account.'}</p>
        {message && <p className="notice" role="status">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {mode === 'verify' && challenge && (
          <details className="notice" key={challenge.challengeId}>
            <summary>Local OTP inbox (no email is sent)</summary>
            <p>Your code: <output aria-label="Local OTP">{challenge.delivery.code}</output>. It expires in {challenge.expiresInSeconds / 60} minutes.</p>
          </details>
        )}
        <form onSubmit={submit}>
          <fieldset disabled={pending}>
            {mode === 'verify' ? (
              <label>Verification code
                <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required />
              </label>
            ) : (
              <>
                <label>Email<input type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                <label>Password<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
                {mode === 'signup' && <p className="hint">Use at least 8 characters. Do not use a real password.</p>}
              </>
            )}
            <button type="submit" className="primary">{pending ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Send verification code' : 'Verify account'}</button>
          </fieldset>
        </form>
        <div className="actions auth-actions">
          {mode === 'verify' && <button type="button" disabled={pending} onClick={() => navigate('signup')}>Request a new code</button>}
          <button type="button" disabled={pending} onClick={() => navigate(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Create an account' : 'Back to sign in'}
          </button>
        </div>
      </section>
    </main>
  )
}
