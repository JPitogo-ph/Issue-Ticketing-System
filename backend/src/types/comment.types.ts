import * as z from 'zod'

export const CreateCommentSchema = z.object({
    body: z.string().min(1).max(10000),
});

export const ListCommentsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
});

export type CreateCommentSchema = z.infer<typeof CreateCommentSchema>;
export type ListCommentsSchema = z.infer<typeof ListCommentsSchema>;