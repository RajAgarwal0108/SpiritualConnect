import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getMessagesByRoom = async (req: Request, res: Response) => {
  const { room } = req.params as { room: string };
  if (!room) return res.status(400).json({ message: "Room id is required" });
  try {
    const messages = await prisma.message.findMany({
      where: { room },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  const { room, senderId, senderName, content } = req.body;
  if (!room || !senderId || !content) return res.status(400).json({ message: "Invalid payload" });
  try {
    const msg = await prisma.message.create({
      data: {
        room,
        senderId,
        senderName,
        content,
      },
    });
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: "Failed to save message", error });
  }
};
