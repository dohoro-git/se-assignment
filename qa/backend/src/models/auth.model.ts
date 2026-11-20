import { Prisma } from '@prisma/client'
import { prisma } from '../db/client'
import { SHARED_WORKSPACE } from '../types/workspace'

export const authModel = {
  findUser(email: string) {
    return prisma.user.findUnique({ where: { email }, include: { workspace: true } })
  },
  saveChallenge(data: Prisma.SignupChallengeCreateInput) {
    return prisma.signupChallenge.upsert({ where: { email: data.email }, create: data, update: data })
  },
  findChallenge(id: string) {
    return prisma.signupChallenge.findUnique({ where: { id } })
  },
  deleteChallenge(id: string) {
    return prisma.signupChallenge.deleteMany({ where: { id } })
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
      const workspace = await tx.workspace.upsert({
        where: { id: SHARED_WORKSPACE.id },
        create: SHARED_WORKSPACE,
        update: {},
      })
      return tx.user.create({
        data: { email, passwordHash, workspaceId: workspace.id },
        select: { id: true, email: true, workspace: { select: { id: true, name: true } } },
      })
    })
  },
  createSession(data: Prisma.SessionUncheckedCreateInput) {
    return prisma.session.create({ data })
  },
  findSession(tokenHash: string) {
    return prisma.session.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: {
        user: {
          select: { id: true, email: true, workspaceId: true, workspace: { select: { id: true, name: true } } },
        },
      },
    })
  },
  async deleteSession(tokenHash: string) {
    await prisma.session.deleteMany({ where: { tokenHash } })
  },
}
