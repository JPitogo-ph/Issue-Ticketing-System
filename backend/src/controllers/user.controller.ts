import { type Request, type Response, type NextFunction } from "express";
import { UpdateUserSchema } from "../types/auth.types.js";
import { getUserById, updateUser, deleteUser } from "../services/user.service.js";

export async function getUserHandler(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const user = await getUserById(req.user!, req.params.id as string); //Review TS again, why won't it narrow to just string
    res.status(200).json(user);
}

export async function updateUserHandler(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const input = UpdateUserSchema.parse(req.body);
    const user = await updateUser(req.user!, req.params.id as string, input)
    res.status(200).json(user)
}

export async function deleteUserHandler(req: Request, res: Response, _next: NextFunction): Promise<void> {
    await deleteUser(req.params.id as string);
    res.status(204).send('User deleted');
}