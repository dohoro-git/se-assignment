import { z } from 'zod'
import { AppError } from '../errors/app-error'

export function parseInput<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, input: unknown): T {
  const result = schema.safeParse(input)
  if (result.success) return result.data

  const details = Object.fromEntries(result.error.issues.map((issue) => [issue.path.join('.') || 'body', issue.message]))
  throw new AppError(400, 'VALIDATION_ERROR', 'Check the submitted values.', details)
}
