import { Router } from "express";
import {
	register,
	login,
	googleLogin,
	verifyEmail,
	resendVerification,
	forgotPassword,
	resetPassword,
} from "../controllers/auth.controller.ts";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
