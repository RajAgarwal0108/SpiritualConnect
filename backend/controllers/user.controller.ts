import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { getOnlineUserIds } from "../services/presence.service";

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const userId = parseInt(idStr || "");

    if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
        isGuide: true,
        guideStatus: true,
        guideTitle: true,
        guideBio: true,
        communities: {
          include: {
            community: true
          }
        },
        _count: {
          select: { 
            posts: true, 
            followers: true,
            following: true,
            communities: true // 'communities' corresponds to 'memberships' in schema relations
          }
        }
      }
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Map internal 'communities' count to 'memberships' for frontend compatibility
    // Also map 'communities' array to 'memberships' property
    const { communities, ...userMsg } = user;
    const responseWithCounts = {
        ...userMsg,
        memberships: communities,
        _count: {
            ...user._count,
            memberships: user._count.communities
        }
    };

    res.json(responseWithCounts);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch profile: " + (error instanceof Error ? error.message : String(error)) });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const targetUserId = parseInt(idStr || "");

    if (userId !== targetUserId && req.user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

  const { bio, avatar, name, avatarType, socialLinks, interests } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        name,
        profile: {
          upsert: {
            create: { bio, avatar, avatarType, socialLinks, interests },
            update: { bio, avatar, avatarType, socialLinks, interests }
          }
        }
      },
      include: { profile: true }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error });
  }
};

export const updatePrivacy = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const targetUserId = parseInt(idStr || "");

    if (userId !== targetUserId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { isPrivate } = req.body;
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isPrivate: !!isPrivate },
    });

    res.json({ message: "Privacy setting updated", isPrivate: !!isPrivate });
  } catch (error) {
    res.status(500).json({ message: "Failed to update privacy", error });
  }
};

export const followUser = async (req: AuthRequest, res: Response) => {
  try {
    const followerId = req.user?.id;
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const followingId = parseInt(idStr || "");

    if (!followerId) return res.status(401).json({ message: "Unauthorized" });
    if (followerId === followingId) return res.status(400).json({ message: "Cannot follow yourself" });

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId }
      }
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: { followerId, followingId }
        }
      });
      return res.json({ message: "Unfollowed successfully" });
    }

    await prisma.follow.create({
      data: { followerId, followingId }
    });

    res.json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to follow/unfollow user", error });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const currentUserId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const users = await prisma.user.findMany({
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        name: true,
        role: true,
        profile: {
          select: { avatar: true, bio: true }
        },
        _count: {
          select: { followers: true, following: true, posts: true }
        },
        followers: currentUserId ? { where: { followerId: currentUserId }, select: { id: true } } : false
      }
    });

    const usersWithFollowStatus = users.map((u: any) => ({
      ...u,
      isFollowing: currentUserId ? Array.isArray(u.followers) && u.followers.length > 0 : false,
      followers: undefined // remove the nested followers array from response
    }));

    res.json(usersWithFollowStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

export const getOnlineUsers = async (req: AuthRequest, res: Response) => {
  try {
    const onlineIds = getOnlineUserIds();
    if (onlineIds.length === 0) {
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      where: { id: { in: onlineIds } },
      select: {
        id: true,
        name: true,
        role: true,
        profile: {
          select: { avatar: true, bio: true },
        },
      },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch online users", error });
  }
};

export const getBookmarkedPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const bookmarkedPosts = await prisma.bookmark.findMany({
      where: { userId },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        post: {
          include: {
            author: {
              select: { id: true, name: true, profile: { select: { avatar: true } } }
            },
            community: { select: { id: true, name: true } },
            _count: { select: { comments: true, likes: true, bookmarks: true } },
            likes: { where: { userId }, select: { id: true } },
            bookmarks: { where: { userId }, select: { id: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Transform to include status flags and return just the posts
    const posts = bookmarkedPosts.map((bookmark: any) => ({
      ...bookmark.post,
      isLiked: bookmark.post.likes.length > 0,
      isBookmarked: bookmark.post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined
    }));

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookmarked posts", error });
  }
};
