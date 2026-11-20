import type { ErrorRequestHandler, RequestHandler } from 'express'
import { AppError } from '../errors/app-error'

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', 'Endpoint not found.'))
}

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) return next(error)
  if (error instanceof AppError) {
    res.status(error.status).json({ code: error.code, error: error.message, details: error.details })
    return
  }
  const type = typeof error === 'object' && error !== null && 'type' in error ? error.type : undefined
  if (type === 'entity.parse.failed') {
    res.status(400).json({ code: 'INVALID_JSON', error: 'Send a valid JSON body.' })
    return
  }
  if (type === 'entity.too.large') {
    res.status(413).json({ code: 'PAYLOAD_TOO_LARGE', error: 'Request body is too large.' })
    return
  }
  console.error('Unhandled API error:', error instanceof Error ? error.name : typeof error)
  res.status(500).json({ code: 'INTERNAL_ERROR', error: 'Something went wrong.' })
}
