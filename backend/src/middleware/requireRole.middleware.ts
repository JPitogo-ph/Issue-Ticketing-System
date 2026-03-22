import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../types/AppError.js";

export function requireRole(...roles: string[]) {
    return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
        if (!_req.user) {
            throw new AppError('Not authenticated', 401)
        }
        if (!roles) {
            throw new AppError('Insufficient permissions', 401)
        }
        next()
    }
}