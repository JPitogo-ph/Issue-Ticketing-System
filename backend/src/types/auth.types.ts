import * as z from 'zod'

export const LoginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
});

export const SignupSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(8)
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

