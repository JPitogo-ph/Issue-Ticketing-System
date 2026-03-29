import { Router } from "express";
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import usersRouter from './user.route.js';
import ticketsRouter from './ticket.routes.js'

const router = Router();

router.use('/v1/health', healthRouter);
router.use('/v1/auth', authRouter);
router.use('/v1/users', usersRouter);
router.use('/v1/tickets', ticketsRouter);

export default router;