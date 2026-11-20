export interface SessionContext {
  userId: string
  tokenHash: string
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionContext
    }
  }
}
