import { statusLabel } from '../interfaces/task'
import type { Task } from '../interfaces/task'

export function TaskCard({ task, busy, canManage, confirming, edit, confirmDelete, remove, cancel }: {
  task: Task
  busy: boolean
  canManage: boolean
  confirming: boolean
  edit: () => void
  confirmDelete: () => void
  remove: () => void
  cancel: () => void
}) {
  return (
    <article className="task-card" aria-labelledby={`task-${task.id}`}>
      <div className="row">
        <h3 id={`task-${task.id}`}>{task.title}</h3>
        <span className="badge">{statusLabel[task.status]}</span>
      </div>
      {task.description && <p>{task.description}</p>}
      <p className="task-meta">Added by {task.createdBy.email}</p>
      {canManage && (confirming ? (
        <div className="confirm">
          <p>Delete this task? This cannot be undone.</p>
          <div className="actions">
            <button disabled={busy} type="button" className="danger" onClick={remove}>Confirm delete</button>
            <button disabled={busy} type="button" onClick={cancel}>Cancel deletion</button>
          </div>
        </div>
      ) : (
        <div className="actions">
          <button disabled={busy} type="button" onClick={edit}>Edit</button>
          <button disabled={busy} type="button" onClick={confirmDelete}>Delete</button>
        </div>
      ))}
    </article>
  )
}
