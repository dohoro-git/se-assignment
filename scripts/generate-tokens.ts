/**
 * Run once to print test JWT tokens for both seed tenants.
 * npx ts-node scripts/generate-tokens.ts
 */
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production'

const tokens = [
  {
    label: 'Dohoro Fleet',
    payload: {
      tenantId: 'tenant-dohoro-0000-0000-000000000001',
      userId:   'user-dohoro-admin-00000000000001',
    },
  },
  {
    label: 'Acme Logistics',
    payload: {
      tenantId: 'tenant-acme-000-0000-000000000002',
      userId:   'user-acme-admin-0000000000002',
    },
  },
]

for (const { label, payload } of tokens) {
  const token = jwt.sign(payload, SECRET, { expiresIn: '30d' })
  console.log(`\n--- ${label} ---`)
  console.log(`Authorization: Bearer ${token}`)
}
