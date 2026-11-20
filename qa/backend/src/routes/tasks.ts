import { Router } from 'express'
import { taskController } from '../controllers/task.controller'
import { authenticate } from '../middleware/auth'

export const tasksRouter = Router()
tasksRouter.use(authenticate)
tasksRouter.route('/').get(taskController.list).post(taskController.create)
tasksRouter.route('/:id').get(taskController.get).patch(taskController.update).delete(taskController.delete)
