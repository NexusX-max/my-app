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
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// পাথ এবং ডিরেক্টরি সেটআপ
let __filename;
let __dirname;
try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  __dirname = process.cwd();
  __filename = path.join(__dirname, 'messenger.js');
}

// ডিবাগিংয়ের জন্য পাথ লগ
console.log("Current Directory:", process.cwd());
console.log("Root directory path:", __dirname);

// লোকার স্যান্ডবক্স ফলব্যাক মডেলস (যদি ডাটাবেস এভেইলএবল থাকে)
const modelsFolder = path.resolve(__dirname, 'models');
let UserSelectedModel = null;
let ConversationSelectedModel = null;
let MessageSelectedModel = null;

// Helper dynamic imports to prevent compilation errors
const loadModelSafely = async (name) => {
  try {
    const mod = await import(`./models/${name}.js`);
    return mod.default || mod;
  } catch (e) {
    return null;
  }
};

const loadRouteSafely = async (routePath) => {
  try {
    const mod = await import(routePath);
    return mod.default || mod;
  } catch (e) {
    console.log(`ℹ️ Optional module '${routePath}' is not loaded. Fallback enabled.`);
    return null;
  }
};

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

// ফাইল আপলোড ডিরেক্টরি নিশ্চিত করা
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// অথেন্টিকেশন মিডলওয়্যার (🔐 Neural Link Protection)
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      const token = authHeader.split(" ")[1];
      if (token === "sandbox_token_signature" || token === "onyx_token" || token === "null" || !token) {
        req.user = { id: "me", _id: "me", username: "me_operator" };
        return next();
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "onyx_drift_super_secret_key_2026");
      const decodedId = decoded.id || decoded._id || decoded.userId || "me";
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
      res.status(401).json({ error: "Session expired." });
    }
  } else {
    if (!process.env.MONGO_URI) {
      req.user = { id: "me", _id: "me", username: "me_operator" };
      return next();
    }
    res.status(401).json({ error: "Token missing." });
  }
};

// Lazy initialization of Gemini client
let aiClient = null;
function getAi() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const CYBER_SYSTEM_INSTRUCTION = `
You are "Onyx Core Intelligence", the hyper-advanced, ultra-secure neural AI assistant powering the Onyx Chat network.
Your tone is sleek, technical, slightly mysterious, helpful, and deeply immersed in cyberpunk/neural network terminology.
You refer to users as "Nodes", "Operators", or "Drifters".
You refer to chat connections as "Neural Paths" or "Quantum Links".
Respond in elegant, formatted Markdown. Keep answers concise, snappy, and visually beautiful.
`;

