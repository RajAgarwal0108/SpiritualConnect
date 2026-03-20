import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { prisma } from "../lib/prisma";
import { createVerificationToken, consumeVerificationToken } from "../lib/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const userProfileSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  profile: true,
};

const parseMinutes = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return fallback;
};

const VERIFICATION_TOKEN_EXPIRY_MINUTES = parseMinutes(process.env.VERIFICATION_CODE_EXPIRY_MINUTES, 60);
const RESET_TOKEN_EXPIRY_MINUTES = parseMinutes(process.env.RESET_CODE_EXPIRY_MINUTES, 15);

const genericVerificationResponse = { message: "If an account exists, a verification email has been sent" };
const genericResetResponse = { message: "If an account exists, a password reset link has been sent" };

export const googleLogin = async (req: Request, res: Response) => {
  const { code, redirectUri } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ message: "Missing Google authorization code" });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ message: "Google OAuth is not configured on the server" });
    }

    const callbackUrl = redirectUri || process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/google-callback";
    const tokenPayload = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: callbackUrl,
    });

    const { data: tokenData } = await axios.post("https://oauth2.googleapis.com/token", tokenPayload.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const googleAccessToken = tokenData.access_token;

    const { data: googleUser } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });

    const email = googleUser.email;
    const name = googleUser.name;
    const avatar = googleUser.picture;

    let user = await prisma.user.findUnique({
      where: { email },
      select: userProfileSelect,
    });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          isVerified: true,
          emailVerified: new Date(),
          profile: {
            create: {
              avatar,
              avatarType: "custom",
              bio: "Vedic Seeker joined via Google",
            },
          },
        },
        include: { profile: true },
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: userProfileSelect,
    });

    if (!userWithProfile) {
      return res.status(500).json({ message: "Failed to load user profile after Google login" });
    }

    res.json({ token, user: userWithProfile });
  } catch (error: any) {
    const providerError = error.response?.data;
    const providerMessage =
      providerError?.error_description || providerError?.error || error.message || "Google Authentication Failed";

    console.error("Google Auth Error:", providerError || error.message);
    res.status(400).json({
      message: providerMessage,
      error: providerError || error.message,
      details: providerError,
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        profile: {
          create: {
            bio: "",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, "")}`,
            avatarType: "library",
          },
        },
      },
      include: { profile: true },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    try {
      const verificationToken = await createVerificationToken(user.id, "EMAIL_VERIFICATION", VERIFICATION_TOKEN_EXPIRY_MINUTES);
      await sendVerificationEmail(user.email, verificationToken, VERIFICATION_TOKEN_EXPIRY_MINUTES);
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    const userWithProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: userProfileSelect,
    });

    if (!userWithProfile) {
      return res.status(500).json({ message: "Failed to load user profile" });
    }

    res.json({ token, user: userWithProfile });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    const user = await consumeVerificationToken(token, "EMAIL_VERIFICATION");
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    if (user.isVerified) {
      return res.json({ message: "Email already verified" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, emailVerified: new Date() },
    });

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email verification failed", error });
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) {
      return res.json(genericVerificationResponse);
    }

    try {
      const verificationToken = await createVerificationToken(user.id, "EMAIL_VERIFICATION", VERIFICATION_TOKEN_EXPIRY_MINUTES);
      await sendVerificationEmail(user.email, verificationToken, VERIFICATION_TOKEN_EXPIRY_MINUTES);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
    }

    res.json(genericVerificationResponse);
  } catch (error) {
    res.status(500).json({ message: "Failed to resend verification email", error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json(genericResetResponse);
    }

    try {
      const resetToken = await createVerificationToken(user.id, "PASSWORD_RESET", RESET_TOKEN_EXPIRY_MINUTES);
      await sendPasswordResetEmail(user.email, resetToken, RESET_TOKEN_EXPIRY_MINUTES);
    } catch (error) {
      console.error("Failed to send reset email:", error);
    }

    res.json(genericResetResponse);
  } catch (error) {
    res.status(500).json({ message: "Forgot password flow failed", error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    const user = await consumeVerificationToken(token, "PASSWORD_RESET");
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password has been reset" });
  } catch (error) {
    res.status(500).json({ message: "Reset password failed", error });
  }
};
