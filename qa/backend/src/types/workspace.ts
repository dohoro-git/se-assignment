export const SHARED_WORKSPACE = {
  id: 'dohoro-qa-team',
  name: 'Dohoro QA Team',
} as const

export interface WorkspaceSummary {
  id: string
  name: string
}
