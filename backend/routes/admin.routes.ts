import { Router } from "express";
import { 
  getAllUsers, 
  deleteUser, 
  getAdminStats, 
  getAllPosts, 
  deletePost, 
  getAllReports, 
  getAnalytics, 
  createCourse, 
  deleteCommunity,
  getGuideApplications,
  reviewGuideApplication,
  revokeGuideStatus
  , getGuidesOverview, promoteUserToGuide
} from "../controllers/admin.controller";
import { createBlog } from "../controllers/blog.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize(["ADMIN"]));

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/posts", getAllPosts);
router.delete("/posts/:id", deletePost);
router.get("/reports", getAllReports);
router.get("/analytics", getAnalytics);
router.get("/stats", getAdminStats);
router.post("/blogs", createBlog);
router.post("/courses", createCourse);
router.delete("/communities/:id", deleteCommunity);

// Guidance Admin Routes
router.get("/guide-applications", getGuideApplications);
router.patch("/guide-applications/:id", reviewGuideApplication);
router.delete("/guides/:userId", revokeGuideStatus);
router.get("/guides", getGuidesOverview);
router.patch("/guides/:userId", promoteUserToGuide);

export default router;
