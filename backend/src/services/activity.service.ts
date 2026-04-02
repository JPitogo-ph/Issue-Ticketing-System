import prisma from "../config/db.js";
import type { JwtPayload } from "jsonwebtoken";
import { AppError } from "../types/AppError.js";

const safeActivitySelect = {
    id: true,
    action: true,
    meta: true,
    createdAt: true,
    actor: {select: {id: true, name: true, email: true, role: true}},
} as const;

export async function listActivity(ticketId: string, actor: JwtPayload, page: number, limit: number) {
    const ticket = await prisma.ticket.findUnique({where: {id: ticketId}});

    if (!ticket) throw new AppError('Ticket not found', 404);
    if (actor.role === 'reporter' && ticket.reporterId !== actor.sub) throw new AppError('Ticket not found', 404);

    const skip = (page - 1) * limit;
    const [logs, total] = await prisma.$transaction([
        prisma.activityLog.findMany({
            where: {ticketId},
            select: safeActivitySelect,
            orderBy: {createdAt: 'desc'},
            skip,
            take: limit,
        }),
        prisma.activityLog.count({where: {ticketId}}),
    ])

    return {logs, total, page, limit};
}