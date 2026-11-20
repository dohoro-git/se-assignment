import 'dotenv/config'
import { createApp } from './app'
import { prisma } from './db/client'

async function main() {
  const port = Number(process.env.PORT ?? '3001')
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535.')
  await prisma.$connect()
  // OTP delivery is simulated. This assessment server is not for public deployment.
  createApp().listen(port, '127.0.0.1', () => console.log(`QA API: http://127.0.0.1:${port}/api/health`))
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Failed to start the API.')
  process.exitCode = 1
})
