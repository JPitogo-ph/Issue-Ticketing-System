import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { createTicket, getTicket, listTickets, updateTicket, deleteTicket } from "../controllers/ticket.controller.js";

const router = Router();

router.use(authenticate);

router.get('/', listTickets);
router.post('/', createTicket);
router.get('/:id', getTicket);
router.patch('/:id', updateTicket);
router.delete('/:id', requireRole('admin'),deleteTicket)

export default router;