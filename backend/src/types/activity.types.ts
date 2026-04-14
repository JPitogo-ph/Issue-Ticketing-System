export {};

export type TicketCreatedMeta = {status: 'open'};
export type TicketUpdatedMeta = {[field: string]: {from: unknown, to: unknown}};
export type CommentMeta = {commentId: string};

export type ActivityMeta = TicketCreatedMeta | TicketUpdatedMeta | CommentMeta;

