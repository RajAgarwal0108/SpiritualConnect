import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      include: {
        author: {
          select: { id: true, name: true, profile: { select: { avatar: true } } }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blogs", error });
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "ID is required" });
    
    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        author: {
          select: { id: true, name: true, profile: { select: { avatar: true } } }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, profile: { select: { avatar: true } } }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch blog", error });
  }
};

export const createBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { title, excerpt, content, category, readTime, coverImage } = req.body;
    const authorId = req.user?.id;

    if (!authorId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await prisma.blog.create({
      data: {
        title,
        excerpt,
        content,
        category,
        readTime: readTime || "5 min read",
        coverImage,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, profile: { select: { avatar: true } } }
        }
      }
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: "Failed to create blog", error });
  }
};

export const deleteBlog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const blog = await prisma.blog.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Allow deletion if user is author OR admin
    if (blog.authorId !== userId && userRole !== "ADMIN") {
      return res.status(403).json({ message: "You are not authorized to delete this chronicle." });
    }

    await prisma.blog.delete({
      where: { id: parseInt(id as string) },
    });

    res.json({ message: "Chronicle removed from the records." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete blog", error });
  }
};

export const createBlogComment = async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Blog ID is required" });
    const blogId = parseInt(id as string);
    const authorId = req.user?.id;

    if (!authorId) return res.status(401).json({ message: "Unauthorized" });
    if (!content) return res.status(400).json({ message: "Content is required" });

    // @ts-ignore
    const comment = await prisma.blogComment.create({
      data: {
        content,
        blogId,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, profile: { select: { avatar: true } } }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create comment", error });
  }
};
