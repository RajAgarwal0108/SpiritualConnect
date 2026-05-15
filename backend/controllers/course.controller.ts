import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getCourses = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
        include: {
          _count: { select: { enrollments: true } },
          modules: {
            select: { id: true, title: true, order: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.course.count()
    ]);

    res.json({
      data: courses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses" });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
    if (!id) return res.status(400).json({ message: "Valid Course ID is required" });

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true } },
        modules: {
          include: { lessons: { select: { id: true, title: true, duration: true, order: true } } },
          orderBy: { order: "asc" }
        }
      }
    });

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Error fetching course" });
  }
};
