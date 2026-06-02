import express from 'express'
import { authenticate } from './middleware/auth'
import { errorHandler } from './middleware/error-handler'
import vehiclesRouter from './routes/vehicles'
import maintenanceRouter from './routes/maintenance'

const app = express()
app.use(express.json())

// Health check — no auth required.
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// All application routes below require a valid JWT.
app.use(authenticate)
app.use('/vehicles', vehiclesRouter)
app.use('/maintenance', maintenanceRouter)

// Keep error responses consistent across controllers.
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
