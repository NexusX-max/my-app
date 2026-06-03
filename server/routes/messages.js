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
        if (!otherId) {
            return res.status(400).json({ error: "ইনভ্যালিড ইউজার আইডি" });
        }

        const currentUserId = req.user._id || req.user.id || "me";

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
        const currentUserId = (req.user._id || req.user.id || "me").toString();
        const conversations = await Conversation.find({
            members: { $in: [currentUserId] },
        }).sort({ updatedAt: -1 }).lean();

        const result = await Promise.all(conversations.map(async (conv) => {
            const otherId = conv.members.find((m) => m.toString() !== currentUserId);
            let userDetails = null;
            if (otherId) {
                // Check if it's a seed user or standard object
                if (mongoose.Types.ObjectId.isValid(otherId)) {
                    userDetails = await User.findById(otherId).select("firstName lastName username avatar bio online isBot").lean();
                } else {
                    userDetails = await User.findOne({ username: otherId }).select("firstName lastName username avatar bio online isBot").lean();
                    if (!userDetails) {
                        // Find by _id matching user-kaelen, bot-onyx etc.
                        userDetails = await User.findOne({ _id: otherId }).select("firstName lastName username avatar bio online isBot").lean();
                    }
                }
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
        const senderId = req.user._id || req.user.id || "me";

        if (!conversationId) {
            return res.status(400).json({ error: "ইনভ্যালিড কনভারসেশন আইডি" });
        }

        const newMessage = await Message.create({
            conversationId,
            senderId,
            text: text || "",
            image: image || null,
        });

        // Update Conversation lastMessage if it's a valid ObjectId or valid conv reference
        try {
            if (mongoose.Types.ObjectId.isValid(conversationId)) {
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: { text: image ? "📷 Image" : text, senderId },
                    updatedAt: Date.now(),
                });
            } else {
                await Conversation.findOneAndUpdate(
                    { _id: conversationId },
                    {
                        lastMessage: { text: image ? "📷 Image" : text, senderId },
                        updatedAt: Date.now(),
                    },
                    { upsert: false }
                );
            }
        } catch (convErr) {
            console.warn("Could not update lastMessage for conversation:", convErr.message);
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

// 5. Get Chat History (সংশোধিত রাউট)
router.get("/history/:conversationId", protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        // আইডি প্রিফিক্স ক্লিন করা (যেমন: conv-temp-onyx -> onyx)
        const cleanId = conversationId.replace(/^conv-temp-|^conv-/, '');

        // বোট আইডি বা কাস্টম আইডি চেক (যেগুলো মঙ্গোডিবি আইডি নয়)
        const isBotOrCustom = [
            'onyx', 'luna', 'kaelen', 'sasha', 
            'bot-onyx', 'bot-luna', 'user-kaelen', 'user-sasha', 
            'zephyr', 'oracle'
        ].includes(cleanId) || 
        cleanId.startsWith('bot-') || 
        cleanId.startsWith('user-') ||
        conversationId.startsWith('conv-temp-') ||
        !mongoose.Types.ObjectId.isValid(cleanId);

        // Search messages from MongoDB matching either cleanId or raw conversationId
        let messages = [];
        try {
            messages = await Message.find({
                $or: [
                    { conversationId: cleanId },
                    { conversationId: conversationId }
                ]
            }).sort({ createdAt: 1 }).lean();
        } catch (dbErr) {
            console.warn("MongoDB fetch history failed, using fallback:", dbErr.message);
        }

        // If no messages found in database and it is a bot/custom sandbox ID, return mock history fallback
        if (messages.length === 0 && isBotOrCustom) {
            if (cleanId === 'onyx' || cleanId === 'bot-onyx') {
                messages = [
                    { _id: "m1", conversationId: conversationId, senderId: "bot-onyx", text: "Onyx Core Boot v4.8 completed. All neural signals intact.", createdAt: new Date("2026-05-27T02:50:00Z") },
                    { _id: "m2", conversationId: conversationId, senderId: "me", text: "Is the secure tunnel configured?", createdAt: new Date("2026-05-27T02:51:00Z") },
                    { _id: "m3", conversationId: conversationId, senderId: "bot-onyx", text: "Affirmative. AES-512 level encapsulation active on all terminal entries. Send queries for intelligence synthesis.", createdAt: new Date("2026-05-27T02:52:00Z") }
                ];
            } else if (cleanId === 'luna' || cleanId === 'bot-luna') {
                messages = [
                    { _id: "ml1", conversationId: conversationId, senderId: "bot-luna", text: "Greetings operator. I monitored your bioprofile spikes. Are you spending too many cycles code linking?", createdAt: new Date("2026-05-27T02:40:00Z") },
                    { _id: "ml2", conversationId: conversationId, senderId: "me", text: "I'm optimizing the visual refresh rate.", createdAt: new Date("2026-05-27T02:42:00Z") },
                    { _id: "ml3", conversationId: conversationId, senderId: "bot-luna", text: "A standard architectural trap. Beautiful visuals deserve dynamic neural rest. Ground yourself in our ambient soundscapes.", createdAt: new Date("2026-05-27T02:43:00Z") }
                ];
            } else if (cleanId === 'kaelen' || cleanId === 'user-kaelen') {
                messages = [
                    { _id: "mk1", conversationId: conversationId, senderId: "user-kaelen", text: "Yo, are you looking at the live reverse proxy streams?", createdAt: new Date("2026-05-27T01:28:00Z") },
                    { _id: "mk2", conversationId: conversationId, senderId: "me", text: "Yeah, port 3000 is running behind the nginx layer perfectly.", createdAt: new Date("2026-05-27T01:29:00Z") },
                    { _id: "mk3", conversationId: conversationId, senderId: "user-kaelen", text: "Excellent. Just bypass the mainframe port 3000 rules. It's direct ingress.", createdAt: new Date("2026-05-27T01:30:00Z") }
                ];
            } else if (cleanId === 'sasha' || cleanId === 'user-sasha') {
                messages = [
                    { _id: "ms1", conversationId: conversationId, senderId: "user-sasha", text: "Did you check the synthetic interface designs?", createdAt: new Date("2026-05-27T02:00:00Z") },
                    { _id: "ms2", conversationId: conversationId, senderId: "me", text: "Yes, looks clean! Loving the glowing layout.", createdAt: new Date("2026-05-27T02:05:00Z") }
                ];
            }
        }

        // Format for consistent consumption in UI
        const clientFormatted = messages.map(m => ({
            id: m._id ? m._id.toString() : (m.id || "msg-" + Math.random()),
            conversationId: conversationId,
            senderId: m.senderId || m.sender,
            text: m.text,
            image: m.image || m.file || null,
            createdAt: m.createdAt || new Date()
        }));

        res.status(200).json(clientFormatted);
    } catch (err) {
        console.error("History fetch error:", err);
        res.status(500).json({ error: "হিস্ট্রি লোড করতে ব্যর্থ" });
    }
});

export default router;
