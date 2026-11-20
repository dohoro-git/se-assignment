export interface SessionContext {
  userId: string
  workspaceId: string
  tokenHash: string
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionContext
    }
  }
}
