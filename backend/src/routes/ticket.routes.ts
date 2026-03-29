import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { createTicket, getTicket, listTickets, updateticket, deleteTicket } from "../controllers/ticket.controller.js";

const router = Router();

router.use(authenticate);

router.get('/', listTickets);
router.get(':id', getTicket);
router.post('/', createTicket);
router.patch('/:id', updateticket);
router.delete('/:id', requireRole('admin'),deleteTicket)

export default router;