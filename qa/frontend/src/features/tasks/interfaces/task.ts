export const taskStatuses = ['TODO', 'IN_PROGRESS', 'DONE'] as const
export type TaskStatus = (typeof taskStatuses)[number]

export const statusLabel: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
}

export interface TaskInput {
  title: string
  description: string
  status: TaskStatus
}

export interface Task extends TaskInput {
  id: string
  createdAt: string
  updatedAt: string
}
