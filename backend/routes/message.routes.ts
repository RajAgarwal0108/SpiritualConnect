import { Router } from "express";
import { getMessagesByRoom, createMessage } from "../controllers/message.controller";

const router = Router();

// GET /api/messages/room/:room
router.get("/room/:room", getMessagesByRoom);

// POST /api/messages
router.post("/", createMessage);

export default router;
