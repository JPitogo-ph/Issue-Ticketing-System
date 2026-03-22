import { type Request, type Response, type NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { type JwtPayload } from "../types/auth.types.js";
import { AppError } from "../types/AppError.js";

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies?.token;

    if (!token) {
        throw new AppError('No token', 401);
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = payload;
        next();
    } catch {
        next(Object.assign(new Error('Invalid or expired token'), {statusCode: 401, isOperational: true}));
    }
}