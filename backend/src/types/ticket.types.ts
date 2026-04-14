import * as z from 'zod';
import { TicketStatus, TicketPriority, TicketType } from '../../generated/prisma/enums.js';

const title = z
    .string()
    .min(3)
    .max(255)
    .trim();

const description = z
    .string()
    .max(10000)//Text body 10K chars
    .trim()
    .optional();

const priority = z.enum(TicketPriority);

const type = z.enum(TicketType);

const status = z.enum(TicketStatus);

const assigneeId = z
    .uuid()
    .optional()
    .nullable();

//Schemas
export const CreateTicketSchema = z.object({
    title,
    description,
    priority: priority.default(TicketPriority.medium),
    type,
    assigneeId
});

export const UpdateTicketSchema = z.object({
    title: title.optional(),
    description,
    priority: priority.optional(),
    type: type.optional(),
    status: status.optional(),
    assigneeId,
});

export const ListTicketsSchema = z.object({
    status: status.optional(),
    priority: priority.optional(),
    type: type.optional(),
    assigneeId: z.uuid().optional(),
    reporterId: z.uuid().optional(),

    //Pagination
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketSchema = z.infer<typeof UpdateTicketSchema>;
export type ListTicketsSchema = z.infer<typeof ListTicketsSchema>;
