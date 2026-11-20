import type { Request } from 'express'
import { authService, unauthorized } from '../services/auth.service'
import { asyncHandler } from './async-handler'

export const authenticate = asyncHandler(async (req, _res, next) => {
  const { userId, tokenHash } = await authService.authenticate(req.get('authorization'))
  req.session = { userId, tokenHash }
  next()
})

export function requireSession(req: Request) {
  if (!req.session) throw unauthorized()
  return req.session
}
