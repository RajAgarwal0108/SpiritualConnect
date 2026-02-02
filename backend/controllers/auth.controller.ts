import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { prisma } from "../lib/prisma";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const googleLogin = async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    // 1. Exchange Code for Access Token
    const { data: tokenData } = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: "http://localhost:3000/google-callback" // Must match frontend exactly
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
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
       // Create new user with random password (since they use Google)
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
                 bio: "Vedic Seeker joined via Google"
               } 
             } 
          }
       });
    }

    // 4. Issue standard JWT
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });

  } catch (error: any) {
    console.error("Google Auth Error:", error.response?.data || error.message);
    res.status(400).json({ message: "Google Authentication Failed", error: error.response?.data || error.message });
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
            avatarType: "library"
          }
        }
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
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

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};
