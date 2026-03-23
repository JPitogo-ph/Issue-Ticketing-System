import type { UserUpdateInput } from "../../generated/prisma/models.js";
import prisma from "../config/db.js";
import { AppError } from "../types/AppError.js";
import { UpdateUserSchema, type JwtPayload } from "../types/auth.types.js";

const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    created_at: true,
}; //Passed to prisma select, this is the correct pattern instead of an interface representing DTO apparently.

export async function getUserById(requestor: JwtPayload, targetId: string) {
    //Used to be middleware, more appropriate as service because it uses backend data instead of being just a simple middleware.
    if (requestor.role !== 'admin' && requestor.sub !== targetId) {
        throw new AppError('Forbidden', 403);
    }

    const user = await prisma.user.findUnique({
        where: {id: targetId},
        select: safeUserSelect,
    });

    if (!user) throw new AppError('User not found', 404);

    return user;
}

export async function updateUser(requestor: JwtPayload, targetId: string, data: UpdateUserSchema) {
    if (data.role && requestor.role !== 'admin') {
        throw new AppError('Cannot change own role', 403);
    }

    const user = await prisma.user.findUnique({where: {id: targetId}});
    if (!user) throw new AppError('User not found', 404);

    return prisma.user.update({
        where: {id: targetId},
        data: data as UserUpdateInput,//Mismatch between Zod schema and internal prisma type. Explicit mapping best practice.
        select: safeUserSelect
    });
}

export async function deleteUser(targetId: string) {
    //requireRole middleware will ensure this operation is allowed
    const user = await prisma.user.findUnique({where: {id: targetId}});
    if (!user) throw new AppError('User not found', 404);

    await prisma.user.delete({where: {id: targetId}});

}
