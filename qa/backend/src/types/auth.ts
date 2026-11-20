export type AccountRole = 'ADMIN' | 'VIEWER'

export interface SessionContext {
  userId: string
  workspaceId: string
  role: AccountRole
  tokenHash: string
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionContext
    }
  }
}
