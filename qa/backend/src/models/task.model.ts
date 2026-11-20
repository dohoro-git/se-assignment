import { TaskStatus } from '@prisma/client'
import { prisma } from '../db/client'

const publicFields = { id: true, title: true, description: true, status: true, createdAt: true, updatedAt: true } as const

export interface TaskInput {
  title: string
  description: string
  status: TaskStatus
}

export const taskModel = {
  list(userId: string, status?: TaskStatus) {
    return prisma.task.findMany({
      where: { userId, status },
      select: publicFields,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    })
  },
  find(userId: string, id: string) {
    return prisma.task.findFirst({ where: { userId, id }, select: publicFields })
  },
  create(userId: string, input: TaskInput) {
    return prisma.task.create({ data: { ...input, userId }, select: publicFields })
  },
  async update(userId: string, id: string, input: Partial<TaskInput>) {
    const [updated] = await prisma.task.updateManyAndReturn({
      where: { userId, id },
      data: input,
      select: publicFields,
    })
    return updated
  },
  async delete(userId: string, id: string) {
    const { count } = await prisma.task.deleteMany({ where: { userId, id } })
    return count > 0
  },
}
