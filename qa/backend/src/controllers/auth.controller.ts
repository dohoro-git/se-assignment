import { asyncHandler } from '../middleware/async-handler'
import { requireSession } from '../middleware/auth'
import { authService } from '../services/auth.service'

export const authController = {
  requestSignup: asyncHandler(async (req, res) => {
    res.status(202).json(await authService.requestSignup(req.body))
  }),
  verifySignup: asyncHandler(async (req, res) => {
    res.status(201).json({ user: await authService.verifySignup(req.body) })
  }),
  signIn: asyncHandler(async (req, res) => {
    res.json(await authService.signIn(req.body))
  }),
  signOut: asyncHandler(async (req, res) => {
    await authService.signOut(requireSession(req).tokenHash)
    res.sendStatus(204)
  }),
}
