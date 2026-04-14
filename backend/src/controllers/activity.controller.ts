import type { Request, Response, NextFunction } from "express";
import * as z from 'zod';
import * as ActivityService from '../services/activity.service.js';

//Stick this here since nothing else uses it
const ListActivitySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function listActivity(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const {page, limit} = ListActivitySchema.parse(req.query);
    const result = await ActivityService.listActivity(req.params.ticketId as string, req.user!, page, limit);

    res.status(200).json(result);
}