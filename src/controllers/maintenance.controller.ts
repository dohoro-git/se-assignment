import { NextFunction, Request, Response } from 'express'
import { maintenanceService } from '../services/maintenance.service'
import { CreateMaintenanceJobInput } from '../types/maintenance'

export async function createMaintenanceJob(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const job = await maintenanceService.createForTenant(
      req.tenant.tenantId,
      req.body as CreateMaintenanceJobInput,
    )
    res.status(201).json(job)
  } catch (error) {
    next(error)
  }
}

export async function listMaintenanceJobs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const jobs = await maintenanceService.listUpcomingForTenant(req.tenant.tenantId)
    res.json(jobs)
  } catch (error) {
    next(error)
  }
}
