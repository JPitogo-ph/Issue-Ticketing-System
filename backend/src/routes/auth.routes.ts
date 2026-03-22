import { Router } from "express";
import { signupHandler, loginHandler, logoutHandler, meHandler } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.middleware.js";

const router = Router();

router.post('/signup', signupHandler);
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.get('/me', authenticate, meHandler);

export default router;