import { Router } from "express";
import { getBlogs, getBlogById, createBlog, createBlogComment, deleteBlog } from "../controllers/blog.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", authenticate, createBlog);
router.delete("/:id", authenticate, deleteBlog);
router.post("/:id/comments", authenticate, createBlogComment);

export default router;
