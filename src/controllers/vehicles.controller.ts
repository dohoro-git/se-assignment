import { NextFunction, Request, Response } from 'express'
import { vehiclesService } from '../services/vehicles.service'

export async function listVehicles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const vehicles = await vehiclesService.listForTenant(req.tenant.tenantId)
    res.json(vehicles)
  } catch (error) {
    next(error)
  }
}