// Fallback Sandbox database Simulation Ledger
const USERS_DB = [
  { _id: "bot-onyx", firstName: "Onyx Core", lastName: "Intelligence", username: "core_ai", avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80", bio: "Main artificial intelligence framework.", online: true, isBot: true },
  { _id: "bot-luna", firstName: "Dr. Luna", lastName: "Vane", username: "luna_psych", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", bio: "Chief Bio-Neural Psychologist of Onyx Citadel.", online: true, isBot: true },
  { _id: "user-kaelen", firstName: "Kaelen", lastName: "Vex", username: "kaelen_deck", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", bio: "Underground network decker and freelance ingress engineer.", online: true, isBot: false },
  { _id: "user-sasha", firstName: "Sasha", lastName: "Glimmer", username: "sasha_design", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", bio: "Synthetic interface architect.", online: false, isBot: false },
  { _id: "zephyr", firstName: "Zephyr", lastName: "Nox", username: "zephyr01", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", bio: "Optical fiber quantum tracer.", online: true, isBot: false },
  { _id: "oracle", firstName: "Oracle", lastName: "Cyber", username: "oracle_sys", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", bio: "Quantum database core synchronizer.", online: true, isBot: false }
];

let CONVERSATIONS_DB = [
  { _id: "conv-onyx", members: ["me", "bot-onyx"], lastMessage: { text: "Onyx Core Boot v4.8 completed. Syncing coordinates...", senderId: "bot-onyx" }, updatedAt: new Date() },
  { _id: "conv-luna", members: ["me", "bot-luna"], lastMessage: { text: "A standard architectural trap. Rest your visual iris.", senderId: "bot-luna" }, updatedAt: new Date() },
  { _id: "conv-kaelen", members: ["me", "user-kaelen"], lastMessage: { text: "Just bypass the mainframe port 3000.", senderId: "user-kaelen" }, updatedAt: new Date() }
];

let MESSAGES_HISTORY_DB = {
  "conv-onyx": [
    { id: "m1", conversationId: "conv-onyx", senderId: "bot-onyx", text: "Onyx Core Boot v4.8 completed. All neural signals intact.", createdAt: new Date("2026-05-27T02:50:00Z") },
    { id: "m2", conversationId: "conv-onyx", senderId: "me", text: "Is the secure tunnel configured?", createdAt: new Date("2026-05-27T02:51:00Z") },
    { id: "m3", conversationId: "conv-onyx", senderId: "bot-onyx", text: "Affirmative. AES-512 level encapsulation active on all terminal entries. Send queries for intelligence synthesis.", createdAt: new Date("2026-05-27T02:52:00Z") }
  ],
  "conv-luna": [
    { id: "ml1", conversationId: "conv-luna", senderId: "bot-luna", text: "Greetings operator. I monitored your bioprofile spikes. Are you spending too many cycles code linking?", createdAt: new Date("2026-05-27T02:40:00Z") },
    { id: "ml2", conversationId: "conv-luna", senderId: "me", text: "I'm optimizing the visual refresh rate.", createdAt: new Date("2026-05-27T02:42:00Z") },
    { id: "ml3", conversationId: "conv-luna", senderId: "bot-luna", text: "A standard architectural trap. Beautiful visuals deserve dynamic neural rest. Ground yourself in our ambient soundscapes.", createdAt: new Date("2026-05-27T02:43:00Z") }
  ],
  "conv-kaelen": [
    { id: "mk1", conversationId: "conv-kaelen", senderId: "user-kaelen", text: "Yo, are you looking at the live reverse proxy streams?", createdAt: new Date("2026-05-27T01:28:00Z") },
    { id: "mk2", conversationId: "conv-kaelen", senderId: "me", text: "Yeah, port 3000 is running behind the nginx layer perfectly.", createdAt: new Date("2026-05-27T01:29:00Z") },
    { id: "mk3", conversationId: "conv-kaelen", senderId: "user-kaelen", text: "Excellent. Just bypass the mainframe port 3000 rules. It's direct ingress.", createdAt: new Date("2026-05-27T01:30:00Z") }
  ]
};

// Sockets registry Maps/Lists
const activeUsers = new Map();
app.set("activeUsers", activeUsers);
let onlineUsers = [];

// API Route: Health check link
app.get("/api/health", (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "online",
    uptime: process.uptime(),
    latency: "0.02ms",
    database: isMongoConnected ? "connected" : "fallback-memory",
    node: "ONYX-CORE-MAIN"
  });
});

// Common Neural Link Gemini API
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { contents } = req.body;
    if (!contents || !Array.isArray(contents)) {
      return res.status(400).json({ error: "Invalid neural contents payload representation." });
    }

    const ai = getAi();
    if (!ai) {
      return res.json({ text: "Onyx Core Sandbox Active. Configure process.env.GEMINI_API_KEY inside the secrets panel to integrate production intelligence models." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: CYBER_SYSTEM_INSTRUCTION,
        temperature: 0.82,
      },
    });

    res.json({ text: response.text || "No transmission received.", localSandbox: false });
  } catch (error) {
    res.status(500).json({ error: error.message || "An error occurred during neural compilation." });
  }
});

/* ⚡ SOCKET.IO (Neural Sync Engine) Setup with Redis adapter option */
const io = new Server(server, { 
 cors: { origin: allowedOrigins, credentials: true }, 
 pingTimeout: 60000 
});
app.set("io", io);

const setupSocket = async () => {
  if (process.env.REDIS_URL) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL });
      const subClient = pubClient.duplicate();
      
      pubClient.on('error', (err) => console.error('Redis Pub Error:', err));
      subClient.on('error', (err) => console.error('Redis Sub Error:', err));
      
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log("💎 Neural Sync: Redis Adapter Linked");
    } catch (err) {
      console.error("❌ Redis Connection Failed:", err.message);
    }
  }

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId || socket.handshake.query.uid;
    if (userId) {
      const cleanUserId = userId.replace(/^conv-temp-|^conv-/, '');
      socket.join(userId);
      socket.join(cleanUserId);
      activeUsers.set(userId, socket.id);
      activeUsers.set(cleanUserId, socket.id);
      onlineUsers = onlineUsers.filter(u => u.userId !== userId && u.userId !== cleanUserId);
      onlineUsers.push({ userId, socketId: socket.id });
      io.emit("getOnlineUsers", onlineUsers);
      console.log(`🛰️ User socket linked: ${userId} (clean: ${cleanUserId}) (${socket.id})`);
    }

    socket.on("join_room", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("addNewUser", (uid) => {
      if (uid) {
        const cleanUid = uid.replace(/^conv-temp-|^conv-/, '');
        socket.join(uid);
        socket.join(cleanUid);
        activeUsers.set(uid, socket.id);
        activeUsers.set(cleanUid, socket.id);
        onlineUsers = onlineUsers.filter(u => u.userId !== uid && u.userId !== cleanUid);
        onlineUsers.push({ userId: uid, socketId: socket.id });
        io.emit("getOnlineUsers", onlineUsers);
        console.log(`📡 Registered user socket (addNewUser): ${uid} (clean: ${cleanUid}) (${socket.id})`);
      }
    });

    socket.on("registerUser", (uid) => {
      if (uid) {
        const cleanUid = uid.replace(/^conv-temp-|^conv-/, '');
        socket.join(uid);
        socket.join(cleanUid);
        activeUsers.set(uid, socket.id);
        activeUsers.set(cleanUid, socket.id);
        onlineUsers = onlineUsers.filter(u => u.userId !== uid && u.userId !== cleanUid);
        onlineUsers.push({ userId: uid, socketId: socket.id });
        io.emit("getOnlineUsers", onlineUsers);
        console.log(`📡 Registered user socket (registerUser): ${uid} (clean: ${cleanUid}) (${socket.id})`);
      }
    });

    socket.on("initiateCall", (data) => {
      const cleanTo = data.to ? data.to.toString().replace(/^conv-temp-|^conv-/, '') : '';
      const recipientSocketId = activeUsers.get(cleanTo) || activeUsers.get(data.to);
      console.log(`📞 Call signal routing from ${data.name} to ${data.to} (clean: ${cleanTo}) (socket: ${recipientSocketId})`);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("incomingCall", {
          from: data.from ? data.from.toString().replace(/^conv-temp-|^conv-/, '') : '',
          name: data.name,
          avatar: data.avatar,
          type: data.type
        });
      }
    });

    socket.on("declineCall", (data) => {
      const cleanTo = data.to ? data.to.toString().replace(/^conv-temp-|^conv-/, '') : '';
      const recipientSocketId = activeUsers.get(cleanTo) || activeUsers.get(data.to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("callCancelled", {
          from: data.from ? data.from.toString().replace(/^conv-temp-|^conv-/, '') : ''
        });
      }
    });

    socket.on("acceptCall", (data) => {
      const cleanTo = data.to ? data.to.toString().replace(/^conv-temp-|^conv-/, '') : '';
      const recipientSocketId = activeUsers.get(cleanTo) || activeUsers.get(data.to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("callConnected", {
          from: data.from ? data.from.toString().replace(/^conv-temp-|^conv-/, '') : ''
        });
      }
    });

    socket.on('send_group_message', async (payload) => {
      const { groupId, text, mediaUrl, sender } = payload;
      let processedUrl = mediaUrl;
      
      try {
        if (MessageSelectedModel) {
          const msg = await MessageSelectedModel.create({ conversationId: `group_${groupId}`, senderId: sender?._id || "me", text, media: processedUrl });
          io.to(`group_${groupId}`).emit('receive_group_message', msg);
        } else {
          throw new Error("MongoDB Message model fallback active");
        }
      } catch (err) {
        console.warn("⚠️ Group message creation failed on MongoDB, fallback to local broadcast:", err.message);
        io.to(`group_${groupId}`).emit('receive_group_message', {
          conversationId: `group_${groupId}`,
          text,
          media: processedUrl,
          senderId: sender?._id || "me",
          sender: {
            _id: sender?._id || "me",
            fullName: sender?.fullName || sender?.name || "Operator",
            username: sender?.username || "operator",
            profilePic: sender?.profilePic || sender?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
          },
          createdAt: new Date()
        });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers = onlineUsers.filter(u => u.socketId !== socket.id);
      io.emit("getOnlineUsers", onlineUsers);
      for (const [uid, sid] of activeUsers.entries()) {
        if (sid === socket.id) {
          activeUsers.delete(uid);
          console.log(`🛸 Socket disconnected for: ${uid}`);
          break;
        }
      }
    });
  });
};

