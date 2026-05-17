import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { createNotification } from "../services/notification.service";

const isMutualConnection = async (userId: number, peerId: number) => {
  if (!Number.isInteger(userId) || !Number.isInteger(peerId)) return false;

  const count = await prisma.follow.count({
    where: {
      OR: [
        { followerId: userId, followingId: peerId },
        { followerId: peerId, followingId: userId },
      ],
    },
  });

  return count >= 2;
};

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

  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return res.status(400).json({ message: "Invalid room id" });
  }

  const peerId = a === userId ? b : a;
  const isConnected = await isMutualConnection(userId, peerId);
  if (!isConnected) {
    return res.status(403).json({ message: "Messaging is available only for mutual connections" });
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

  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return res.status(400).json({ message: "Invalid room id" });
  }

  const peerId = a === senderId ? b : a;
  const isConnected = await isMutualConnection(senderId || 0, peerId);
  if (!isConnected) {
    return res.status(403).json({ message: "Messaging is available only for mutual connections" });
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

    const parts = room.split("-");
    const recipientId = parts.length === 2
      ? Number(parts[0]) === senderId
        ? Number(parts[1])
        : Number(parts[0])
      : null;

    if (recipientId && Number.isInteger(recipientId)) {
      await createNotification({
        userId: recipientId,
        actorId: senderId,
        type: "MESSAGE_RECEIVED",
        targetType: "MESSAGE",
        targetId: String(msg.id),
      });
    }

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

  let lastReadTimestamps: Record<string, string> = {};
  try {
    if (req.query.lastReadTimestamps) {
      lastReadTimestamps = JSON.parse(req.query.lastReadTimestamps as string);
    }
  } catch { /* ignore malformed JSON */ }

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

    // Compute unread counts per room
    const roomUnreadCounts: Record<string, number> = {};
    for (const row of latestRows) {
      const lastRead = lastReadTimestamps[row.room];
      if (lastRead) {
        const since = new Date(lastRead);
        const count = await prisma.message.count({
          where: {
            room: row.room,
            senderId: { not: userId },
            createdAt: { gt: since },
          },
        });
        roomUnreadCounts[row.room] = count;
      } else {
        roomUnreadCounts[row.room] = 0;
      }
    }

    const peerIds = Array.from(new Set(latestRows.map((r) => r.peerId))).filter((id) => Number.isInteger(id));
    if (peerIds.length === 0) {
      return res.json([]);
    }

    const followRows = await prisma.follow.findMany({
      where: {
        OR: [
          { followerId: userId, followingId: { in: peerIds } },
          { followerId: { in: peerIds }, followingId: userId },
        ],
      },
      select: { followerId: true, followingId: true },
    });

    const followsFromUser = new Set(
      followRows.filter((r) => r.followerId === userId).map((r) => r.followingId)
    );
    const followsToUser = new Set(
      followRows.filter((r) => r.followingId === userId).map((r) => r.followerId)
    );
    const mutualPeerIds = new Set(
      peerIds.filter((peerId) => followsFromUser.has(peerId) && followsToUser.has(peerId))
    );

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
      .filter((row) => mutualPeerIds.has(row.peerId))
      .map((row) => {
        const peer = peerMap.get(row.peerId);
        if (!peer) return null;
        return {
          room: row.room,
          peer,
          latestMessage: row.content,
          latestAt: row.createdAt,
          isOwnLastMessage: row.senderId === userId,
          unreadCount: roomUnreadCounts[row.room] || 0,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());

    return res.json(conversations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch conversations", error });
  }
};
