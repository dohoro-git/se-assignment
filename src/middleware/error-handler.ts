import { ErrorRequestHandler } from 'express'
import { AppError } from '../errors/app-error'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof AppError ? error.statusCode : 500
  const message = error instanceof AppError ? error.message : 'Internal server error'

  if (statusCode >= 500) {
    console.error(error)
  }

  res.status(statusCode).json({ error: message })
}
