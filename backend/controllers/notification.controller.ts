import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const cursor = req.query.cursor as string | undefined;

    const where: any = { userId };
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: { select: { id: true, name: true, profile: { select: { avatar: true } } } },
      },
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const count = await prisma.notification.count({
      where: { userId, readAt: null },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch unread count", error });
  }
};

export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications as read", error });
  }
};

export const markOneRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const id = parseInt(req.params["id"] || "");
    if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid notification id" });

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notification as read", error });
  }
};
