import prisma from "../config/db.js";
import { Role, TicketStatus } from "../../generated/prisma/enums.js";
import { AppError } from "../types/AppError.js";
import { assertValidTransition, canChangeStatus, availableTransitions } from "../domain/ticket.statemachine.js";
import type { CreateTicketSchema, UpdateTicketSchema, ListTicketsSchema } from "../types/ticket.types.js";
//^Just learned you don't have to put type in front of every individual one.......
import type { JwtPayload } from "../types/auth.types.js";
import type { TicketUncheckedUpdateInput, TicketUpdateInput, TicketWhereInput } from "../../generated/prisma/models.js";

const safeTicketSelect = {//TODO Am now only realizing some of these audit fields are snake_case. Fix them in a next life.
    id: true,
    title: true,
    description: true,
    status: true,
    priority: true,
    type: true,
    createdAt: true,
    updatedAt: true,
    reporter: {select: {id: true, name: true, email: true}},
    assignee: {select: {id: true, name: true, email: true}}
} as const;

async function findOrFail(id: string) {
    const ticket = await prisma.ticket.findUnique({
        where: {id},
        select: {...safeTicketSelect, reporterId: true},
    });
    if (!ticket) throw new AppError('Ticket not found', 404);
    return ticket;
}

export async function assertAssignableUser(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
        where: {id: userId},
        select: {role: true}
    });
    if (!user) throw new AppError('Assignee not found', 404);
    if (user.role === Role.reporter) throw new AppError('Reporters cannot be assigned to tickets', 422);
}

export async function createTicket(actor: JwtPayload, input: CreateTicketSchema) {
    if (input.assigneeId && actor.role === Role.reporter) throw new AppError('Reporters cannot be assigned to tickets', 422);

    if (input.assigneeId) await assertAssignableUser(input.assigneeId);

    const ticket = await prisma.ticket.create({
        data: {
            title: input.title,
            description: input.description ?? 'No description',
            priority: input.priority,
            type: input.type,
            status: TicketStatus.open,
            reporterId: actor.sub,
            assigneeId: input.assigneeId ?? 'Unassigned', //TODO: May or may not explode.
        },
        select: safeTicketSelect
    });

   await logActivity(ticket.id, actor.sub, 'ticket created', {status: TicketStatus.open});

   return ticket;
}

export async function getTicket(actor: JwtPayload, id: string) {
    const ticket = await findOrFail(id);

    if (actor.role === Role.reporter && ticket.reporterId !== actor.sub) throw new AppError('Ticket not found', 404);

    const {reporterId: _, ...safe} = ticket;

    return {
        ...safe,
        availableTransitions: canChangeStatus(actor.role as Role) ? availableTransitions(ticket.status) : [],
    }
}

export async function listTickets(actor: JwtPayload, input: ListTicketsSchema) {
    const {page, limit, ...filters} = input;

    const where: TicketWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.type) where.type = filters.type;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;

    if (actor.role === Role.reporter) where.reporterId = actor.sub;
    else if (filters.reporterId) where.reporterId = filters.reporterId;

    const [tickets, total] = await prisma.$transaction([
        prisma.ticket.findMany({
            where,
            select: safeTicketSelect,
            orderBy: {createdAt: 'desc'},
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.ticket.count({where})
    ]);

    return {tickets, total, page, limit, pages: Math.ceil(total / limit)};
}

export async function updateTicket(actor: JwtPayload, id: string,   input: UpdateTicketSchema) {
    const ticket = await findOrFail(id);

    const isOwner = ticket.reporterId === actor.sub;
    const isPrivileged = actor.role === Role.agent || actor.role === Role.admin;

    if (!isOwner && !isPrivileged) throw new AppError('You do not have permission to update this ticket', 403);

    if (input.status !== undefined) {
        if (!canChangeStatus(actor.role as Role)) {
            throw new AppError('Only admins and agents can change ticket status.', 403)
        }
        assertValidTransition(ticket.status, input.status);
    }

    if (input.assigneeId !== undefined && !isPrivileged) throw new AppError('Only agents and admins can assign new tickets', 403);

    if (input.assigneeId) await assertAssignableUser(input.assigneeId);

    const updatemodel: TicketUncheckedUpdateInput = {}; //TODO: 'Unsafe' model, shortcut. Maybe fix someday.

    if (input.title) updatemodel.title = input.title;
    if (input.description) updatemodel.description = input.description;
    if (input.priority) updatemodel.priority = input.priority;
    if (input.type) updatemodel.type = input.type;
    if (input.status) updatemodel.status = input.status;
    if (input.assigneeId) updatemodel.assigneeId = input.assigneeId;

    const updated = await prisma.ticket.update({
        where: {id},
        data: updatemodel,
        select: safeTicketSelect
    });

    await logActivity(id, actor.sub, 'ticket-updated', buildChangeMeta(ticket, input));

    return updated;
}

export async function deleteTicket(actor: JwtPayload, id: string) {
    await findOrFail(id);

    if (actor.role !== Role.admin) throw new AppError('Only admins can delete tickets', 403);

    await prisma.ticket.delete({where: {id}});
    await logActivity(id, actor.sub, 'ticket-deleted', {})
}

//Helper functions
async function logActivity(
    ticketId: string,
    actorId: string,
    action: string,
    meta: any //TODO: Shoot myself if I ever have to fix this. I can't find and even make the right type to conform.
) {
    await prisma.activityLog.create({
        data: {ticketId, actorId, action, meta}
    });
}

function buildChangeMeta(before: Record<string, unknown>, input: UpdateTicketSchema): Record<string, unknown> {
    const meta:Record<string, unknown> = {};
    for (const key of Object.keys(input) as Array<keyof UpdateTicketSchema>) {//Cleaner than .entries() and discarding value
        if (input[key] !== undefined) {
            meta[key]= {from: before[key] ?? null, to: input[key]};
        }
    }
    return meta
} 