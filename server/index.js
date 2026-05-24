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
import mongoose from 'mongoose';

// 🛠️ Config & Models & Routes
import connectAllDB from "./config/db.js"; 
import Message from "./models/Message.js"; 
import Group from "./models/Group.js"; 
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/user.js'; 
import profileRoutes from './routes/profile.js'; 
import postRoutes from "./routes/posts.js";
import reelRoutes from "./routes/reels.js";      
import storyRoute from "./routes/story.js";    
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
app.use('/api/ai', protect, aiRoutes); 
app.get("/api/feed", protect, getNeuralFeed);
app.use("/api/posts", protect, postRoutes); 
app.use("/api/story", protect, storyRoute); // মূল স্টোরি রাউট

// 👥 Clean Group Routing Layout
app.use("/api/groups", protect, groupRoutes);
app.use("/api/group", protect, groupRoutes);

// 💬 Direct Messenger Routine
app.use("/api/messages", protect, messageRoutes);

app.use("/api/market", protect, marketRoutes);
app.use("/api/admin", protect, adminRoutes);
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

    // --- 📥 1-ON-1 DIRECT MESSAGES ---
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

    /* ==========================================================
        ⚙️ CLUSTER GROUP CHAT PIPELINE
        ========================================================== */
    
    socket.on('join_group_room', ({ groupId, userId }) => {
      if (!groupId) return;
      socket.join(`group_${groupId}`);
      console.log(`📡 Matrix Room Synced: group_${groupId} for User: ${userId}`);
    });

    socket.on('send_group_message', async (payload) => {
      try {
        const { groupId, text, mediaUrl, sender, tempId } = payload;
        if (!groupId || !sender?._id) return;

        let processedMediaUrl = null;
        if (mediaUrl && mediaUrl.startsWith('data:')) {
          try {
            const matches = mediaUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const ext = matches[1].split('/')[1];
              const buffer = Buffer.from(matches[2], 'base64');
              const filename = `onyx_chat_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
              const fullFilePath = path.join(uploadDir, filename);
              fs.writeFileSync(fullFilePath, buffer);
              const envUrl = process.env.VITE_API_URL || 'http://localhost:5005';
              const cleanEnvUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
              processedMediaUrl = `${cleanEnvUrl}/uploads/${filename}`;
            }
          } catch (uploadError) {
            console.error("❌ Media stream write execution error:", uploadError);
          }
        } else if (mediaUrl) {
          processedMediaUrl = mediaUrl;
        }

        const newMessage = await Message.create({
          groupId: new mongoose.Types.ObjectId(groupId),
          sender: new mongoose.Types.ObjectId(sender._id),
          text: text || '',
          mediaUrl: processedMediaUrl
        });

        const populatedMsg = await Message.findById(newMessage._id).populate(
          'sender',
          'fullName username profilePic'
        );

        if (!populatedMsg) {
          throw new Error("Failed to populate saved cluster message.");
        }

        const broadcastPayload = {
          _id: populatedMsg._id,
          tempId: tempId || null,
          groupId: populatedMsg.groupId,
          text: populatedMsg.text,
          mediaUrl: populatedMsg.mediaUrl,
          sender: {
            _id: populatedMsg.sender._id,
            fullName: populatedMsg.sender.fullName || "Drifter Node",
            username: populatedMsg.sender.username,
            profilePic: populatedMsg.sender.profilePic
          },
          timestamp: new Date(populatedMsg.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          createdAt: populatedMsg.createdAt,
          reactions: []
        };

        io.to(`group_${groupId}`).emit('receive_group_message', broadcastPayload);

        try {
          const groupDetails = await Group.findById(groupId);
          if (groupDetails && groupDetails.members) {
            groupDetails.members.forEach((memberObj) => {
              const targetUserId = memberObj.userId ? memberObj.userId.toString() : memberObj.toString();
              if (targetUserId !== sender._id.toString()) {
                const liveSession = onlineUsers.find(u => u.userId === targetUserId);
                if (liveSession) {
                  io.to(liveSession.socketId).emit("getNotification", {
                    senderId: sender._id,
                    senderName: `${sender.fullName || 'Someone'} (${groupDetails.name || 'Group'})`,
                    text: text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : "Sent a matrix file Node.",
                    isRead: false,
                    date: new Date(),
                  });
                }
              }
            });
          }
        } catch (notifErr) {
          console.error("⚠️ Background cluster notification pipeline error:", notifErr);
        }
      } catch (error) {
        console.error("❌ Matrix Server Room Save Failure:", error);
      }
    });

    socket.on('group_typing_signal', ({ groupId, username, isTyping }) => {
      if (!groupId) return;
      socket.to(`group_${groupId}`).emit('group_typing_broadcast', { username, isTyping });
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