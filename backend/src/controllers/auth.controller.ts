import { type Request, type Response, type NextFunction } from "express";
import prisma from "../config/db.js";
import { login, signUp } from "../services/auth.service.js";
import { LoginSchema,SignupSchema } from "../types/auth.types.js";
import { AppError } from "../types/AppError.js";

const COOKIE_NAME = 'token';
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', //This is https
    sameSite: 'lax' as const, //Apparently needed against CSRF
    maxAge: 12 * 60 * 60 * 1000 //TODO: Move literal expression out as env var.
}

export async function signupHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const input = SignupSchema.parse(req.body);
        const token = await signUp(input);
        res.cookie(COOKIE_NAME, token, cookieOptions);
        res.status(201).json({message: 'Account Created'});
    } catch(err) {
        next(err);
    }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const input = LoginSchema.parse(req.body);
        const token = await login(input);
        res.cookie(COOKIE_NAME, token, cookieOptions);
        res.status(200).json({message: 'Logged In'});
    } catch(err) {
        next(err);
    }
}

export async function logoutHandler(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        res.clearCookie(COOKIE_NAME, cookieOptions);
        res.status(200).json({message: 'Logged Out'})
    } catch(err) {
        next(err)
    }
}

export async function meHandler(req: Request, res:Response, next: NextFunction): Promise<void> {
    try {
        const user = await prisma.user.findUnique({
        where: {id: req.user!.sub},
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        },
    });

    if (!user) {
        throw new AppError('User not found', 404)
    }

    res.status(200).json(user);
    } catch(err) {
        next(err)
    }
}