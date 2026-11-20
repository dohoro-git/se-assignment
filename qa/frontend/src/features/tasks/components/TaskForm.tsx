import { useState } from 'react'
import type { FormEvent } from 'react'
import { statusLabel, taskStatuses } from '../interfaces/task'
import type { Task, TaskInput, TaskStatus } from '../interfaces/task'

export function TaskForm({ task, busy, save, cancel }: {
  task?: Task
  busy: boolean
  save: (input: TaskInput) => Promise<boolean>
  cancel: () => void
}) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('Enter a task title.')
      return
    }
    setError('')
    void save({ title: title.trim(), description: description.trim(), status })
  }

  return (
    <section className="panel" aria-labelledby="task-form-title">
      <h2 id="task-form-title">{task ? 'Edit task' : 'New task'}</h2>
      {error && <p className="error" role="alert">{error}</p>}
      <form onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={100} /></label>
          <label>Description (optional)<textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} /></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
            {taskStatuses.map((name) => <option key={name} value={name}>{statusLabel[name]}</option>)}
          </select></label>
          <div className="actions">
            <button className="primary" type="submit">{busy ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
            <button type="button" onClick={cancel}>Cancel</button>
          </div>
        </fieldset>
      </form>
    </section>
  )
}
