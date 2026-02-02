import { Router } from "express";
import { getPosts, createPost, createComment, likePost, bookmarkPost, getPostById, deletePost, getUserPosts, deleteComment } from "../controllers/post.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", authenticate, createPost);
router.post("/:id/comment", authenticate, createComment);
router.delete("/:postId/comments/:commentId", authenticate, deleteComment);
router.post("/:id/like", authenticate, likePost);
router.post("/:id/bookmark", authenticate, bookmarkPost);
router.delete("/:id", authenticate, deletePost);
router.get("/user/:userId", getUserPosts);

export default router;
