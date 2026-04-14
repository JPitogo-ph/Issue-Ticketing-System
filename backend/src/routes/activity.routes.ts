import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { listActivity } from "../controllers/activity.controller.js";

const router = Router({mergeParams: true});

router.use(authenticate);
router.get('/', listActivity);

export default router;

