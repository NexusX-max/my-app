import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

// Models
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// Custom authentication/protection middleware
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

dotenv.config();

const PORT = 5000;
let isMongoConnected = false;

// --- Connect securely to MongoDB if custom coordinate configured ---
if (process.env.MONGO_URI) {
  console.log("⚡ [DATABASE DEPLOYMENT] Connecting to MongoDB Core Nexus...");
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      isMongoConnected = true;
      console.log("✅ [DATABASE EXECUTED] Secure connection established with remote MongoDB.");
      
      // Auto-populate default nodes if database has zero registries.
      try {
        const count = await User.countDocuments();
        if (count === 0) {
          console.log("🤖 [SEED SERVICE] Local registry is blank. Injecting default cybernetic nodes...");
          await User.insertMany(USERS_DB.filter(u => u._id !== "me"));
          console.log("✨ [SEED SERVICE] 6 Neural Nodes successfully initialized in MongoDB.");
        }
      } catch (err) {
        console.warn("⚠️ [SEED SERVICE ERROR] Skipping mock auto-population sequence:", err);
      }
    })
    .catch((err) => {
      console.error("❌ [DATABASE REFUSED] MongoDB handshake rejected. Operating sandbox local memory ledger. Error details:", err.message);
    });
} else {
  console.log("ℹ️ [OFFLINE SIMULATION] MONGO_URI variable not defined. Standard memory caskets active.");
}

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

// --- Dynamic Database Simulation Ledgers for Sandbox ---
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

