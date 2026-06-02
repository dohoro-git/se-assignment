import { vehicleModel } from '../models/vehicle.model'

export const vehiclesService = {
  async listForTenant(tenantId: string) {
    const vehicles = await vehicleModel.findAllByTenant(tenantId)

    // TODO (mandatory Task 3): inspect these vehicles and create missing
    // overdue Routine Service jobs via the maintenance model. Keep this tenant
    // scoped. Return the vehicle list unchanged after the trigger runs.

    return vehicles
  },
}
