import { asyncHandler } from '../middleware/async-handler'
import { requireSession } from '../middleware/auth'
import { taskService } from '../services/task.service'

export const taskController = {
  list: asyncHandler(async (req, res) => {
    res.json(await taskService.list(requireSession(req).userId, req.query))
  }),
  get: asyncHandler(async (req, res) => {
    res.json(await taskService.get(requireSession(req).userId, req.params.id))
  }),
  create: asyncHandler(async (req, res) => {
    res.status(201).json(await taskService.create(requireSession(req).userId, req.body))
  }),
  update: asyncHandler(async (req, res) => {
    res.json(await taskService.update(requireSession(req).userId, req.params.id, req.body))
  }),
  delete: asyncHandler(async (req, res) => {
    await taskService.delete(requireSession(req).userId, req.params.id)
    res.sendStatus(204)
  }),
}
