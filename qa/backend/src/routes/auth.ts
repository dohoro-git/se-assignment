import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'

export const authRouter = Router()
authRouter.post('/signup/request', authController.requestSignup)
authRouter.post('/signup/verify', authController.verifySignup)
authRouter.post('/signin', authController.signIn)
authRouter.post('/signout', authenticate, authController.signOut)
