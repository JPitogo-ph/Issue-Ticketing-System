import type { Request, Response, NextFunction } from "express";
import { CreateCommentSchema, ListCommentsSchema } from "../types/comment.types.js";
import * as CommentService from '../services/comment.service.js'

export async function listComments(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const dto = ListCommentsSchema.parse(req.query);
    const result = await CommentService.listComments(req.params.ticketId as string, req.user!, dto);
    res.status(200).json(result);
};

export async function createComment(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const dto = CreateCommentSchema.parse(req.body);
    const comment = await CommentService.createComment(req.params.ticketId as string, req.user!, dto);
    res.status(201).json(comment);
};

export async function deleteComment(req: Request, res: Response, _next: NextFunction): Promise<void> {
    await CommentService.deleteComment(req.params.ticketId as string, req.params.commentId as string, req.user!);
    res.status(204).send();
}