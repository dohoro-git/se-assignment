import { Router } from 'express'
import {
  createMaintenanceJob,
  listMaintenanceJobs,
} from '../controllers/maintenance.controller'

const router = Router()

// Routes only map HTTP methods and paths to controllers.
router.post('/', createMaintenanceJob)
router.get('/', listMaintenanceJobs)

export default router
