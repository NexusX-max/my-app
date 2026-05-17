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

// Cloudflare-এর মাধ্যমে প্রক্সি ট্রাস্ট করার জন্য
app.set('trust proxy', 1);

// --- 🌐 CORS Configuration (Cloudflare ডোমেইন সহ) ---
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  "https://onyx-drift.com", // আপনার মেইন ডোমেইন
  "https://www.onyx-drift.com",
  "https://onyx-messenger.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Onyx Security: Origin Unauthorized'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));

app.use(express.json({ limit: "150mb" }));
app.use(express.urlencoded({ limit: "150mb", extended: true }));

// Uploads static directory
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
app.get("/", (req, res) => res.json({ 
    status: "Active", 
    system: "OnyxDrift Core", 
    node: process.env.NODE_ID || "Main", 
    version: "3.1.0" 
}));

app.use('/api/auth', authRoutes); 
app.use("/api/profile", protect, profileRoutes); 
app.use("/api/users", protect, userRoutes); 
app.use('/api/notifications', protect, notificationRoutes);
app.use("/api/reels", protect, reelRoutes);
app.use('/api/ai', protect, aiRoutes); 
app.get("/api/feed", protect, getNeuralFeed);
app.use("/api/posts", protect, postRoutes); 
app.use("/api/stories", protect, storyRoute);
app.use("/api/groups", protect, groupRoutes);
app.use("/api/market", protect, marketRoutes);
app.use("/api/admin", protect, adminRoutes);
app.use("/api/messages", protect, messageRoutes);
app.use('/api/v1/search', protect, searchRoutes); 

/* ==========================================================
    ⚡ SOCKET.IO (Redis Sync Engine)
========================================================== */
const io = new Server(server, { 
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
  pingTimeout: 60000,
});

// --- Redis Cloud Connection ---
const pubClient = createClient({ 
    url: process.env.REDIS_URL, 
    socket: {
        reconnectStrategy: retries => Math.min(retries * 50, 2000)
    }
});
const subClient = pubClient.duplicate();

let onlineUsers = [];

const setupSocket = async () => {
  try {
    await pubClient.connect();
    await subClient.connect();
    
    io.adapter(createAdapter(pubClient, subClient));
    console.log("💎 Neural Sync: Global Redis Adapter Linked");
  } catch (err) {
    console.error("⚠️ Redis Connection Failed:", err);
  }

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== 'undefined') {
        addUser(userId, socket.id);
    }

    function addUser(userId, socketId) {
      const index = onlineUsers.findIndex(u => u.userId === userId);
      if (index !== -1) {
        onlineUsers[index].socketId = socketId;
      } else {
        onlineUsers.push({ userId, socketId });
      }
      io.emit("getOnlineUsers", onlineUsers);
    }

    // 📩 MESSAGE HANDLER (চ্যাট মেসেজ)
    socket.on("sendMessage", (message) => {
      io.emit("getMessage", { ...message });
    });

    /* ==========================================================
        📞 ONYX REAL-TIME CALL SIGNALING ENGINE (Added)
    ========================================================== */
    
    // ১. ইনকামিং কল ট্রিগার এবং রাউটিং মেকানিজম
    socket.on("callUser", (data) => {
      // onlineUsers অ্যারে থেকে রিসিভারের একটিভ সকেট আইডি খুঁজে বের করা
      const targetUser = onlineUsers.find(user => user.userId === data.userToCall);
      
      if (targetUser && targetUser.socketId) {
        // চ্যাটের মতোই হুবহু টার্গেট সকেটে ইনকামিং সিগন্যাল রিফ্লেক্ট করে দেওয়া হলো
        io.to(targetUser.socketId).emit("$incomingCall", {
          from: data.from,
          name: data.name,
          avatar: data.avatar,
          type: data.type,
          roomId: data.roomId,
          signalData: data.signalData
        });
        console.log(`✅ Onyx Network: Call Signal forwarded from ${data.from} to socket ${targetUser.socketId}`);
      } else {
        console.log(`⚠️ Onyx Network: Target Node ${data.userToCall} is currently offline.`);
      }
    });

    // ২. কল অ্যাকসেপ্ট বা হ্যান্ডশেক রেসপন্স পাঠানো
    socket.on("answerCall", (data) => {
      const callerUser = onlineUsers.find(user => user.userId === data.to);
      if (callerUser && callerUser.socketId) {
        io.to(callerUser.socketId).emit("callAccepted", {
          signal: data.signal,
          roomId: data.roomId
        });
        console.log(`✅ Handshake Complete: Call accepted for roomId ${data.roomId}`);
      }
    });

    // ৩. কল রিজেক্ট বা এন্ড করার ইভেন্ট ট্রান্সমিশন
    socket.on("endCall", (data) => {
      const opponentUser = onlineUsers.find(user => user.userId === data.to);
      if (opponentUser && opponentUser.socketId) {
        io.to(opponentUser.socketId).emit("callEnded");
        console.log(`🛑 Call terminated between peers.`);
      }
    });

    // 🛑 DISCONNECT HANDLER
    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);
      console.log("🛑 Neural link severed.");
    });
  });
};

/* ==========================================================
    🏁 START SERVER
========================================================== */
const startApp = async () => {
  try {
    await connectAllDB(); // MongoDB কানেক্ট
    await setupSocket(); // Socket + Redis কানেক্ট
    
    const PORT = process.env.PORT || 5005; 
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 ONYX CORE ACTIVE: PORT ${PORT}`);
    });
  } catch (error) {
    console.error("❌ FAILURE:", error.message);
    setTimeout(startApp, 5000); 
  }
};

startApp();