import express from 'express'
import { errorHandler, notFound } from './middleware/error-handler'
import { authRouter } from './routes/auth'
import { tasksRouter } from './routes/tasks'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
  app.use(express.json({ limit: '10kb' }))
  app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }) })
  app.use('/api/auth', authRouter)
  app.use('/api/tasks', tasksRouter)
  app.use(notFound)
  app.use(errorHandler)
  return app
}
