import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.query;
    const userId = req.user?.id;
    const where: any = {};
    
    if (communityId) {
      where.communityId = parseInt(communityId as string);
    } else if (userId) {
      // If global feed and logged in, show posts from joined communities
      const memberships = await prisma.communityMembership.findMany({
        where: { userId },
        select: { communityId: true }
      });
      const joinedIds = memberships.map((m: { communityId: number }) => m.communityId);
      if (joinedIds.length > 0) {
        where.communityId = { in: joinedIds };
      }
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, profile: { select: { avatar: true } } }
        },
        community: { select: { id: true, name: true } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
        bookmarks: userId ? { where: { userId }, select: { id: true } } : false
      },
      orderBy: { createdAt: "desc" }
    });

    // Transform posts to include isLiked and isBookmarked flags
    const postsWithStatus = posts.map(post => ({
      ...post,
      isLiked: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      isBookmarked: Array.isArray(post.bookmarks) ? post.bookmarks.length > 0 : false,
      likes: undefined, // Remove the likes array
      bookmarks: undefined // Remove the bookmarks array
    }));

    res.json(postsWithStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
  const { content, media, communityId, status } = req.body;
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

  // Allow discussions via status override
  const normalizedStatus = typeof status === "string" && status.toUpperCase() === "DISCUSSION" ? "DISCUSSION" : "PUBLISHED";

    const post = await prisma.post.create({
      data: {
        content,
        media,
        status: normalizedStatus,
        authorId,
        communityId: parseInt(communityId)
      },
      include: {
        author: {
          select: { id: true, name: true, profile: { select: { avatar: true } } }
        },
        community: { select: { id: true, name: true } },
        _count: { select: { comments: true } }
      }
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content, parentId: rawParentId } = req.body;
    const postId = parseInt(req.params["id"] as string);
    const authorId = req.user?.id;
    const parentId = rawParentId ? parseInt(rawParentId.toString()) : null;

    if (!authorId) return res.status(401).json({ message: "Unauthorized" });
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID" });
    }

    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parentComment) {
        return res.status(400).json({ message: "Parent comment not found" });
      }
      if (parentComment.postId !== postId) {
        return res.status(400).json({ message: "Parent comment does not belong to this post" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId,
        parentId: parentId
      },
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
        }
      }
    });

    const commentCount = await prisma.comment.count({
      where: { postId }
    });

    res.status(201).json({ ...comment, commentCount });
  } catch (error) {
    console.error("Comment creation error:", error);
    res.status(500).json({ 
      message: "Failed to add comment", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["commentId"];
    const commentIdStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const commentId = parseInt(commentIdStr || "");
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.authorId !== userId) return res.status(403).json({ message: "You can only delete your own comments" });

    const postId = comment.postId;
    await prisma.comment.delete({ where: { id: commentId } });

    const commentCount = await prisma.comment.count({
      where: { postId }
    });

    res.json({ message: "Comment deleted", commentCount });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Failed to delete comment", error });
  }
};

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["id"];
    const postIdStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const postId = parseInt(postIdStr || "");
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      const likeCount = await prisma.like.count({ where: { postId } });
      return res.json({ message: "Post unliked", isLiked: false, likeCount });
    }

    await prisma.like.create({ data: { userId, postId } });
    const likeCount = await prisma.like.count({ where: { postId } });
    res.json({ message: "Post liked", isLiked: true, likeCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to like post", error });
  }
};

export const bookmarkPost = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["id"];
    const postIdStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const postId = parseInt(postIdStr || "");
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const existingBookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({ where: { id: existingBookmark.id } });
      return res.json({ message: "Bookmark removed" });
    }

    await prisma.bookmark.create({ data: { userId, postId } });
    res.json({ message: "Post bookmarked" });
  } catch (error) {
    res.status(500).json({ message: "Failed to bookmark post", error });
  }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const postId = parseInt(idStr || "");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { id: true, name: true, profile: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, profile: true }
            }
          },
          orderBy: { createdAt: "asc" }
        },
        _count: {
          select: { comments: true, likes: true, bookmarks: true }
        }
      }
    });

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch post", error });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const postId = parseInt(idStr || "");
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await prisma.post.delete({
      where: { id: postId }
    });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error });
  }
};

export const getUserPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userIdParam = req.params["userId"];
    const userIdStr = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;
    const userId = parseInt(userIdStr || "");
    const currentUserId = req.user?.id;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: { id: true, name: true, profile: { select: { avatar: true } } }
        },
        community: { select: { id: true, name: true } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
        likes: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false,
        bookmarks: currentUserId ? { where: { userId: currentUserId }, select: { id: true } } : false
      },
      orderBy: { createdAt: "desc" }
    });

    // Transform posts to include isLiked and isBookmarked flags
    const postsWithStatus = posts.map((post: any) => ({
      ...post,
      isLiked: Array.isArray(post.likes) ? post.likes.length > 0 : false,
      isBookmarked: Array.isArray(post.bookmarks) ? post.bookmarks.length > 0 : false,
      likes: undefined, // Remove the likes array
      bookmarks: undefined // Remove the bookmarks array
    }));

    res.json(postsWithStatus);
  } catch (error) {
    console.error("Failed to fetch user posts:", error);
    res.status(500).json({ message: "Failed to fetch user posts", error });
  }
};
