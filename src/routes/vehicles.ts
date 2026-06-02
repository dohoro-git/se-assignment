import { Router } from 'express'
import { listVehicles } from '../controllers/vehicles.controller'

const router = Router()

// Routes only map HTTP methods and paths to controllers.
router.get('/', listVehicles)

export default router
