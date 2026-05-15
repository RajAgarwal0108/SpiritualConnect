import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";

export const getMessagesByRoom = async (req: AuthRequest, res: Response) => {
  const { room } = req.params as { room: string };
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const cursor = req.query.cursor as string | undefined;

  if (!room) return res.status(400).json({ message: "Room id is required" });

  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const userId = req.user.id;
  const parts = room.split("-");
  if (parts.length !== 2 || ![parts[0], parts[1]].includes(String(userId))) {
    return res.status(403).json({ message: "Access denied to this room" });
  }

  try {
    const where: any = { room };
    if (cursor) {
      where.createdAt = { lt: new Date(cursor) };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error });
  }
};

export const createMessage = async (req: AuthRequest, res: Response) => {
  const { room, senderName, content } = req.body;
  const senderId = req.user?.id;

  if (!room || !content) return res.status(400).json({ message: "Invalid payload" });

  const parts = room.split("-");
  if (parts.length !== 2 || ![parts[0], parts[1]].includes(String(senderId))) {
    return res.status(403).json({ message: "Access denied to this room" });
  }

  try {
    const msg = await prisma.message.create({
      data: {
        room,
        senderId: senderId!,
        senderName: senderName || req.user?.id,
        content,
      },
    });
    res.json(msg);
  } catch (error) {
    res.status(500).json({ message: "Failed to save message", error });
  }
};

export const getConversationsByUser = async (req: AuthRequest, res: Response) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ message: "Valid userId is required" });
  }

  if (!req.user || req.user.id !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { room: { startsWith: `${userId}-` } },
          { room: { endsWith: `-${userId}` } },
        ],
      },
      orderBy: { createdAt: "desc" },
      distinct: ["room"],
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

    const latestRows: LatestRow[] = [];
    for (const m of messages) {
      const parts = m.room.split("-");
      if (parts.length !== 2) continue;

      const a = Number(parts[0]);
      const b = Number(parts[1]);
      if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
      if (a !== userId && b !== userId) continue;

      const peerId = a === userId ? b : a;
      latestRows.push({
        room: m.room,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt,
        peerId,
      });
    }

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
