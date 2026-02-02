import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import type { AuthRequest } from "../middlewares/auth.middleware";

// Helper for safe integer parsing
const parseId = (id: any): number | null => {
  const parsed = parseInt(id, 10);
  return isNaN(parsed) ? null : parsed;
};

export const getAllCommunities = async (req: Request, res: Response) => {
  try {
    // CRITICAL: Added pagination to prevent memory overflow
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { members: true, posts: true }
          }
        },
        orderBy: {  
          memberCount: 'desc' // IMPORTANT: showing most popular first is usually better
        }
      }),
      prisma.community.count()
    ]);

    res.json({
      data: communities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching communities:", error); // IMPORTANT: Server-side logging
    res.status(500).json({ message: "Error fetching communities" }); // SECURITY: Don't leak raw error
  }
};

export const getCommunityById = async (req: Request, res: Response) => {
  try {
    // IMPORTANT: Input validation
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Valid Community ID is required" });

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true, posts: true }
        }
      }
    });

    if (!community) return res.status(404).json({ message: "Community not found" });
    res.json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({ message: "Error fetching community" });
  }
};

export const createCommunity = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    // IMPORTANT: Basic validation
    if (!name || name.length < 3) {
        return res.status(400).json({ message: "Name must be at least 3 characters" });
    }

    const community = await prisma.community.create({
      data: { name, description }
    });
    res.status(201).json(community);
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ message: "Error creating community" });
  }
};

export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Valid Community ID is required" });
    
    // IMPORTANT: Type safety with AuthRequest
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // CRITICAL: Use transaction for atomicity (membership + count update)
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Check if already a member
      const existingMembership = await tx.communityMembership.findUnique({
        where: {
          userId_communityId: {
            userId,
            communityId: id
          }
        }
      });

      if (existingMembership) {
        throw new Error("ALREADY_MEMBER");
      }

      const membership = await tx.communityMembership.create({
        data: {
          userId,
          communityId: id,
          role: "MEMBER"
        }
      });

      // Update member count safely
      await tx.community.update({
        where: { id },
        data: { memberCount: { increment: 1 } }
      });

      return membership;
    });

    res.json({ message: "Successfully joined community", membership: result });
  } catch (error: any) {
    if (error.message === "ALREADY_MEMBER") {
        return res.status(400).json({ message: "Already a member of this community" });
    }
    console.error("Error joining community:", error);
    res.status(500).json({ message: "Error joining community" });
  }
};

export const getJoinedCommunities = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const memberships = await prisma.communityMembership.findMany({
      where: { userId },
      include: { 
        community: true // OPTIONAL: Select specific fields if needed
      }
    });
    res.json(memberships.map((m: any) => m.community));
  } catch (error) {
    console.error("Error fetching joined communities:", error);
    res.status(500).json({ message: "Error fetching joined communities" });
  }
};

export const getCommunityMembers = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Valid Community ID is required" });

    const memberships = await prisma.communityMembership.findMany({
      where: { communityId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatar: true, bio: true } },
            _count: { select: { followers: true, following: true } }
          }
        }
      },
      orderBy: { joinedAt: "desc" }
    });

    res.json(memberships.map((m) => m.user));
  } catch (error) {
    console.error("Error fetching community members:", error);
    res.status(500).json({ message: "Error fetching community members" });
  }
};

export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Valid Community ID is required" });
    
    const userId = (req as AuthRequest).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // CRITICAL: Transaction for consistency
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const membership = await tx.communityMembership.findUnique({
          where: { userId_communityId: { userId, communityId: id } }
      });

      if (!membership) throw new Error("NOT_MEMBER");

      await tx.communityMembership.delete({
        where: {
          userId_communityId: { userId, communityId: id }
        }
      });

      await tx.community.update({
        where: { id },
        data: { memberCount: { decrement: 1 } }
      });
    });

    res.json({ message: "Successfully left community" });
  } catch (error: any) {
    if (error.message === "NOT_MEMBER") {
        return res.status(400).json({ message: "Not a member of this community" });
    }
    console.error("Error leaving community:", error);
    res.status(500).json({ message: "Error leaving community" });
  }
};

export const getCommunityPosts = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "Valid Community ID is required" });

    const type = (req.query.type as string | undefined)?.toLowerCase();
    const statusFilter = type === "discussion" ? "DISCUSSION" : "PUBLISHED";

    // CRITICAL: Pagination to prevent crashes on large communities
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20)); // Limit max fetch size
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { 
        communityId: id,
        isDeleted: false,
        status: statusFilter
      },
      take: limit,
      skip: skip,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatar: true
              }
            }
          }
        },
        community: {
          select: {
            id: true,
            name: true
          }
        },
        comments: {
           // IMPORTANT: Limit comments per post in feed to prevent huge payload
           // Ideally, fetch comments separately appropriately
           take: 3, 
           orderBy: { createdAt: 'desc' },
           include: {
            author: {
              select: {
                id: true,
                name: true,
                profile: { select: { avatar: true } }
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching community posts:", error);
    res.status(500).json({ message: "Error fetching community posts" });
  }
};
