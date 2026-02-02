import type { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const userId = parseInt(idStr || "");

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // 1. Prevent admin from deleting themselves
    if (userId === req.user?.id) {
      return res.status(400).json({ message: "Admin cannot delete their own account." });
    }

    // 2. Handle related records due to foreign key constraints
    await prisma.$transaction([
      // Delete relationships where user is the subject
      prisma.profile.deleteMany({ where: { userId } }),
      prisma.communityMembership.deleteMany({ where: { userId } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }),
      prisma.courseEnrollment.deleteMany({ where: { userId } }),
      prisma.report.deleteMany({ where: { reporterId: userId } }),
      
      // Delete content-related records where user's posts are the target
      prisma.like.deleteMany({ where: { post: { authorId: userId } } }),
      prisma.comment.deleteMany({ where: { post: { authorId: userId } } }),
      prisma.bookmark.deleteMany({ where: { post: { authorId: userId } } }),

      // Delete records where user is the subject (likes, comments etc they made)
      prisma.like.deleteMany({ where: { userId } }),
      prisma.comment.deleteMany({ where: { authorId: userId } }),
      prisma.bookmark.deleteMany({ where: { userId } }),

      // Delete the main content
      prisma.post.deleteMany({ where: { authorId: userId } }),
      prisma.blog.deleteMany({ where: { authorId: userId } }),
      // @ts-ignore
      prisma.blogComment.deleteMany({ where: { authorId: userId } }),
      
      // Finally delete the user
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({ message: "User and all related chronicles deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user", error });
  }
};

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [userCount, postCount, communityCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.community.count()
    ]);
    res.json({ userCount, postCount, communityCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error });
  }
};

export const getAllPosts = async (req: AuthRequest, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true, _count: { select: { comments: true, likes: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const postId = parseInt(idStr || "");
    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post", error });
  }
};

export const getAllReports = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: { reporter: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports", error });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // Mock analytics data for the chart
    const data = [
      { date: "2023-10-01", users: 10, posts: 20 },
      { date: "2023-10-02", users: 15, posts: 35 },
      { date: "2023-10-03", users: 25, posts: 50 },
      { date: "2023-10-04", users: 40, posts: 80 },
      { date: "2023-10-05", users: 60, posts: 120 },
    ];
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, duration, instructor, thumbnail } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: price ? price.toString() : "Free",
        duration,
        instructor: instructor || "Sacred Guide",
        thumbnail,
      },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to create course", error });
  }
};

export const deleteCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const idParam = req.params["id"];
    const idStr = Array.isArray(idParam) ? idParam[0] : idParam;
    const communityId = parseInt(idStr || "");
    
    // Check if community exists
    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Delete community (Prisma will handle Cascade if defined in schema, but let's be careful)
    await prisma.community.delete({ where: { id: communityId } });
    
    res.json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("Delete community error:", error);
    res.status(500).json({ message: "Failed to delete community", error });
  }
};
