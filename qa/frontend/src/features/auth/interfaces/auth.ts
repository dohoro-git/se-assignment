export interface Credentials {
  email: string
  password: string
}

export interface Workspace {
  id: string
  name: string
}

export interface User {
  id: string
  email: string
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
  delivery: { channel: 'local'; code: string }
}
