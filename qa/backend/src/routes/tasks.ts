import { Router } from 'express'
import { taskController } from '../controllers/task.controller'
import { authenticate, requireRole } from '../middleware/auth'

export const tasksRouter = Router()
tasksRouter.use(authenticate)
tasksRouter.route('/').get(taskController.list).post(requireRole('ADMIN'), taskController.create)
tasksRouter.route('/:id')
  .get(taskController.get)
  .patch(requireRole('ADMIN'), taskController.update)
  .delete(requireRole('ADMIN'), taskController.delete)
