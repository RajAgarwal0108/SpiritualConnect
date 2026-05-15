import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getThreadById, getThreadReplies, createThreadReply } from "../controllers/thread.controller";

const router = Router();

router.get("/:id", getThreadById);
router.get("/:id/replies", getThreadReplies);
router.post("/:id/replies", authenticate, createThreadReply);

export default router;
