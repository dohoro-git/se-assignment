import { Prisma } from '@prisma/client'
import { prisma } from '../db/client'

export const authModel = {
  findUser(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },
  saveChallenge(data: Prisma.SignupChallengeCreateInput) {
    return prisma.signupChallenge.upsert({ where: { email: data.email }, create: data, update: data })
  },
  findChallenge(id: string) {
    return prisma.signupChallenge.findUnique({ where: { id } })
  },
  async recordFailedAttempt(id: string) {
    await prisma.signupChallenge.updateMany({
      where: { id, attemptsLeft: { gt: 0 }, expiresAt: { gt: new Date() } },
      data: { attemptsLeft: { decrement: 1 } },
    })
  },
  consumeChallenge(id: string, email: string, passwordHash: string) {
    return prisma.$transaction(async (tx) => {
      const removed = await tx.signupChallenge.deleteMany({
        where: { id, attemptsLeft: { gt: 0 }, expiresAt: { gt: new Date() } },
      })
      if (!removed.count) return null
      return tx.user.create({ data: { email, passwordHash }, select: { id: true, email: true } })
    })
  },
  createSession(data: Prisma.SessionUncheckedCreateInput) {
    return prisma.session.create({ data })
  },
  findSession(tokenHash: string) {
    return prisma.session.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: { user: { select: { id: true, email: true } } },
    })
  },
  async deleteSession(tokenHash: string) {
    await prisma.session.deleteMany({ where: { tokenHash } })
  },
}
