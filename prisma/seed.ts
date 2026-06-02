import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Do not wipe persistent data when the API container restarts.
  const existingDohoroTenant = await prisma.tenant.findUnique({ where: { slug: 'dohoro' } })
  if (existingDohoroTenant) {
    console.log('Seed data already present; skipping initialization')
    return
  }

  // Clean slate for the initial demo database
  await prisma.maintenanceJob.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.tenant.deleteMany()

  const tenantA = await prisma.tenant.create({
    data: {
      id: 'tenant-dohoro-0000-0000-000000000001',
      name: 'Dohoro Fleet',
      slug: 'dohoro',
    },
  })

  const tenantB = await prisma.tenant.create({
    data: {
      id: 'tenant-acme-000-0000-000000000002',
      name: 'Acme Logistics',
      slug: 'acme',
    },
  })

  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000)

  // Dohoro vehicles — mix of overdue and recent service dates
  await prisma.vehicle.createMany({
    data: [
      {
        id: 'veh-dohoro-001',
        tenantId: tenantA.id,
        licensePlate: 'DOHORO-001',
        make: 'Toyota',
        model: 'HiLux',
        year: 2021,
        lastServiceDate: daysAgo(100), // overdue — > 90 days
      },
      {
        id: 'veh-dohoro-002',
        tenantId: tenantA.id,
        licensePlate: 'DOHORO-002',
        make: 'Ford',
        model: 'Ranger',
        year: 2022,
        lastServiceDate: daysAgo(30), // recently serviced
      },
      {
        id: 'veh-dohoro-003',
        tenantId: tenantA.id,
        licensePlate: 'DOHORO-003',
        make: 'Mitsubishi',
        model: 'Triton',
        year: 2020,
        lastServiceDate: null, // never serviced — overdue
      },
    ],
  })

  // Acme vehicles
  await prisma.vehicle.createMany({
    data: [
      {
        id: 'veh-acme-001',
        tenantId: tenantB.id,
        licensePlate: 'ACME-001',
        make: 'Isuzu',
        model: 'D-Max',
        year: 2023,
        lastServiceDate: daysAgo(45),
      },
      {
        id: 'veh-acme-002',
        tenantId: tenantB.id,
        licensePlate: 'ACME-002',
        make: 'Nissan',
        model: 'Navara',
        year: 2019,
        lastServiceDate: daysAgo(95), // overdue
      },
    ],
  })

  console.log('✓ Seed complete')
  console.log(`  Tenants:  Dohoro Fleet (${tenantA.id}), Acme Logistics (${tenantB.id})`)
  console.log(`  Vehicles: 3 Dohoro, 2 Acme`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
