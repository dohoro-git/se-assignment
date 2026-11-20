export interface Credentials {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
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
