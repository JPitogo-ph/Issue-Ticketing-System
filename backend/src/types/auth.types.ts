import * as z from 'zod'
import { Role } from '../../generated/prisma/enums.js';

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
});

export const SignupSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8)
});

export const UpdateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.email(),
    role: z.enum(Role).optional(),
}).strict();

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;

export type UpdateUserSchema = z.infer<typeof UpdateUserSchema>;

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}


