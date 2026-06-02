import { AppError } from '../errors/app-error'
import { CreateMaintenanceJobInput } from '../types/maintenance'

export const maintenanceService = {
  async createForTenant(_tenantId: string, _input: CreateMaintenanceJobInput) {
    // TODO (mandatory Task 1): validate input, verify tenant ownership, then
    // persist using maintenanceModel. Keep HTTP concerns in the controller.
    throw new AppError('Task 1 is not implemented yet', 501)
  },

  async listUpcomingForTenant(_tenantId: string) {
    // TODO (mandatory Task 2): query through maintenanceModel.
    throw new AppError('Task 2 is not implemented yet', 501)
  },
}
