import prisma from "../config/db.js";
import { AppError } from "../types/AppError.js";
import type { CreateCommentSchema, ListCommentsSchema } from "../types/comment.types.js";
import type { JwtPayload } from "../types/auth.types.js";
import type { ActivityMeta } from "../types/activity.types.js";

const safeCommentSelect = {
    id: true,
    body: true,
    createdAt: true,
    author: {
        select: {id: true, name: true, email: true, role: true},
    },
} as const;

async function assertTicketAccess(actor: JwtPayload, ticketId: string) {
    const ticket = await prisma.ticket.findUnique({where: {id: ticketId}});

    if (!ticket) throw new AppError('Ticket not found', 404);
    if (actor.role === 'reporter' && ticket.reporterId !== actor.sub) throw new AppError('Ticket not found', 404);
};

export async function listComments(ticketId: string, actor: JwtPayload, input: ListCommentsSchema) {
    await assertTicketAccess(actor, ticketId); //Check that only throws

    const {page, limit} = input;
    const skip = (page - 1) * limit;

    const [comments, total] = await prisma.$transaction([
        prisma.comment.findMany({
            where: {ticketId},
            select: safeCommentSelect,
            orderBy: {createdAt: 'asc'},
            skip,
            take: limit
        }),
        prisma.comment.count({where: {ticketId}}),
    ]);

    return {comments, total, page, limit};
};

export async function createComment(ticketId: string, actor: JwtPayload, input: CreateCommentSchema) {
    assertTicketAccess(actor, ticketId); 

    const comment = await prisma.comment.create({
        data: {
            body: input.body,
            ticketId,
            authorId: actor.sub
        },
        select: safeCommentSelect,
    });

    await logActivity(ticketId, actor.sub, 'comment_created', {commentId: comment.id});

    return comment;
}

export async function deleteComment(ticketId: string, commendId: string, actor: JwtPayload) {
    await assertTicketAccess(actor, ticketId);

    const comment = await prisma.comment.findUnique({where: {id: commendId}});

    if (!comment || comment.ticketId !== ticketId) throw new AppError('Comment not found', 404);
    //Reporter role can only delete tickets of self.
    if (actor.role === 'reporter' && comment.authorId !== actor.sub) throw new AppError('Comment not found', 404);

    await logActivity(ticketId, actor.sub, 'comment_deleted', {commentId: 'deleted'});
    await prisma.comment.delete({where: {id: commendId}});
}


async function logActivity(ticketId: string, actorId: string, action: string, meta?: ActivityMeta) {
    await prisma.activityLog.create({
        data: {ticketId, actorId, action, meta: meta ?? {}}
    })
}