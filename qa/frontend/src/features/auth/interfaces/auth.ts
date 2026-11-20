export interface Credentials {
  email: string
  password: string
}

export type AccountRole = 'ADMIN' | 'VIEWER'

export interface Workspace {
  id: string
  name: string
}

export interface User {
  id: string
  email: string
  role: AccountRole
  workspace: Workspace
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}

export interface SignupChallenge {
  challengeId: string
  expiresInSeconds: number
  delivery: { channel: 'local'; code: string } | { channel: 'email' }
}
