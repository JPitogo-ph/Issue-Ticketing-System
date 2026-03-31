export {};

export type TicketCreatedMeta = {status: 'open'};
export type TicketUpdatedMeta = {[field: string]: {from: unknown, to: unknown}};


export type ActivityMeta = TicketCreatedMeta | TicketUpdatedMeta;

