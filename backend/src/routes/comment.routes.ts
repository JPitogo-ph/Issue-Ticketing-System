import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware.js";
import { createComment, listComments, deleteComment } from "../controllers/comment.controller.js";

const router = Router({mergeParams: true});

router.use(authenticate);

router.get('/', listComments);
router.post('/', createComment);
router.delete('/:commentId', deleteComment);

export default router;