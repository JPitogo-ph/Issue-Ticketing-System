import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { type LoginInput, type SignupInput, type JwtPayload } from '../types/auth.types.js';
import { AppError } from '../types/AppError.js';
import crypto, { sign } from 'node:crypto';
import { use } from 'react';

const SALT_ROUNDS = 12; //12 is apparently industry standard, said to add 250ms per hash.
const TOKEN_TTL = '12h'; //Just enough for workday, maybe change to 24

const INVALID_CREDENTIALS = new AppError('Invalid email or password', 401);

function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: TOKEN_TTL});
}

export async function login(input: LoginInput): Promise<string> {
    const user = await prisma.user.findUnique({where: {email: input.email}});

    const dummyHash = crypto.createHash('sha256').digest('base64'); //TODO: Maybe or may not explode at some point.
    const hash = user?.passwordHash ?? dummyHash;
    const match = await bcrypt.compare(input.password, hash);

    if (!user || !match) throw INVALID_CREDENTIALS;

    return signToken({sub: user.id, email: user.email, role: user.role});
}

export async function signUp(input: SignupInput): Promise<string> {
    const existing = await prisma.user.findUnique({where: {email: input.email}});
    if (existing) {
        throw new AppError('Email already in use', 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            passwordHash,
            //Role should default to reporter, change elsewhere if necessary.
        },
    });

    return signToken({sub:user.id, email: user.email, role: user.role});
}