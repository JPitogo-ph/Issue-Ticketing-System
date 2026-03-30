import type { Request, Response, NextFunction } from "express";
import { CreateTicketSchema, UpdateTicketSchema, ListTicketsSchema } from "../types/ticket.types.js";
import * as TicketService from '../services/ticket.service.js'

export async function createTicket(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const dto = CreateTicketSchema.parse(req.body);
    const ticket = await TicketService.createTicket(req.user!, dto);
    res.status(201).json({ticket})
}

export async function getTicket(req: Request, res:Response, _next: NextFunction): Promise<void> {
    const ticket = await TicketService.getTicket(req.user!, req.params.id as string);
    res.status(200).json(ticket)
}

export async function listTickets(req: Request, res:Response, _next: NextFunction): Promise<void> {
    const dto = ListTicketsSchema.parse(req.query);
    const result = await TicketService.listTickets(req.user!, dto);
    res.status(200).json(result);
}

export async function updateTicket(req: Request, res:Response, _next: NextFunction): Promise<void> {
    const dto = UpdateTicketSchema.parse(req.body);
    const ticket = await TicketService.updateTicket(req.user!, req.params.id as string, dto);
    res.status(200).json({ticket});
}

export async function deleteTicket(req: Request, res:Response, _next: NextFunction): Promise<void> {
    await TicketService.deleteTicket(req.user!, req.params.id as string);
    res.status(204).send();
}