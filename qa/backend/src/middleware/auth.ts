import type { Request, RequestHandler } from 'express'
import { AppError } from '../errors/app-error'
import { authService, unauthorized } from '../services/auth.service'
import type { AccountRole } from '../types/auth'
import { asyncHandler } from './async-handler'

export const authenticate = asyncHandler(async (req, _res, next) => {
  const session = await authService.authenticate(req.get('authorization'))
  req.session = {
    userId: session.userId,
    workspaceId: session.user.workspaceId,
    role: session.user.role,
    tokenHash: session.tokenHash,
  }
  next()
})

export function requireRole(...roles: AccountRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.session || !roles.includes(req.session.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Your account role cannot perform this action.'))
      return
    }
    next()
  }
}

export function requireSession(req: Request) {
  if (!req.session) throw unauthorized()
  return req.session
}
