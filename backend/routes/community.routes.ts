import { Router } from "express";
import { 
  getAllCommunities, 
  getCommunityById, 
  createCommunity, 
  joinCommunity,
  leaveCommunity,
  getJoinedCommunities,
  getCommunityPosts,
  getCommunityMembers
} from "../controllers/community.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllCommunities);
router.get("/joined", authenticate, getJoinedCommunities);
router.get("/:id", getCommunityById);
router.get("/:id/members", authenticate, getCommunityMembers);
router.get("/:id/posts", getCommunityPosts);
router.post("/", authenticate, createCommunity);
router.post("/:id/join", authenticate, joinCommunity);
router.delete("/:id/leave", authenticate, leaveCommunity);

export default router;
