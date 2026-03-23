import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { requireRole } from "../middleware/requireRole.middleware.js";
import { getUserHandler, updateUserHandler, deleteUserHandler } from "../controllers/user.controller.js";

const router = Router();

router.use(authenticate);

router.get('/:id', getUserHandler);
router.patch('/:id', updateUserHandler);
router.delete('/:id', requireRole('admin'), deleteUserHandler);

export default router;