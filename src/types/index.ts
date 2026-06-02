export interface TenantContext {
  tenantId: string
  userId: string
}

// Extends Express Request to carry authenticated tenant context
declare global {
  namespace Express {
    interface Request {
      tenant: TenantContext
    }
  }
}
