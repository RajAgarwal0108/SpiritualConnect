import "./config/init-env";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import communityRoutes from "./routes/community.routes";
import blogRoutes from "./routes/blog.routes";
import messageRoutes from "./routes/message.routes";
import threadRoutes from "./routes/thread.routes";
import aiRoutes from "./routes/ai.routes";
import guidanceRoutes from "./routes/guidance.routes";
import courseRoutes from "./routes/course.routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import { StorageService } from "./services/storage.service";
import { registerUserSocket, unregisterUserSocket, getOnlineUserIds } from "./services/presence.service";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const app = express();
const httpServer = createServer(app);

const STORAGE_TYPE = process.env.STORAGE_TYPE || "local";

// Shared CORS configuration — apply before any route or middleware so
// preflight OPTIONS requests are handled correctly for REST and Socket.IO.
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://spiritualconnect-frontend.onrender.com",
  "https://spiritualconnect.vercel.app",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (Postman, curl)
    if (!origin) return callback(null, true);

    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.map(o => o.replace(/\/$/, "")).includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

// Apply CORS early so preflight requests are answered correctly
app.use(cors(corsOptions));
// CORS preflight is handled by the middleware above


// Logging
app.use(morgan("dev"));

// File Upload Setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

// Configure Multer - always use memory storage and let StorageService handle it
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Cloudinary free tier limit)
  }
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const io = new Server(httpServer, {
  cors: corsOptions,
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    (socket as any).user = decoded;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

const selectOnlineUserFields = {
  id: true,
  name: true,
  profile: {
    select: {
      avatar: true,
      bio: true,
    },
  },
};

const emitOnlineUsers = async () => {
  const onlineIds = getOnlineUserIds();
  if (onlineIds.length === 0) {
    io.emit("online_users", []);
    return;
  }

  const users = await prisma.user.findMany({
    where: { id: { in: onlineIds } },
    select: selectOnlineUserFields,
  });

  io.emit("online_users", users);
};

const port = process.env.PORT || 3001;

export { app, prisma };

app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "ok", 
      database: "connected",
      message: "SpiritualConnect API is running" 
    });
  } catch (error) {
    res.status(503).json({ 
      status: "error", 
      database: "disconnected",
      message: "API is running but database is unreachable",
      error: (error as any).message
    });
  }
});

// Root route — redirect to health or return a small welcome payload so the
// deployed service doesn't return 404 for `/`.
app.get("/", (req, res) => {
  res.redirect(302, "/api/health");
});

// Swagger Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, "docs/swagger.yaml"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log("Swagger UI available at /api-docs");
} catch (err) {
  console.error("Failed to load swagger.yaml:", err);
}

// File Upload Endpoint
app.post("/api/upload", (req, res, next) => {
  console.log(`[${new Date().toISOString()}] Upload route hit from origin: ${req.headers.origin}`);
  next();
}, upload.single("file"), async (req, res) => {
  if (!req.file) {
    console.warn("Upload attempt with no file");
    return res.status(400).json({ message: "No file uploaded" });
  }

  console.log(`Processing upload: ${req.file.originalname} (${req.file.size} bytes)`);
  try {
    const url = await StorageService.uploadFile(req.file.buffer, req.file.originalname);
    console.log("Upload success:", url);
    res.json({ url });
  } catch (error) {
    console.error("Upload handler caught error:", error);
    res.status(500).json({ 
      message: "Upload failed", 
      error: error instanceof Error ? error.message : "Unknown error",
      details: error
    });
  }
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Post Routes
app.use("/api/posts", postRoutes);

// User Routes
app.use("/api/users", userRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Community Routes
app.use("/api/communities", communityRoutes);

// Thread Routes
app.use("/api/threads", threadRoutes);

// Blog Routes
app.use("/api/blogs", blogRoutes);

// Message Routes
app.use("/api/messages", messageRoutes);

// AI Routes
app.use("/api/ai", aiRoutes);

// Guidance Routes
app.use("/api/guidance", guidanceRoutes);
app.use("/api/courses", courseRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Context:", {
    method: req.method,
    url: req.url,
    body: req.body,
    error: err
  });
  res.status(500).json({ 
    message: "Internal Server Error", 
    error: err.message || String(err)
  });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (room: string) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on("join_guidance_session", (sessionId: string) => {
    socket.join(`guidance_${sessionId}`);
    console.log(`User ${socket.id} joined guidance session: ${sessionId}`);
  });

  socket.on("user_online", async (userId: number) => {
    if (typeof userId !== "number" || Number.isNaN(userId)) return;
    registerUserSocket(userId, socket.id);
    await emitOnlineUsers();
  });

  socket.on("send_message", async (data: any) => {
    // data: { room, message, sender, senderId, senderName }
    try {
      const saved = await prisma.message.create({
        data: {
          room: data.room,
          senderId: data.senderId || 0,
          senderName: data.sender || data.senderName || "",
          content: data.message,
        },
      });
      // emit the saved message (includes id and createdAt)
      io.to(data.room).emit("receive_message", saved);
      return;
    } catch (err) {
      console.error("Failed to save chat message:", err);
    }
  });

  socket.on("send_guidance_message", async (data: any) => {
    // data: { sessionId, senderId, content, type, metadata }
    try {
      const { sessionId, senderId, content, type, metadata } = data;
      // You should ideally check if it's strictly authorized but we'll trust the provided ids
      const saved = await prisma.guidanceMessage.create({
        data: {
          sessionId,
          senderId: parseInt(senderId),
          content: content || "",
          type: type || "TEXT",
          metadata: metadata || null,
        }
      });
      
      io.to(`guidance_${sessionId}`).emit("receive_guidance_message", saved);
    } catch (err) {
      console.error("Failed to save guidance message:", err);
    }
  });

  socket.on("typing", (data: { room: string; userId: number }) => {
    socket.to(data.room).emit("user_typing", { userId: data.userId });
  });

  socket.on("stop_typing", (data: { room: string; userId: number }) => {
    socket.to(data.room).emit("user_stop_typing", { userId: data.userId });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    const deregisteredUserId = unregisterUserSocket(socket.id);
    if (deregisteredUserId !== undefined) {
      await emitOnlineUsers();
    }
  });
});

httpServer.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});

export default httpServer;