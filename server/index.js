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
import axios from 'axios';

// 🛠️ Config & Routes
import connectAllDB from "./config/db.js"; 
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.js'; 
import profileRoutes from './routes/profile.js'; 
import postRoutes from "./routes/posts.js";
import reelRoutes from "./routes/reels.js";      
import storyRoute from "./routes/stories.js";    
import groupRoutes from "./routes/group.js";      
import marketRoutes from "./routes/market.js";    
import adminRoutes from "./routes/admin.js";      
import messageRoutes from "./routes/messages.js";
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
  "http://127.0.0.1:5173",
  "https://onyx-drift.com", 
  "https://www.onyx-drift.com",
  "https://api.onyx-drift.com",
  "https://onyx-messenger.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Neural Network Access Denied: Unauthorized Origin'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// --- 🔐 Neural Link Protection (Middleware) ---
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "onyx_drift_super_secret_key_2026";
      const decoded = jwt.verify(token, secret);
      const userId = decoded.id || decoded._id || decoded.userId || decoded.sub;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized", msg: "Invalid token payload." });
      }

      req.user = { id: userId, _id: userId }; 
      next();
    } catch (error) {
      return res.status(401).json({ error: "Neural Link Severed", msg: "Session expired." });
    }
  } else {
    return res.status(401).json({ error: "Access Denied", msg: "Token missing." });
  }
};

/* ==========================================================
    🚀 API ROUTES
========================================================== */
app.get("/", (req, res) => res.json({ status: "Active", system: "OnyxDrift Core", version: "3.0.0" }));

app.use('/api/auth', authRoutes); 
app.use("/api/profile", protect, profileRoutes); 
app.use("/api/users", protect, userRoutes); 
app.use('/api/notifications', protect, notificationRoutes);
app.use("/api/reels", protect, reelRoutes);

// AI Routes (Onyx Brain, Voice, Smart Replies)
app.use('/api/ai', protect, aiRoutes); 

app.get("/api/feed", protect, getNeuralFeed);
app.use("/api/posts", protect, postRoutes); 
app.use("/api/stories", protect, storyRoute);
app.use("/api/groups", protect, groupRoutes);
app.use("/api/market", protect, marketRoutes);
app.use("/api/admin", protect, adminRoutes);
app.use("/api/messages", protect, messageRoutes);
app.use('/api/v1/search', protect, searchRoutes); 
app.use('/api/user', protect, searchRoutes);      
app.use('/api/user/profile', protect, profileRoutes); 

/* ==========================================================
    ⚡ SOCKET.IO (Neural Sync Engine)
========================================================== */
const io = new Server(server, { 
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
  pingTimeout: 60000,
});

const pubClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
const subClient = pubClient.duplicate();

let onlineUsers = [];

const setupSocket = async () => {
  try {
    await pubClient.connect();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));
    console.log("💎 Neural Sync: Redis Adapter Linked");
  } catch (err) {
    console.error("⚠️ Redis Connection Failed, falling back to Memory Adapter");
  }

  io.on("connection", (socket) => {
    const userIdFromQuery = socket.handshake.query.userId;
    if (userIdFromQuery && userIdFromQuery !== 'undefined') {
      addUser(userIdFromQuery, socket.id);
    }

    function addUser(userId, socketId) {
      const index = onlineUsers.findIndex(u => u.userId === userId);
      if (index !== -1) {
        onlineUsers[index].socketId = socketId;
      } else {
        onlineUsers.push({ userId, socketId });
      }
      io.emit("getOnlineUsers", onlineUsers);
      console.log(`📡 Neural Link: User ${userId} mapped to ${socketId}`);
    }

    socket.on("addNewUser", (userId) => {
      if (userId) addUser(userId, socket.id);
    });

    socket.on("sendMessage", (message) => {
      const receiver = onlineUsers.find(u => u.userId === message.receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit("getMessage", { ...message, status: 'delivered' });
        io.to(receiver.socketId).emit("getNotification", {
          senderId: message.senderId,
          senderName: message.senderName || "New User",
          isRead: false,
          date: new Date(),
        });
      }
    });

    // --- WebRTC Calls ---
    socket.on("callUser", (data) => {
      const receiver = onlineUsers.find(u => u.userId === data.userToCall);
      if (receiver) {
        io.to(receiver.socketId).emit("incomingCall", {
          signal: data.signalData, 
          from: data.from,           
          name: data.name,           
          type: data.type,
          roomId: data.roomId
        });
      } else {
        socket.emit("callError", { message: "User is currently offline." });
      }
    });

    socket.on("answerCall", (data) => {
      const caller = onlineUsers.find(u => u.userId === data.to);
      if (caller) {
        io.to(caller.socketId).emit("callAccepted", data.signal);
      }
    });

    socket.on("endCall", ({ to }) => {
      const receiver = onlineUsers.find(u => u.userId === to);
      if (receiver) {
        io.to(receiver.socketId).emit("callEnded");
      }
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);
      console.log("🛑 Neural link severed for a user.");
    });
  });
};

const startApp = async () => {
  try {
    await connectAllDB(); 
    await setupSocket(); 
    const PORT = process.env.PORT || 5005; 
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 ONYX CORE ACTIVE: PORT ${PORT}`);
    });
  } catch (error) {
    console.error("❌ FAILURE:", error.message);
    setTimeout(startApp, 3000); 
  }
};

startApp();