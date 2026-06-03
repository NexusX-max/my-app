import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis"; 
import { createAdapter } from "@socket.io/redis-adapter"; 
import cors from "cors";
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- ⚙️ Modules & Routes Import ---
import connectAllDB from "./config/db.js"; 
import Message from "./models/Message.js"; 
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.js'; 
import profileRoutes from './routes/profile.js'; 
import postRoutes from "./routes/posts.js";
import reelRoutes from "./routes/reels.js"; 
import groupRoutes from "./routes/group.js"; 
import marketRoutes from "./routes/market.js"; 
import adminRoutes from "./routes/admin.js"; 
import messagesRoutes from "./routes/messages.js"; 
import aiRoutes from './routes/aiRoutes.js'; 
import { getNeuralFeed } from "./controllers/feedController.js";
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  "https://onyx-drift.com", 
  "https://www.onyx-drift.com",
  "https://api.onyx-drift.com",
  "https://onyx-messenger.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes("localhost") || origin.includes("run.app") || origin.includes("ais-")) {
      callback(null, true);
    } else {
      callback(new Error('Neural Network Access Denied'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// --- 🔐 Neural Link Protection (Refined & Fully Adaptive) ---
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      const token = authHeader.split(" ")[1];
      
      // Sandbox fallback token support
      if (token === "sandbox_token_signature" || token === "onyx_token" || token === "null" || !token) {
        req.user = { id: "me", _id: "me", username: "me_operator" };
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "onyx_drift_super_secret_key_2026");
      const decodedId = decoded.id || decoded.userId || decoded.sub || decoded._id || "me";
      
      req.user = { 
        id: decodedId, 
        _id: decodedId,
        username: decoded.username || "operator",
        ...decoded
      };
      next();
    } catch (err) {
      if (!process.env.MONGO_URI) {
        req.user = { id: "me", _id: "me", username: "me_operator" };
        return next();
      }
      return res.status(401).json({ error: "Session expired." });
    }
  } else {
    if (!process.env.MONGO_URI) {
      req.user = { id: "me", _id: "me", username: "me_operator" };
      return next();
    }
    return res.status(401).json({ error: "Token missing." });
  }
};

/* 🚀 API ROUTES REGISTRATION */
app.use('/api/auth', authRoutes); 
app.use("/api/profile", protect, profileRoutes); 
app.use("/api/users", protect, userRoutes); 
app.use('/api/notifications', protect, notificationRoutes);
app.use("/api/reels", protect, reelRoutes);
app.use('/api/ai', protect, aiRoutes); 
app.get("/api/feed", protect, getNeuralFeed);
app.use("/api/posts", protect, postRoutes); 
app.use("/api/groups", protect, groupRoutes);
app.use("/api/messages", protect, messagesRoutes); // আপনার ফিক্সড messages.js রাউট
app.use("/api/market", protect, marketRoutes);
app.use("/api/admin", protect, adminRoutes);
app.use('/api/v1/search', protect, searchRoutes); 

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    uptime: process.uptime(),
    node: "ONYX-CORE-MAIN"
  });
});

/* ⚡ SOCKET.IO (Neural Sync Engine) */
const io = new Server(server, { 
  cors: { 
    origin: allowedOrigins, 
    credentials: true 
  }, 
  pingTimeout: 60000 
});

app.set("io", io);

const setupSocket = async () => {
  try {
    const pubClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("💎 Neural Sync: Redis Adapter Linked");
  } catch (err) {
    console.warn("⚠️ Redis Failed, using Local Memory Adapter");
  }

  const activeUsers = new Map();
  app.set("activeUsers", activeUsers);

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId || socket.handshake.query.uid;
    if (userId) {
      activeUsers.set(userId, socket.id);
      socket.join(userId);
    }

    socket.on("join_room", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("addNewUser", (uid) => {
      if (uid) activeUsers.set(uid, socket.id);
    });

    socket.on('send_group_message', async (payload) => {
      try {
        const { groupId, text, mediaUrl, sender } = payload;
        const msg = await Message.create({ 
          conversationId: `group_${groupId}`, 
          senderId: sender._id, 
          text, 
          image: mediaUrl 
        });
        io.to(`group_${groupId}`).emit('receive_group_message', msg);
      } catch (err) {
        console.warn("⚠️ Group message storage failed:", err.message);
      }
    });
  });
};

const startApp = async () => {
  try {
    if (connectAllDB) {
      await connectAllDB();
    }
    await setupSocket();
    const PORT = process.env.PORT || 5005;
    server.listen(PORT, '0.0.0.0', () => console.log(`🚀 ONYX CORE ACTIVE: ${PORT}`));
  } catch (error) {
    console.error("❌ FAILURE DURING BOOTUP:", error.message);
  }
};

startApp();