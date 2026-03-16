import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const userProfileSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  profile: true,
};

export const googleLogin = async (req: Request, res: Response) => {
  const { code, redirectUri } = req.body;

  try {
    // 1. Exchange Code for Access Token
    const callbackUrl = redirectUri || process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/google-callback";
    const tokenPayload = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      code,
      grant_type: "authorization_code",
      redirect_uri: callbackUrl,
    });

    const { data: tokenData } = await axios.post("https://oauth2.googleapis.com/token", tokenPayload.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const googleAccessToken = tokenData.access_token;

    // 2. Get User Info from Google
    const { data: googleUser } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${googleAccessToken}` }
    });

    const email = googleUser.email;
    const name = googleUser.name;
    const avatar = googleUser.picture;

    // 3. Find or Create User
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
    console.error("Google Auth Error:", error.response?.data || error.message);
    res.status(400).json({
      message: "Google Authentication Failed",
      error: error.response?.data || error.message,
      details: error.response?.data,
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
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`,
            avatarType: "library",
          },
        },
      },
      include: { profile: true },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

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
