import { Prisma } from '@prisma/client'
import prisma from '../db/client'

/** Persistence queries for maintenance jobs and vehicle ownership checks. */
export const maintenanceModel = {
  findVehicleForTenant(vehicleId: string, tenantId: string) {
    return prisma.vehicle.findFirst({
      where: { id: vehicleId, tenantId },
    })
  },

  create(data: Prisma.MaintenanceJobUncheckedCreateInput) {
    return prisma.maintenanceJob.create({ data })
  },

  findUpcomingByTenant(tenantId: string) {
    return prisma.maintenanceJob.findMany({
      where: {
        vehicle: { tenantId },
        status: { not: 'COMPLETED' },
      },
      include: {
        vehicle: { select: { licensePlate: true, make: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })
  },

  findRoutineServiceForVehicle(vehicleId: string) {
    return prisma.maintenanceJob.findFirst({
      where: { vehicleId, type: 'Routine Service' },
    })
  },

  createRoutineServiceForVehicle(vehicleId: string) {
    return prisma.maintenanceJob.create({
      data: { vehicleId, type: 'Routine Service', status: 'PENDING' },
    })
  },
}
