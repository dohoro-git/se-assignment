import { useEffect, useState } from 'react'
import { ApiError, api } from '../../../shared/api/client'
import type { Task, TaskInput } from '../interfaces/task'

export function useTasks(token: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [expired, setExpired] = useState(false)
  const [loadKey, reload] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api<Task[]>('/tasks', { token, signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return
      setTasks(result)
      setState('ready')
    }).catch((err: unknown) => {
      if (controller.signal.aborted) return
      if (err instanceof ApiError && err.status === 401) setExpired(true)
      else setError(err instanceof Error ? err.message : 'Could not load tasks.')
      setState('error')
    })
    return () => controller.abort()
  }, [token, loadKey])

  async function run(action: () => Promise<void>, message: string) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(message)
      return true
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setExpired(true)
      else setError(err instanceof Error ? err.message : 'Could not save the change.')
      return false
    } finally {
      setBusy(false)
    }
  }

  function save(input: TaskInput, id?: string) {
    return run(async () => {
      const task = await api<Task>(id ? `/tasks/${id}` : '/tasks', { method: id ? 'PATCH' : 'POST', token, body: input })
      setTasks((current) => id ? current.map((item) => item.id === id ? task : item) : [task, ...current])
    }, id ? 'Task updated.' : 'Task created.')
  }

  function remove(id: string) {
    return run(async () => {
      await api<void>(`/tasks/${id}`, { method: 'DELETE', token })
      setTasks((current) => current.filter((task) => task.id !== id))
    }, 'Task deleted.')
  }

  function retry() {
    setError('')
    setState('loading')
    reload((key) => key + 1)
  }

  return { tasks, state, error, notice, busy, expired, retry, save, remove }
}
