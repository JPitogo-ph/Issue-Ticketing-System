import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../types/AppError.js";

export function errorMiddleware(
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err.statusCode ?? 500;
    const message = err.isOperational ? err.message : 'Internal server error';

    if (statusCode > 500) {
        console.error(err) //TODO: Maybe use actual logger later on.
    }

    res.status(statusCode).json({
        status: 'error',
        message,
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack}),
    })
}