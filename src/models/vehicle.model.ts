import prisma from '../db/client'

/** Persistence queries for vehicles. Business rules belong in services. */
export const vehicleModel = {
  findAllByTenant(tenantId: string) {
    return prisma.vehicle.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'asc' },
    })
  },
}
