import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

const parseId = (id: any): number | null => {
  const parsed = parseInt(id, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeTags = (raw: unknown): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);
  }

  return [];
};

const allowedReplyTypes = new Set(["GENERAL", "BLESSING", "PRACTICE", "TEXT"]);

export const getCommunityThreads = async (req: Request, res: Response) => {
  try {
    const communityId = parseId(req.params.id);
    if (!communityId) return res.status(400).json({ message: "Valid Community ID is required" });

    const sort = String(req.query.sort || "recent").toLowerCase();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: any = { communityId };
    if (sort === "unanswered") {
      where.replies = { none: {} };
    }

    const orderBy: any[] = [{ isPinned: "desc" }];
    if (sort === "new") {
      orderBy.push({ createdAt: "desc" });
    } else {
      orderBy.push({ lastActivityAt: "desc" });
    }

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        take: limit,
        skip,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profile: { select: { avatar: true } }
            }
          },
          _count: { select: { replies: true } }
        },
        orderBy
      }),
      prisma.thread.count({ where })
    ]);

    res.json({
      data: threads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching community threads:", error);
    res.status(500).json({ message: "Error fetching threads" });
  }
};

export const createThread = async (req: AuthRequest, res: Response) => {
  try {
    const communityId = parseId(req.params.id);
    if (!communityId) return res.status(400).json({ message: "Valid Community ID is required" });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const title = String(req.body.title || "").trim();
    const body = String(req.body.body || "").trim();
    const tags = normalizeTags(req.body.tags);

    if (title.length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters" });
    }

    if (body.length < 10) {
      return res.status(400).json({ message: "Reflection must be at least 10 characters" });
    }

    const thread = await prisma.thread.create({
      data: {
        title,
        body,
        tags,
        authorId: userId,
        communityId,
        lastActivityAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatar: true } }
          }
        },
        _count: { select: { replies: true } }
      }
    });

    res.status(201).json(thread);
  } catch (error) {
    console.error("Error creating thread:", error);
    res.status(500).json({ message: "Error creating thread" });
  }
};

export const getThreadById = async (req: Request, res: Response) => {
  try {
    const threadId = parseId(req.params.id);
    if (!threadId) return res.status(400).json({ message: "Valid Thread ID is required" });

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatar: true } }
          }
        },
        community: { select: { id: true, name: true } },
        _count: { select: { replies: true } }
      }
    });

    if (!thread) return res.status(404).json({ message: "Thread not found" });
    res.json(thread);
  } catch (error) {
    console.error("Error fetching thread:", error);
    res.status(500).json({ message: "Error fetching thread" });
  }
};

export const getThreadReplies = async (req: Request, res: Response) => {
  try {
    const threadId = parseId(req.params.id);
    if (!threadId) return res.status(400).json({ message: "Valid Thread ID is required" });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 100));
    const skip = (page - 1) * limit;

    const replies = await prisma.threadReply.findMany({
      where: { threadId },
      take: limit,
      skip,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatar: true } }
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    res.json(replies);
  } catch (error) {
    console.error("Error fetching thread replies:", error);
    res.status(500).json({ message: "Error fetching replies" });
  }
};

export const createThreadReply = async (req: AuthRequest, res: Response) => {
  try {
    const threadId = parseId(req.params.id);
    if (!threadId) return res.status(400).json({ message: "Valid Thread ID is required" });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const body = String(req.body.body || "").trim();
    const replyTypeRaw = String(req.body.replyType || "GENERAL").toUpperCase();
    const parentId = req.body.parentId ? parseId(req.body.parentId) : null;

    if (!body) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    if (!allowedReplyTypes.has(replyTypeRaw)) {
      return res.status(400).json({ message: "Invalid reply type" });
    }

    if (parentId) {
      const parent = await prisma.threadReply.findUnique({ where: { id: parentId } });
      if (!parent || parent.threadId !== threadId) {
        return res.status(400).json({ message: "Parent reply not found" });
      }
    }

    const [reply] = await prisma.$transaction([
      prisma.threadReply.create({
        data: {
          body,
          replyType: replyTypeRaw as "GENERAL" | "BLESSING" | "PRACTICE" | "TEXT",
          authorId: userId,
          threadId,
          parentId: parentId || null
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profile: { select: { avatar: true } }
            }
          }
        }
      }),
      prisma.thread.update({
        where: { id: threadId },
        data: { lastActivityAt: new Date() }
      })
    ]);

    res.status(201).json(reply);
  } catch (error) {
    console.error("Error creating thread reply:", error);
    res.status(500).json({ message: "Error creating reply" });
  }
};
