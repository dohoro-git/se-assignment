import { TaskStatus } from '@prisma/client'
import { prisma } from '../db/client'

const publicFields = {
  id: true,
  title: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, email: true } },
} as const

export interface TaskInput {
  title: string
  description: string
  status: TaskStatus
}

export const taskModel = {
  list(workspaceId: string, status?: TaskStatus) {
    return prisma.task.findMany({
      where: { workspaceId, status },
      select: publicFields,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    })
  },
  find(workspaceId: string, id: string) {
    return prisma.task.findFirst({ where: { workspaceId, id }, select: publicFields })
  },
  create(workspaceId: string, createdById: string, input: TaskInput) {
    return prisma.task.create({
      data: { ...input, workspaceId, createdById },
      select: publicFields,
    })
  },
  async update(workspaceId: string, id: string, input: Partial<TaskInput>) {
    const { count } = await prisma.task.updateMany({ where: { workspaceId, id }, data: input })
    if (!count) return null
    return taskModel.find(workspaceId, id)
  },
  async delete(workspaceId: string, id: string) {
    const { count } = await prisma.task.deleteMany({ where: { workspaceId, id } })
    return count > 0
  },
}
