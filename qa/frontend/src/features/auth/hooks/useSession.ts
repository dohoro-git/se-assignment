import { useCallback, useEffect, useState } from 'react'
import { ApiError, api } from '../../../shared/api/client'
import type { Credentials, Session, SignupChallenge, User } from '../interfaces/auth'

const SESSIONS_KEY = 'dohoro.qa.sessions'
const ACTIVE_SESSION_KEY = 'dohoro.qa.active-session'
const LEGACY_SESSION_KEY = 'dohoro.qa.session'

function normalizeSession(value: unknown): Session | null {
  if (typeof value !== 'object' || value === null || !('token' in value) || !('expiresAt' in value) || !('user' in value)) return null
  const stored = value as Partial<Session>
  if (!stored.token || Date.parse(stored.expiresAt ?? '') <= Date.now() || !stored.user?.email || !stored.user.workspace?.id) return null
  return { ...stored, user: { ...stored.user, role: stored.user.role ?? 'VIEWER' } } as Session
}

function parseSessions(raw: string | null): Session[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeSession).filter((session): session is Session => session !== null)
  } catch {
    return []
  }
}

function readSessions(): Session[] {
  try {
    const stored = parseSessions(localStorage.getItem(SESSIONS_KEY))
    if (stored.length) return stored
    const legacy = normalizeSession(JSON.parse(sessionStorage.getItem(LEGACY_SESSION_KEY) ?? 'null'))
    if (legacy) {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify([legacy]))
      sessionStorage.setItem(ACTIVE_SESSION_KEY, legacy.token)
      sessionStorage.removeItem(LEGACY_SESSION_KEY)
      return [legacy]
    }
  } catch {
    // Missing or inaccessible browser storage is not required for using the app.
  }
  return []
}

function readActiveToken(sessions: Session[]): string | null {
  try {
    const saved = sessionStorage.getItem(ACTIVE_SESSION_KEY)
    if (saved && sessions.some((session) => session.token === saved)) return saved
  } catch {
    // Fall through to the first in-memory session.
  }
  return sessions[0]?.token ?? null
}

function persist(sessions: Session[], activeToken: string | null) {
  try {
    if (sessions.length) localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    else localStorage.removeItem(SESSIONS_KEY)
  } catch {
    // The current page's in-memory sessions still work if browser storage is unavailable.
  }
  try {
    if (activeToken) sessionStorage.setItem(ACTIVE_SESSION_KEY, activeToken)
    else sessionStorage.removeItem(ACTIVE_SESSION_KEY)
  } catch {
    // The current page can still use its in-memory active session.
  }
}

export function useSession() {
  const [sessions, setSessions] = useState(readSessions)
  const [activeToken, setActiveToken] = useState(() => readActiveToken(readSessions()))
  const [reason, setReason] = useState('')
  const session = sessions.find((item) => item.token === activeToken) ?? null

  const signIn = useCallback(async (credentials: Credentials) => {
    const next = await api<Session>('/auth/signin', { method: 'POST', body: credentials })
    const currentSessions = readSessions()
    const updated = [...currentSessions.filter((item) => item.token !== next.token), next]
    persist(updated, next.token)
    setSessions(updated)
    setActiveToken(next.token)
    setReason('')
  }, [])

  const activate = useCallback(async (token: string) => {
    const currentSessions = readSessions()
    if (!currentSessions.some((item) => item.token === token)) return
    const { user } = await api<{ user: User }>('/auth/me', { token })
    const updated = currentSessions.map((item) => item.token === token ? { ...item, user } : item)
    persist(updated, token)
    setSessions(updated)
    setActiveToken(token)
    setReason('')
  }, [])

  const clear = useCallback((message = '') => {
    if (!activeToken) return
    const currentSessions = readSessions()
    const updated = currentSessions.filter((item) => item.token !== activeToken)
    const nextToken = updated[0]?.token ?? null
    persist(updated, nextToken)
    setSessions(updated)
    setActiveToken(nextToken)
    setReason(message)
  }, [activeToken])

  useEffect(() => {
    if (!activeToken) return
    let cancelled = false
    api<{ user: User }>('/auth/me', { token: activeToken }).then(({ user }) => {
      if (cancelled) return
      setSessions((current) => {
        const existing = current.find((item) => item.token === activeToken)
        if (existing?.user.id === user.id && existing.user.email === user.email && existing.user.role === user.role && existing.user.workspace.id === user.workspace.id) return current
        const updated = current.map((item) => item.token === activeToken ? { ...item, user } : item)
        persist(updated, activeToken)
        return updated
      })
    }).catch((error: unknown) => {
      if (cancelled) return
      if (error instanceof ApiError && error.status === 401) clear('Your session expired. Sign in again.')
    })
    return () => { cancelled = true }
  }, [activeToken, clear])

  useEffect(() => {
    function syncSessions(event: StorageEvent) {
      if (event.key !== SESSIONS_KEY) return
      const updated = parseSessions(event.newValue)
      setSessions(updated)
      if (activeToken && !updated.some((item) => item.token === activeToken)) {
        const nextToken = updated[0]?.token ?? null
        try {
          if (nextToken) sessionStorage.setItem(ACTIVE_SESSION_KEY, nextToken)
          else sessionStorage.removeItem(ACTIVE_SESSION_KEY)
        } catch {
          // The in-memory active token is still updated below.
        }
        setActiveToken(nextToken)
      }
    }
    window.addEventListener('storage', syncSessions)
    return () => window.removeEventListener('storage', syncSessions)
  }, [activeToken])

  return { sessions, session, reason, signIn, activate, clear }
}

export const signup = {
  request: (body: Credentials) => api<SignupChallenge>('/auth/signup/request', { method: 'POST', body }),
  verify: (challengeId: string, code: string) => api<{ user: User }>('/auth/signup/verify', { method: 'POST', body: { challengeId, code } }),
}
