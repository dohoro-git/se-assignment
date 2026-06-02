import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { TenantContext } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production'

/**
 * Verifies the Bearer JWT and attaches tenant context to req.tenant.
 * Token payload must contain { tenantId, userId }.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TenantContext
    if (!payload.tenantId || !payload.userId) {
      res.status(401).json({ error: 'Invalid token payload' })
      return
    }
    req.tenant = payload
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
