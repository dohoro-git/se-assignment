export interface CreateMaintenanceJobInput {
  vehicleId: string
  type: string
  scheduledAt: string
  notes?: string
}
