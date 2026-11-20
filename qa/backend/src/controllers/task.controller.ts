import { asyncHandler } from '../middleware/async-handler'
import { requireSession } from '../middleware/auth'
import { taskService } from '../services/task.service'

export const taskController = {
  list: asyncHandler(async (req, res) => {
    const session = requireSession(req)
    res.json(await taskService.list(session.workspaceId, req.query))
  }),
  get: asyncHandler(async (req, res) => {
    const session = requireSession(req)
    res.json(await taskService.get(session.workspaceId, req.params.id))
  }),
  create: asyncHandler(async (req, res) => {
    const session = requireSession(req)
    res.status(201).json(await taskService.create(session.workspaceId, session.userId, req.body))
  }),
  update: asyncHandler(async (req, res) => {
    const session = requireSession(req)
    res.json(await taskService.update(session.workspaceId, req.params.id, req.body))
  }),
  delete: asyncHandler(async (req, res) => {
    const session = requireSession(req)
    await taskService.delete(session.workspaceId, req.params.id)
    res.sendStatus(204)
  }),
}
