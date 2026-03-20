import { Router } from "express";
import { getMessagesByRoom, createMessage, getConversationsByUser } from "../controllers/message.controller";

const router = Router();

// GET /api/messages/room/:room
router.get("/room/:room", getMessagesByRoom);

// GET /api/messages/conversations/:userId
router.get("/conversations/:userId", getConversationsByUser);

// POST /api/messages
router.post("/", createMessage);

export default router;
