import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// --- Routes ---

/* 🔍 SEARCH USERS */
// পাথের আগে স্ল্যাশ বা এক্সট্রা কিছু দরকার নেই, কারণ এটি /api/messages এর আন্ডারে আছে
router.get("/search-users/:query", protect, async (req, res) => {
  try {
    const { query } = req.params;
    if (!query || query.length < 2) return res.status(400).json({ error: "Query too short" });
    
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    }).limit(8).select("firstName lastName username avatar bio online isBot").lean();
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

/* 🤝 CREATE CONVERSATION */
router.post("/conversations/create", protect, async (req, res) => {
  try {
    const { otherId } = req.body;
    const currentUserId = req.user._id.toString();
    
    let conversation = await Conversation.findOne({ members: { $all: [currentUserId, otherId] } });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [currentUserId, otherId],
        lastMessage: { text: "Neural link established.", senderId: currentUserId },
        updatedAt: new Date()
      });
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

/* 📥 GET CONVERSATIONS */
router.get("/conversations", protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ members: { $in: [req.user._id.toString()] } }).sort({ updatedAt: -1 }).lean();
    
    const result = await Promise.all(conversations.map(async (conv) => {
      const otherId = conv.members.find((m) => m !== req.user._id.toString());
      const userDetails = await User.findById(otherId).select("firstName lastName username avatar bio online isBot").lean();
      return { ...conv, userDetails };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/* 📤 SEND MESSAGE */
router.post("/message", protect, async (req, res) => {
  try {
    const senderId = req.user._id.toString();
    const { conversationId, text, image } = req.body;

    const savedMessage = await Message.create({ conversationId, senderId, text: text || "", image: image || null });
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: { text: text || "Image", senderId }, updatedAt: new Date() });

    res.json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: "Send failed" });
  }
});

/* 📜 GET MESSAGES HISTORY */
router.get("/history/:conversationId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 }).limit(100).lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

export default router;