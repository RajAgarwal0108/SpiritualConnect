import { Router } from "express";
import { getUserProfile, updateProfile, followUser, getAllUsers, getBookmarkedPosts, getOnlineUsers } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, getAllUsers);
router.get("/online", authenticate, getOnlineUsers);
router.get("/me/bookmarks", authenticate, getBookmarkedPosts);
router.get("/:id", getUserProfile);
router.put("/:id", authenticate, updateProfile);
router.post("/:id/follow", authenticate, followUser);

export default router;