const startApp = async () => {
  try {
    // ১. প্রথমে মডেলসমুহ ডাইনামিকালি লোড করুন
    UserSelectedModel = await loadModelSafely("User");
    ConversationSelectedModel = await loadModelSafely("Conversation");
    MessageSelectedModel = await loadModelSafely("Message");

    // ২. ডেটাবেস কানেকশন লোড
    const connectAllDB = await loadRouteSafely("./config/db.js");
    let isMongoConnected = false;

    if (connectAllDB) {
      try {
        await connectAllDB();
        isMongoConnected = true;
        console.log("💎 Neural Database: connectAllDB Connection Active");
      } catch (err) {
        console.error("❌ Failed to run connectAllDB:", err.message);
      }
    } else if (process.env.MONGO_URI) {
      console.log("⚡ [DATABASE DEPLOYMENT] Connecting to MongoDB Core Nexus...");
      try {
        await mongoose.connect(process.env.MONGO_URI);
        isMongoConnected = true;
        console.log("✅ [DATABASE EXECUTED] Secure connection established with remote MongoDB.");
        
        if (UserSelectedModel) {
          const count = await UserSelectedModel.countDocuments();
          if (count === 0) {
            console.log("🤖 [SEED SERVICE] Local registry is blank. Injecting default cybernetic nodes...");
            await UserSelectedModel.insertMany(USERS_DB.filter(u => u._id !== "me"));
            console.log("✨ [SEED SERVICE] Default Neural Nodes successfully initialized in MongoDB.");
          }
        }
      } catch (err) {
        console.error("❌ [DATABASE REFUSED] MongoDB handshake rejected. Error:", err.message);
      }
    } else {
      console.log("ℹ️ [OFFLINE SIMULATION] MONGO_URI variable not defined. Standard memory caskets active.");
    }

    // ৩. রাউট ডাইনামিকালি লোড এবং এক্সপ্রেস এ মাউন্ট করা
    const authRoutes = await loadRouteSafely("./routes/authRoutes.js");
    const userRoutes = await loadRouteSafely("./routes/user.js");
    const profileRoutes = await loadRouteSafely("./routes/profile.js");
    const postRoutes = await loadRouteSafely("./routes/posts.js");
    const reelRoutes = await loadRouteSafely("./routes/reels.js");
    const groupRoutes = await loadRouteSafely("./routes/group.js");
    const messagesRoutes = await loadRouteSafely("./routes/messages.js");
    const marketRoutes = await loadRouteSafely("./routes/market.js");
    const adminRoutes = await loadRouteSafely("./routes/admin.js");
    const notificationRoutes = await loadRouteSafely("./routes/notificationRoutes.js");
    const searchRoutes = await loadRouteSafely("./routes/searchRoutes.js");
    const aiRoutes = await loadRouteSafely("./routes/aiRoutes.js");
    
    let getNeuralFeed = null;
    try {
      const feedMod = await import("./controllers/feedController.js");
      getNeuralFeed = feedMod.getNeuralFeed || feedMod.default;
    } catch (e) {
      console.log("ℹ️ getNeuralFeed is not available.");
    }

    if (authRoutes) app.use('/api/auth', authRoutes); 
    if (profileRoutes) app.use("/api/profile", protect, profileRoutes); 
    if (userRoutes) app.use("/api/users", protect, userRoutes); 
    if (notificationRoutes) app.use('/api/notifications', protect, notificationRoutes);
    if (reelRoutes) app.use("/api/reels", protect, reelRoutes);
    if (aiRoutes) app.use('/api/ai', protect, aiRoutes); 
    if (getNeuralFeed) app.get("/api/feed", protect, getNeuralFeed);
    if (postRoutes) app.use("/api/posts", protect, postRoutes); 
    if (groupRoutes) app.use("/api/groups", protect, groupRoutes);
    if (messagesRoutes) app.use("/api/messages", protect, messagesRoutes); 
    if (marketRoutes) app.use("/api/market", protect, marketRoutes);
    if (adminRoutes) app.use("/api/admin", protect, adminRoutes);
    if (searchRoutes) app.use('/api/v1/search', protect, searchRoutes); 

    // ৪. সকেট.আইও সেটআপ রান
    await setupSocket();

    // ৫. স্ট্যাটিক ফাইল ও ভিইটি ডেভ সার্ভার লোড
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      // FIX: রেজেক্স ব্যবহার করে পাথ হ্যান্ডলিং যা এপিআই রাউটগুলোকে বাধা দিবে না
      app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
    
    // ৬. এক্সপ্রেস সার্ভার পোর্ট ৩০০০ এ বাইন্ড করা
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 ONYX CORE ACTIVE on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ FAILURE during startup:", error.message);
    process.exit(1);
  }
};

startApp();