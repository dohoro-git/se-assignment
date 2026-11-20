import { useCallback, useState } from 'react'
import { api } from '../../../shared/api/client'
import type { Credentials, Session, SignupChallenge, User } from '../interfaces/auth'

const KEY = 'dohoro.qa.session'

function readSession(): Session | null {
  try {
    const stored = sessionStorage.getItem(KEY)
    if (!stored) return null
    const session: Session = JSON.parse(stored)
    if (Date.parse(session.expiresAt) > Date.now() && session.token && session.user?.email) return session
  } catch {
    // Missing or inaccessible browser storage is not required for using the app.
  }
  return null
}

function persist(session: Session | null) {
  try {
    if (session) sessionStorage.setItem(KEY, JSON.stringify(session))
    else sessionStorage.removeItem(KEY)
  } catch {
    // The in-memory session still works for this page load.
  }
}

export function useSession() {
  const [session, setSession] = useState(readSession)
  const [reason, setReason] = useState('')

  async function signIn(credentials: Credentials) {
    const next = await api<Session>('/auth/signin', { method: 'POST', body: credentials })
    persist(next)
    setSession(next)
    setReason('')
  }

  const clear = useCallback((message = '') => {
    persist(null)
    setSession(null)
    setReason(message)
  }, [])

  return { session, reason, signIn, clear }
}

export const signup = {
  request: (body: Credentials) => api<SignupChallenge>('/auth/signup/request', { method: 'POST', body }),
  verify: (challengeId: string, code: string) => api<{ user: User }>('/auth/signup/verify', { method: 'POST', body: { challengeId, code } }),
}
