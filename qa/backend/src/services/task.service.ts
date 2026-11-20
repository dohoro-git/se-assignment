import { TaskStatus } from '@prisma/client'
import { z } from 'zod'
import { AppError } from '../errors/app-error'
import { taskModel } from '../models/task.model'
import { parseInput } from './validation'

const fields = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500),
  status: z.nativeEnum(TaskStatus),
}).strict()

const createInput = fields.extend({
  description: fields.shape.description.default(''),
  status: fields.shape.status.default(TaskStatus.TODO),
})
const updateInput = fields.partial().refine((data) => Object.keys(data).length > 0, 'Provide at least one field to update.')
const listInput = z.object({ status: fields.shape.status.optional() }).strict()

function notFound() {
  return new AppError(404, 'TASK_NOT_FOUND', 'Task not found.')
}

export const taskService = {
  list(userId: string, query: unknown) {
    const { status } = parseInput(listInput, query)
    return taskModel.list(userId, status)
  },
  async get(userId: string, id: string) {
    const task = await taskModel.find(userId, id)
    if (!task) throw notFound()
    return task
  },
  create(userId: string, body: unknown) {
    return taskModel.create(userId, parseInput(createInput, body))
  },
  async update(userId: string, id: string, body: unknown) {
    const task = await taskModel.update(userId, id, parseInput(updateInput, body))
    if (!task) throw notFound()
    return task
  },
  async delete(userId: string, id: string) {
    const task = await taskModel.find(userId, id)
    if (!task) throw notFound()
    if (task.status === TaskStatus.DONE) {
      throw new AppError(409, 'TASK_DELETE_CONFLICT', 'This task cannot be deleted.')
    }
    if (!(await taskModel.delete(userId, id))) throw notFound()
  },
}
