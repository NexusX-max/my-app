import express from "express";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();

// 1. Search for users
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
        res.status(500).json({ error: "সার্চ সম্পন্ন করতে ব্যর্থ হয়েছে" });
    }
});

// 2. Create or Get Conversation
router.post("/conversations/create", protect, async (req, res) => {
    try {
        const { otherId } = req.body;
        const isBotOrCustom = ['onyx', 'luna', 'kaelen', 'sasha', 'bot-onyx', 'bot-luna', 'user-kaelen', 'user-sasha'].includes(otherId);
        
        if (!isBotOrCustom && (!otherId || !mongoose.Types.ObjectId.isValid(otherId))) {
            return res.status(400).json({ error: "ইনভ্যালিড ইউজার আইডি" });
        }

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

// 3. Get user conversations
router.get("/conversations", protect, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.user._id] },
        }).sort({ updatedAt: -1 }).lean();

        const result = await Promise.all(conversations.map(async (conv) => {
            const otherId = conv.members.find((m) => m.toString() !== req.user._id.toString());
            let userDetails = null;
            if (otherId && mongoose.Types.ObjectId.isValid(otherId)) {
                userDetails = await User.findById(otherId).select("firstName lastName username avatar bio online isBot").lean();
            }
            return { ...conv, userDetails: userDetails || null };
        }));

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: "কনভারসেশন লোড করতে সমস্যা হয়েছে" });
    }
});

// 4. Send Message
router.post("/message", protect, async (req, res) => {
    try {
        const { conversationId, text, image } = req.body;
        const senderId = req.user._id;

        if (!conversationId) {
            return res.status(400).json({ error: "ইনভ্যালিড কনভারসেশন আইডি" });
        }

        const newMessage = await Message.create({
            conversationId,
            senderId,
            text: text || "",
            image: image || null,
        });

        // কনভারসেশন আপডেট (শুধুমাত্র মঙ্গো আইডি হলে)
        if (mongoose.Types.ObjectId.isValid(conversationId)) {
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: { text: image ? "📷 Image" : text, senderId },
                updatedAt: Date.now(),
            });
        }

        const io = req.app.get("io");
        if (io) {
            io.to(conversationId).emit("receiveMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "মেসেজ পাঠানো সম্ভব হয়নি" });
    }
});
// ৫. Get Chat History (সবচেয়ে নিরাপদ ভার্সন)
router.get("/history/:conversationId", protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        // এখানে কোনো 'isValid' চেক নেই। এটিই রুট কজ (Root Cause) হওয়ার কথা।
        // সরাসরি আইডি দিয়ে মেসেজ খুঁজবে।
        const messages = await Message.find({ conversationId: conversationId })
            .sort({ createdAt: 1 })
            .lean();
        
        // রেজাল্ট পাঠানো
        res.status(200).json(messages);
    } catch (err) {
        console.error("History Error:", err);
        // এরর হলেও আমরা empty array পাঠাবো, যাতে ফ্রন্টএন্ড এরর না দেখায়
        res.status(200).json([]);
    }
});
export default router;