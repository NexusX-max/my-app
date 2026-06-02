import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getAi, CYBER_SYSTEM_INSTRUCTION } from "../utils/aiHelper.js"; // AI Logic আলাদা রাখা ভালো

const router = express.Router();

/**
 * @desc    Search for users
 * @route   GET /api/messages/search-users/:query
 */
router.get("/search-users/:query", protect, async (req, res) => {
    try {
        const { query } = req.params;
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

/**
 * @desc    Create or Get Conversation
 * @route   POST /api/messages/conversations/create
 */
router.post("/conversations/create", protect, async (req, res) => {
    try {
        const { otherId } = req.body;
        const currentUserId = req.user._id.toString();

        let conversation = await Conversation.findOne({
            members: { $all: [currentUserId, otherId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                members: [currentUserId, otherId],
                lastMessage: { text: "Neural link established.", senderId: currentUserId },
            });
        }

        res.json(conversation);
    } catch (err) {
        res.status(500).json({ error: "Failed to create conversation" });
    }
});

/**
 * @desc    Get user conversations
 * @route   GET /api/messages/conversations
 */
router.get("/conversations", protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.user._id] },
        }).sort({ updatedAt: -1 }).lean();

        // Data Enrichment
        const result = await Promise.all(conversations.map(async (conv) => {
            const otherId = conv.members.find((m) => m.toString() !== req.user._id.toString());
            const userDetails = await User.findById(otherId).select("firstName lastName username avatar bio online isBot").lean();
            return { ...conv, userDetails };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

/**
 * @desc    Send Message
 * @route   POST /api/messages/message
 */
router.post("/message", protect, async (req, res) => {
    try {
        const { conversationId, text, image } = req.body;
        const senderId = req.user._id;

        const newMessage = await Message.create({
            conversationId,
            senderId,
            text: text || "",
            image: image || null,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: { text: image ? "📷 Image" : text, senderId },
            updatedAt: Date.now(),
        });

        // Socket.io integration (using req.app to get instance)
        const io = req.app.get("io");
        io.emit("receiveMessage", { conversationId, message: newMessage });

        res.json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "Message failed" });
    }
});

/**
 * @desc    Get Chat History
 * @route   GET /api/messages/history/:conversationId
 */
router.get("/history/:conversationId", protect, async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId })
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

export default router;