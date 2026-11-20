import { useEffect, useState } from 'react'
import { ApiError, api } from '../../../shared/api/client'
import type { Session } from '../../auth/interfaces/auth'
import { TaskCard } from '../components/TaskCard'
import { TaskForm } from '../components/TaskForm'
import { useTasks } from '../hooks/useTasks'
import { statusLabel, taskStatuses } from '../interfaces/task'
import type { Task, TaskStatus } from '../interfaces/task'

export function DashboardPage({ session, clearSession }: { session: Session; clearSession: (message?: string) => void }) {
  const data = useTasks(session.token)
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')
  const [editor, setEditor] = useState<Task | 'new' | null>(null)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  useEffect(() => {
    if (data.expired) clearSession('Your session has expired. Sign in again.')
  }, [data.expired, clearSession])

  async function signOut() {
    setSigningOut(true)
    setSignOutError('')
    try {
      await api<void>('/auth/signout', { method: 'POST', token: session.token })
      clearSession('Signed out.')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) clearSession('Signed out.')
      else setSignOutError(err instanceof Error ? err.message : 'Could not sign out.')
    } finally {
      setSigningOut(false)
    }
  }

  const visible = filter === 'all' ? data.tasks : data.tasks.filter((task) => task.status === filter)
  const busy = data.busy || signingOut

  return (
    <main className="wrap dashboard">
      <div className="row heading">
        <div>
          <p className="eyebrow">Shared team dashboard</p>
          <h1>{session.user.workspace.name}</h1>
          <p>Signed in as {session.user.email}</p>
        </div>
        <button disabled={busy} type="button" onClick={() => void signOut()}>{signingOut ? 'Signing out…' : 'Sign out'}</button>
      </div>
      <p className="notice" role="note">Tasks are shared with all verified team accounts. Refresh to see changes made by another member.</p>
      {signOutError && <p className="error" role="alert">{signOutError}</p>}
      {data.error && <p className="error" role="alert">{data.error}</p>}
      {data.notice && <p className="notice" role="status">{data.notice}</p>}
      {data.state === 'loading' && <p role="status">Loading shared tasks…</p>}
      {data.state === 'error' && <button type="button" onClick={data.retry}>Retry loading tasks</button>}
      {data.state === 'ready' && (
        <>
          <div className="stats" aria-label="Task summary">
            {taskStatuses.map((status) => <div key={status}><strong>{data.tasks.filter((task) => task.status === status).length}</strong> {statusLabel[status]}</div>)}
          </div>
          <div className="row controls">
            <label>Filter by status<select disabled={busy} value={filter} onChange={(event) => setFilter(event.target.value as TaskStatus | 'all')}>
              <option value="all">All statuses</option>
              {taskStatuses.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
            </select></label>
            <div className="actions">
              <button disabled={busy} type="button" onClick={() => void data.refresh()}>{busy ? 'Refreshing…' : 'Refresh shared tasks'}</button>
              <button className="primary" disabled={busy} type="button" onClick={() => { setConfirmation(null); setEditor('new') }}>New task</button>
            </div>
          </div>
          {editor && <TaskForm key={editor === 'new' ? 'new' : editor.id} task={editor === 'new' ? undefined : editor} busy={busy} cancel={() => setEditor(null)} save={async (input) => {
            const ok = await data.save(input, editor === 'new' ? undefined : editor.id)
            if (ok) setEditor(null)
            return ok
          }} />}
          <section aria-labelledby="task-list-title" className="task-list">
            <h2 id="task-list-title">Shared tasks</h2>
            {!visible.length && <p className="panel">{data.tasks.length ? 'No tasks match this filter.' : 'No shared tasks yet. Create the first one.'}</p>}
            {visible.map((task) => (
              <TaskCard key={task.id} task={task} busy={busy} confirming={confirmation === task.id}
                edit={() => { setConfirmation(null); setEditor(task) }}
                confirmDelete={() => { setEditor(null); setConfirmation(task.id) }}
                cancel={() => setConfirmation(null)}
                remove={() => { void data.remove(task.id).then(() => setConfirmation(null)) }} />
            ))}
          </section>
        </>
      )}
    </main>
  )
}
