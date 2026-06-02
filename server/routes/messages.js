import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();

// ১. সার্চ ইউজার
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
        
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "সার্চ সম্পন্ন করতে ব্যর্থ হয়েছে" });
    }
});

// ২. কনভারসেশন তৈরি বা খোঁজা
router.post("/conversations/create", protect, async (req, res) => {
    try {
        const { otherId } = req.body;
        if (!otherId) return res.status(400).json({ error: "অন্য ইউজার আইডি পাওয়া যায়নি" });

        const currentUserId = req.user._id;

        let conversation = await Conversation.findOne({
            members: { $all: [currentUserId, otherId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                members: [currentUserId, otherId],
                lastMessage: { text: "Neural link established.", senderId: currentUserId },
            });
        }

        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json({ error: "কনভারসেশন তৈরি করতে ব্যর্থ" });
    }
});

// ৩. কনভারসেশন লিস্ট আনা
router.get("/conversations", protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.user._id] },
        }).sort({ updatedAt: -1 }).lean();

        const result = await Promise.all(conversations.map(async (conv) => {
            const otherId = conv.members.find((m) => m.toString() !== req.user._id.toString());
            const userDetails = await User.findById(otherId).select("firstName lastName username avatar bio online isBot").lean();
            return { ...conv, userDetails: userDetails || null };
        }));

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: "কনভারসেশন লোড করতে সমস্যা হয়েছে" });
    }
});

// ৪. মেসেজ পাঠানো (Socket.io সহ)
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

        // Socket.io পারফরম্যান্স চেক
        const io = req.app.get("io");
        if (io) {
            io.to(conversationId).emit("receiveMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "মেসেজ পাঠানো সম্ভব হয়নি" });
    }
});

// ৫. চ্যাট হিস্ট্রি
router.get("/history/:conversationId", protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });
        
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: "হিস্ট্রি লোড করতে ব্যর্থ" });
    }
});

export default router;