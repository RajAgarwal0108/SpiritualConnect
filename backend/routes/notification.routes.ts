import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getNotifications, getUnreadCount, markAllRead, markOneRead } from "../controllers/notification.controller";

const router = Router();

router.get("/", authenticate, getNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.patch("/mark-read", authenticate, markAllRead);
router.patch("/:id/read", authenticate, markOneRead);

export default router;
