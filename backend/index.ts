import "./config/init-env";
import express from "express";
import cors from "cors";
import morgan from "morgan";
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
import aiRoutes from "./routes/ai.routes";
import multer from "multer";
import path from "path";
import fs from "fs";
import { registerUserSocket, unregisterUserSocket, getOnlineUserIds } from "./services/presence.service";

const app = express();
const httpServer = createServer(app);

// Shared CORS configuration — apply before any route or middleware so
// preflight OPTIONS requests are handled correctly for REST and Socket.IO.
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://spiritualconnect-frontend.onrender.com",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS early so preflight requests are answered correctly
app.use(cors(corsOptions));

// Logging
app.use(morgan("dev"));

// File Upload Setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const io = new Server(httpServer, {
  // Reuse the same CORS config so Socket.IO and REST behave identically.
  cors: corsOptions,
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

// File Upload Endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: `/uploads/${req.file.filename}` });
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

// Blog Routes
app.use("/api/blogs", blogRoutes);

// Message Routes
app.use("/api/messages", messageRoutes);

// AI Routes
app.use("/api/ai", aiRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (room: string) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
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