// Active user sockets registry Map (userId -> socketId)
const activeUsers = new Map();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
      credentials: true
    }
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      activeUsers.set(userId, socket.id);
      console.log(`🛰️ User socket linked: ${userId} (${socket.id})`);
    }

    socket.on("addNewUser", (uid) => {
      if (uid) {
        activeUsers.set(uid, socket.id);
        console.log(`📡 Registered user socket (addNewUser): ${uid} (${socket.id})`);
      }
    });

    socket.on("registerUser", (uid) => {
      if (uid) {
        activeUsers.set(uid, socket.id);
        console.log(`📡 Registered user socket (registerUser): ${uid} (${socket.id})`);
      }
    });

    socket.on("initiateCall", (data) => {
      const recipientSocketId = activeUsers.get(data.to);
      console.log(`📞 Call signal routing from ${data.name} to ${data.to} (socket: ${recipientSocketId})`);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("incomingCall", {
          from: data.from,
          name: data.name,
          avatar: data.avatar,
          type: data.type
        });
      }
    });

    socket.on("declineCall", (data) => {
      const recipientSocketId = activeUsers.get(data.to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("callCancelled", {
          from: data.from
        });
      }
    });

    socket.on("acceptCall", (data) => {
      const recipientSocketId = activeUsers.get(data.to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("callConnected", {
          from: data.from
        });
      }
    });

    socket.on("disconnect", () => {
      for (const [uid, sid] of activeUsers.entries()) {
        if (sid === socket.id) {
          activeUsers.delete(uid);
          console.log(`🛸 Socket disconnected for: ${uid}`);
          break;
        }
      }
    });
  });

  app.use(express.json());

  // --- Dynamic CORS settings covering custom configurations ---
  app.use((req, res, next) => {
    const list = [
      "http://localhost:5173",
      "https://www.onyx-drift.com",
      "https://onyx-drift.com",
      "https://api.onyx-drift.com"
    ];
    const origin = req.headers.origin;
    if (origin && (list.includes(origin) || list.includes(origin + "/"))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ==========================================================
  // ⚡ COMBINED HYBRID ROUTERS (MONGOOSE DB + OFF-LINE LEDGER)
  // ==========================================================

  /* --- 🔍 SEARCH USERS --- */
  app.get("/api/messages/search-users/:query", protect, async (req, res) => {
    try {
      const { query } = req.params;
      const currentUserId = req.user._id;

      if (!query || query.length < 2) {
        return res.status(400).json({ error: "Query too short" });
      }

      if (isMongoConnected) {
        const users = await User.find({
          _id: { $ne: currentUserId },
          $or: [
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
          ],
        })
          .limit(8)
          .select("firstName lastName username avatar bio online isBot")
          .lean();
        
        return res.json(users);
      } else {
        // Fallback search index
        const results = USERS_DB.filter(u => 
          u._id !== "me" && (
            u.firstName.toLowerCase().includes(query.toLowerCase()) || 
            u.lastName.toLowerCase().includes(query.toLowerCase()) || 
            u.username.toLowerCase().includes(query.toLowerCase())
          )
        );
        return res.json(results);
      }
    } catch (err) {
      console.error("Search Error:", err);
      res.status(500).json({ error: "Search failed" });
    }
  });

  /* --- 🤝 CREATE OR GET CONVERSATION --- */
  app.post("/api/messages/conversations/create", protect, async (req, res) => {
    try {
      const { otherId } = req.body;
      const currentUserId = req.user._id.toString();

      if (!otherId) {
        return res.status(400).json({ error: "otherId required" });
      }

      if (isMongoConnected) {
        let conversation = await Conversation.findOne({
          members: { $all: [currentUserId, otherId] },
        });

        if (!conversation) {
          conversation = new Conversation({
            members: [currentUserId, otherId],
            lastMessage: { text: "Neural link established.", senderId: currentUserId },
            updatedAt: new Date(),
          });
          await conversation.save();
        }

        return res.json(conversation);
      } else {
        // In-memory Conversation linkage
        let existing = CONVERSATIONS_DB.find(c => 
          c.members.includes(otherId) && c.members.includes(currentUserId)
        );

        if (existing) {
          return res.json(existing);
        }

        const newConv = {
          _id: `conv-dynamic-${Date.now()}`,
          members: [currentUserId, otherId],
          lastMessage: { text: "Neural link established. Tap to chat.", senderId: otherId },
          updatedAt: new Date()
        };

        CONVERSATIONS_DB.unshift(newConv);
        return res.json(newConv);
      }
    } catch (err) {
      console.error("Create Conv Error:", err);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  /* --- 📥 GET CONVERSATIONS --- */
  app.get("/api/messages/conversations", protect, async (req, res) => {
    try {
      const userId = req.user._id.toString();

      if (isMongoConnected) {
        const conversations = await Conversation.find({
          members: { $in: [userId] },
        })
          .sort({ updatedAt: -1 })
          .lean();

        const result = await Promise.all(
          conversations.map(async (conv) => {
            const otherId = conv.members.find((m) => m !== userId);
            let userDetails = null;
            if (mongoose.Types.ObjectId.isValid(otherId)) {
              try {
                userDetails = await User.findById(otherId)
                  .select("firstName lastName username avatar bio online isBot")
                  .lean();
              } catch (err) {
                console.error("User findById error:", err);
              }
            }

            if (!userDetails) {
              // Graceful fallback for custom unseeded user instances
              const mockSeed = USERS_DB.find(u => u._id === otherId);
              userDetails = mockSeed || {
                _id: otherId,
                firstName: "Cryptic",
                lastName: "Node",
                username: "drifter_node",
                avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
                bio: "Zero-Knowledge Drifter",
                online: true,
                isBot: false
              };
            }

            // Map standard _id format
            return { 
              ...conv, 
              _id: conv._id.toString(),
              userDetails: {
                ...userDetails,
                _id: userDetails._id.toString()
              }
            };
          })
        );

        return res.json(result);
      } else {
        // In-memory data model maps
        const result = CONVERSATIONS_DB.map(conv => {
          const otherId = conv.members.find(m => m !== userId) || "bot-onyx";
          const userDetails = USERS_DB.find(u => u._id === otherId) || {
            _id: otherId,
            firstName: "Unknown",
            lastName: "Node",
            username: "unknown",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            bio: "Unregistered operator.",
            online: false,
            isBot: false
          };
          return {
            ...conv,
            userDetails
          };
        });

        return res.json(result);
      }
    } catch (err) {
      console.error("Fetch Conv Error:", err);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  /* --- 🗑️ DELETE CONVERSATION --- */
  app.delete("/api/messages/conversations/:id", protect, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id.toString();

      if (isMongoConnected) {
        // Authenticate the user is a member of this conversation before deleting
        const conv = await Conversation.findOne({ _id: id, members: userId });
        if (!conv) {
          return res.status(404).json({ error: "Conversation not found or access denied" });
        }
        await Conversation.deleteOne({ _id: id });
        await Message.deleteMany({ conversationId: id });
        return res.json({ success: true, message: "Conversation and messages purged." });
      } else {
        CONVERSATIONS_DB = CONVERSATIONS_DB.filter(c => c._id !== id);
        delete MESSAGES_HISTORY_DB[id];
        return res.json({ success: true, message: "Sandbox conversation memory purged." });
      }
    } catch (err) {
      console.error("Purge Conv Error:", err);
      res.status(500).json({ error: "Failed to purge connection route" });
    }
  });

  /* --- 📤 SEND MESSAGE --- */
  app.post("/api/messages/message", protect, async (req, res) => {
    try {
      const senderId = req.user._id.toString();
      const { conversationId, text, image } = req.body;

      if (!conversationId) {
        return res.status(400).json({ error: "Invalid Conversation ID" });
      }

      if (isMongoConnected) {
        const newMessage = new Message({
          conversationId,
          senderId,
          text: text || "",
          image: image || null,
        });

        const savedMessage = await newMessage.save();

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: { 
            text: image ? "📷 Image" : (text || "Sent a message"), 
            senderId 
          },
          updatedAt: new Date(),
        });

        // Trigger AI Bot Core trigger to answer in database
        const conv = await Conversation.findById(conversationId).lean();
        const otherId = conv?.members.find(m => m !== senderId);
        const matchedUser = otherId ? await User.findById(otherId).lean() : null;

        // Broadcast to online recipient
        const io = req.app.get("io");
        if (io && otherId) {
          const recipientSocketId = activeUsers.get(otherId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("receiveMessage", {
              conversationId,
              message: savedMessage
            });
          }
        }

        res.json(savedMessage);

        if (matchedUser && matchedUser.isBot) {
          setTimeout(async () => {
            let aiResponseText = "";
            if (matchedUser._id === "bot-luna") {
              const lowText = (text || "").toLowerCase();
              if (lowText.includes("tire") || lowText.includes("burn") || lowText.includes("stress")) {
                aiResponseText = "🌱 [LUNAR SECURITY] Focus cycles indicate psychological hyper-intensity. Your biometric mesh matches baseline stress limits. Rest your eyes or select the Theta binaural hum soundscape in settings.";
              } else {
                aiResponseText = "🧠 [LUNAR INSIGHTS] Handshake acknowledged. Bio-telemetry looks stable. Onyx neural link keeps operations safe. Keep coding with breathing intervals.";
              }
            } else {
              // Query authentic Gemini API
              const ai = getAi();
              if (ai) {
                try {
                  const dbMsgs = await Message.find({ conversationId })
                    .sort({ createdAt: -1 })
                    .limit(6)
                    .lean();
                  
                  const sorted = dbMsgs.reverse();
                  const formatted = sorted.map(m => ({
                    role: m.senderId === senderId ? 'user' : 'model',
                    parts: [{ text: m.text }]
                  }));

                  const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash",
                    contents: formatted,
                    config: {
                      systemInstruction: CYBER_SYSTEM_INSTRUCTION,
                      temperature: 0.8,
                    }
                  });
                  aiResponseText = response.text || "Handshake timeout.";
                } catch (e) {
                  aiResponseText = `🤖 [ONYX COMPILER] Local database sync offline. Secure transmission: "${text}". Build coordinates matching 100% logic index.`;
                }
              } else {
                aiResponseText = `🤖 [ONYX SANDBOX COMPILER] Local sandbox intelligence active. Raw packet: "${text}". To integrate Google's ultra-powerful Gemini models, click Secrets and configure process.env.GEMINI_API_KEY.`;
              }
            }

            const botMessage = new Message({
              conversationId,
              senderId: matchedUser._id,
              text: aiResponseText,
            });
            await botMessage.save();

            await Conversation.findByIdAndUpdate(conversationId, {
              lastMessage: { text: aiResponseText, senderId: matchedUser._id },
              updatedAt: new Date()
            });

            if (io) {
              const senderSocketId = activeUsers.get(senderId);
              if (senderSocketId) {
                io.to(senderSocketId).emit("receiveMessage", {
                  conversationId,
                  message: botMessage
                });
              }
            }
          }, 1500);
        }
        return;
      } else {
        // In-memory storage mapping logic
        const newMessage = {
          id: "msg-" + Date.now(),
          conversationId,
          senderId,
          text: text || "",
          image: image || null,
          createdAt: new Date()
        };

        if (!MESSAGES_HISTORY_DB[conversationId]) {
          MESSAGES_HISTORY_DB[conversationId] = [];
        }
        MESSAGES_HISTORY_DB[conversationId].push(newMessage);

        const convIndex = CONVERSATIONS_DB.findIndex(c => c._id === conversationId);
        if (convIndex !== -1) {
          CONVERSATIONS_DB[convIndex].lastMessage = {
            text: image ? "📷 Image" : (text || "Sent a message"),
            senderId
          };
          CONVERSATIONS_DB[convIndex].updatedAt = new Date();
        }

        const conv = CONVERSATIONS_DB.find(c => c._id === conversationId);
        const otherId = conv?.members?.find(m => m !== senderId) || conversationId.replace("conv-", "");
        const matchedUser = USERS_DB.find(u => u._id === otherId || conversationId.includes(u._id));
        
        const io = req.app.get("io");
        if (io && otherId) {
          const recipientSocketId = activeUsers.get(otherId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("receiveMessage", {
              conversationId,
              message: newMessage
            });
          }
        }

        res.json(newMessage);

        if (matchedUser && matchedUser.isBot) {
          setTimeout(async () => {
            let aiResponseText = "";
            if (matchedUser._id === "bot-luna") {
              const lowText = (text || "").toLowerCase();
              if (lowText.includes("tire") || lowText.includes("burn") || lowText.includes("stress")) {
                aiResponseText = "🌱 [LUNAR SECURITY] Focus cycles indicate psychological hyper-intensity. Your biometric mesh matches baseline stress limits. Rest your eyes or select the Theta binaural hum soundscape in settings.";
              } else {
                aiResponseText = "🧠 [LUNAR INSIGHTS] Handshake acknowledged. Bio-telemetry looks stable. Onyx neural link keeps operations safe. Keep coding with breathing intervals.";
              }
            } else {
              const ai = getAi();
              if (ai) {
                try {
                  const historyList = MESSAGES_HISTORY_DB[conversationId] || [];
                  const formatted = historyList.slice(-6).map(m => ({
                    role: m.senderId === senderId ? 'user' : 'model',
                    parts: [{ text: m.text }]
                  }));

                  const response = await ai.models.generateContent({
                    model: "gemini-3.5-flash",
                    contents: formatted,
                    config: {
                      systemInstruction: CYBER_SYSTEM_INSTRUCTION,
                      temperature: 0.8,
                    }
                  });
                  aiResponseText = response.text || "Handshake timeout.";
                } catch (e) {
                  aiResponseText = `🤖 [ONYX COMPILER] Local database sync offline. Secure transmission: "${text}". Build coordinates matching 100% logic index.`;
                }
              } else {
                aiResponseText = `🤖 [ONYX SANDBOX COMPILER] Local sandbox intelligence active. Raw packet: "${text}". To integrate Google's ultra-powerful Gemini models, click Secrets and configure process.env.GEMINI_API_KEY.`;
              }
            }

            const botMsg = {
              id: "msg-" + Date.now(),
              conversationId,
              senderId: matchedUser._id,
              text: aiResponseText,
              createdAt: new Date()
            };

            MESSAGES_HISTORY_DB[conversationId].push(botMsg);
            
            if (convIndex !== -1) {
              CONVERSATIONS_DB[convIndex].lastMessage = { text: aiResponseText, senderId: matchedUser._id };
              CONVERSATIONS_DB[convIndex].updatedAt = new Date();
            }

            if (io) {
              const senderSocketId = activeUsers.get(senderId);
              if (senderSocketId) {
                io.to(senderSocketId).emit("receiveMessage", {
                  conversationId,
                  message: botMsg
                });
              }
            }
          }, 1500);
        }
        return;
      }
    } catch (err) {
      console.error("Send Message Error:", err);
      res.status(500).json({ error: "Send failed" });
    }
  });

  /* --- 📜 GET MESSAGES --- */
  app.get("/api/messages/history/:conversationId", protect, async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user._id.toString();

      if (!conversationId) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      if (isMongoConnected) {
        // Query database directly
        const messages = await Message.find({ conversationId })
          .sort({ createdAt: 1 })
          .limit(100)
          .lean();

        // Convert key models to client compliant signatures
        const clientFormatted = messages.map(m => ({
          id: m._id.toString(),
          conversationId: m.conversationId,
          senderId: m.senderId,
          text: m.text,
          image: m.image,
          createdAt: m.createdAt
        }));

        return res.json(clientFormatted);
      } else {
        if (!MESSAGES_HISTORY_DB[conversationId]) {
          MESSAGES_HISTORY_DB[conversationId] = [];
        }
        return res.json(MESSAGES_HISTORY_DB[conversationId]);
      }
    } catch (err) {
      console.error("Fetch Messages Error:", err);
      res.status(500).json({ error: "Fetch failed" });
    }
  });

  // API Route: AI Neural Chat
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
      console.error("Gemini route error:", error);
      res.status(500).json({ error: error.message || "An error occurred during neural compilation." });
    }
  });

  // API Route: Health check link
  app.get("/api/health", (req, res) => {
    res.json({
      status: "online",
      uptime: process.uptime(),
      latency: "0.02ms",
      database: isMongoConnected ? "connected" : "fallback-memory",
      node: "ONYX-CORE-MAIN"
    });
  });

  // Serve static assets out of dist on production, otherwise Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Onyx Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server bootstrap failure:", err);
});
export default router;