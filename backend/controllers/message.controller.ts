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

export const getConversationsByUser = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Valid userId is required" });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { room: { contains: `${userId}-` } },
          { room: { contains: `-${userId}` } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        room: true,
        senderId: true,
        content: true,
        createdAt: true,
      },
    });

    type LatestRow = {
      room: string;
      senderId: number;
      content: string;
      createdAt: Date;
      peerId: number;
    };

    const latestByRoom = new Map<string, LatestRow>();
    for (const m of messages) {
      if (latestByRoom.has(m.room)) continue;
      const parts = m.room.split("-");
      if (parts.length !== 2) continue;

      const a = Number(parts[0]);
      const b = Number(parts[1]);
      if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
      if (a !== userId && b !== userId) continue;

      const peerId = a === userId ? b : a;
      latestByRoom.set(m.room, {
        room: m.room,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt,
        peerId,
      });
    }

    const latestRows = Array.from(latestByRoom.values());
    const peerIds = Array.from(new Set(latestRows.map((r) => r.peerId))).filter((id) => Number.isInteger(id));
    if (peerIds.length === 0) {
      return res.json([]);
    }

    const peers = await prisma.user.findMany({
      where: { id: { in: peerIds } },
      select: {
        id: true,
        name: true,
        email: true,
        profile: { select: { avatar: true } },
      },
    });

    const peerMap = new Map(peers.map((p) => [p.id, p]));

    const conversations = latestRows
      .map((row) => {
        const peer = peerMap.get(row.peerId);
        if (!peer) return null;
        return {
          room: row.room,
          peer,
          latestMessage: row.content,
          latestAt: row.createdAt,
          isOwnLastMessage: row.senderId === userId,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());

    return res.json(conversations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch conversations", error });
  }
};
