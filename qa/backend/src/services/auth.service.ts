import { createHash, randomBytes, randomInt, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { z } from 'zod'
import { AppError } from '../errors/app-error'
import { authModel } from '../models/auth.model'
import { deliverSignupOtp } from './otp-delivery.service'
import type { OtpDelivery } from './otp-delivery.service'
import { parseInput } from './validation'

const deriveKey = promisify(scrypt)
const OTP_TTL_SECONDS = 600
const SESSION_TTL_SECONDS = 8 * 60 * 60
const digest = (value: string) => createHash('sha256').update(value).digest('hex')
const email = z.string().trim().toLowerCase().max(254).email()
const credentials = z.object({ email, password: z.string().min(8).max(128) })
const loginInput = z.object({ email, password: z.string().min(1).max(128) })
const verifyInput = z.object({ challengeId: z.string().uuid(), code: z.string().regex(/^\d{6}$/, 'Enter a six-digit code.') })

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const key = (await deriveKey(password, salt, 64)) as Buffer
  return `${salt}:${key.toString('hex')}`
}

async function passwordMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  const key = (await deriveKey(password, salt, 64)) as Buffer
  return timingSafeEqual(key, Buffer.from(hash, 'hex'))
}

export function unauthorized() {
  return new AppError(401, 'UNAUTHORIZED', 'Sign in to continue.')
}

function invalidChallenge() {
  return new AppError(400, 'OTP_INVALID', 'The code is incorrect, expired, or no longer active. Use the latest code or request a new one.')
}

export const authService = {
  async requestSignup(body: unknown) {
    const input = parseInput(credentials, body)
    if (await authModel.findUser(input.email)) {
      throw new AppError(409, 'ACCOUNT_EXISTS', 'An account already exists for this email.')
    }

    const challengeId = randomUUID()
    const code = String(randomInt(1_000_000)).padStart(6, '0')
    await authModel.saveChallenge({
      id: challengeId,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      otpHash: digest(`${challengeId}:${code}`),
      attemptsLeft: 5,
      expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
    })

    let delivery: OtpDelivery
    try {
      delivery = await deliverSignupOtp(input.email, code, OTP_TTL_SECONDS)
    } catch (error) {
      await authModel.deleteChallenge(challengeId)
      throw error
    }

    return { challengeId, expiresInSeconds: OTP_TTL_SECONDS, delivery }
  },
  async verifySignup(body: unknown) {
    const { challengeId, code } = parseInput(verifyInput, body)
    const challenge = await authModel.findChallenge(challengeId)
    if (!challenge || challenge.expiresAt.getTime() <= Date.now()) throw invalidChallenge()
    if (challenge.attemptsLeft <= 0) {
      throw new AppError(429, 'OTP_ATTEMPTS_EXCEEDED', 'Too many attempts. Request a new code.')
    }
    const actual = digest(`${challengeId}:${code}`)
    if (!timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(challenge.otpHash, 'hex'))) {
      await authModel.recordFailedAttempt(challengeId)
      throw invalidChallenge()
    }
    const user = await authModel.consumeChallenge(challengeId, challenge.email, challenge.passwordHash)
    if (!user) throw invalidChallenge()
    return user
  },
  async signIn(body: unknown) {
    const input = parseInput(loginInput, body)
    const user = await authModel.findUser(input.email)
    if (!user || !(await passwordMatches(input.password, user.passwordHash))) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.')
    }
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000)
    await authModel.createSession({ tokenHash: digest(token), userId: user.id, expiresAt })
    return {
      user: {
        id: user.id,
        email: user.email,
        workspace: { id: user.workspace.id, name: user.workspace.name },
      },
      token,
      expiresAt,
    }
  },
  async authenticate(header?: string) {
    const token = header?.match(/^Bearer ([A-Za-z0-9_-]{43})$/i)?.[1]
    if (!token) throw unauthorized()
    const session = await authModel.findSession(digest(token))
    if (!session) throw unauthorized()
    return session
  },
  signOut(tokenHash: string) {
    return authModel.deleteSession(tokenHash)
  },
}
