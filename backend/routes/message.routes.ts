import { Router } from "express";
import { getMessagesByRoom, createMessage, getConversationsByUser } from "../controllers/message.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/room/:room", authenticate, getMessagesByRoom);
router.get("/conversations/:userId", authenticate, getConversationsByUser);
router.post("/", authenticate, createMessage);

export default router;
