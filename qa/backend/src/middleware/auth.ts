import type { Request } from 'express'
import { authService, unauthorized } from '../services/auth.service'
import { asyncHandler } from './async-handler'

export const authenticate = asyncHandler(async (req, _res, next) => {
  const session = await authService.authenticate(req.get('authorization'))
  req.session = {
    userId: session.userId,
    workspaceId: session.user.workspaceId,
    tokenHash: session.tokenHash,
  }
  next()
})

export function requireSession(req: Request) {
  if (!req.session) throw unauthorized()
  return req.session
}
