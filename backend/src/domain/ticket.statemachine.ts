import { TicketStatus, Role } from "../../generated/prisma/enums.js";
import { AppError } from "../types/AppError.js";

//Transition Table
//Just learned about TS Record type, seems appropriate here.
const TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    open: ['in_progress', 'closed'],
    in_progress: ['in_review', 'open', 'closed'],
    in_review: ['resolved', 'in_progress'],
    resolved: ['in_progress', 'closed'],
    closed: [] //Terminology for end is 'Terminal'
};

//Role Check
const STATUS_ROLES: Role[] = [Role.agent, Role.admin];

export function canChangeStatus(role: Role): boolean {
    return STATUS_ROLES.includes(role);
}

//Transition Check
export function assertValidTransition(from: TicketStatus, to: TicketStatus): void {
    if (from === to) {
        return;
    } //Explicity handle this so I don't forget the check is simply skipped if true

    const allowed = TRANSITIONS[from];

    if (!allowed.includes(to)) {
        const allowedList = allowed.length ? allowed.join(', ') : 'none (Terminal)';

        throw new AppError(`Invalid status transition from "${from}" -> "${to}" ` + 
            `Allowed transitions are from "${from}" -> "${allowedList}}`, 422
        ) //422 semantically correct for backend logic failure
    }
}

//Service Helpers
export function availableTransitions(from: TicketStatus): TicketStatus[] {
    return [...TRANSITIONS[from]];
}

export function isTerminal(status: TicketStatus): boolean {
    return TRANSITIONS[status].length === 0;
}