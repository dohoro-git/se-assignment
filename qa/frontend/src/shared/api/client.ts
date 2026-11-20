export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
  }
}

interface Options {
  method?: 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string
  signal?: AbortSignal
}

export async function api<T>(path: string, { method, body, token, signal }: Options = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' })
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (body !== undefined) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetch(`/api${path}`, { method, headers, signal, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('Cannot reach the API. Check that the backend is running.')
  }
  if (response.status === 204) return undefined as T
  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
      ? payload.error : 'The API request failed. Try again.'
    throw new ApiError(response.status, message)
  }
  if (payload === null) throw new Error('The API did not return JSON. Check the frontend proxy and backend setup.')
  return payload as T
}
