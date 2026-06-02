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
        // যদি এটি কোনো মক/বোট আইডি না হয়, তবেই কেবল মঙ্গোডিবি আইডি ভ্যালিডেশন হবে
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
            if (mongoose.Types.ObjectId.isValid(otherId)) {
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

        // যদি এটি মঙ্গোডিবি অবজেক্ট আইডি হয়, তবেই আপডেট হবে
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

// 5. Get Chat History (সম্পূর্ণ সংশোধিত রাউট)
router.get("/history/:conversationId", protect, async (req, res) => {
    try {
        let { conversationId } = req.params;
        
        // আইডি প্রিফিক্স ক্লিন করা (যেমন: conv-temp-onyx -> onyx)
        const cleanId = conversationId.replace(/^conv-temp-|^conv-/, '');

        // বোট আইডি বা কাস্টম স্যান্ডবক্স আইডি চেক (যেগুলো মঙ্গোডিবি আইডি নয়)
        const isBotOrCustom = [
            'onyx', 'luna', 'kaelen', 'sasha', 
            'bot-onyx', 'bot-luna', 'user-kaelen', 'user-sasha'
        ].includes(cleanId) || cleanId.startsWith('bot-') || cleanId.startsWith('user-');

        // বোট বা কাস্টম ইউজার হলে মঙ্গোডিবি কোয়েরির বদলে সরাসরি খালি হিস্ট্রি পাঠাবে যেন কনসোল এরর বা ক্র্যাশ এড়ানো যায়
        if (isBotOrCustom) {
            return res.status(200).json([]);
        }

        // যদি বোট বা কাস্টম আইডি না হয়, কেবল তখনই মঙ্গো আইডি ভ্যালিডেশন করবে
        if (!mongoose.Types.ObjectId.isValid(cleanId)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // মঙ্গোডিবি থেকে মেসেজগুলো অনুসন্ধান করা (যাতে cleanId ও conversationId দুইভাবেই ম্যাচ করতে পারে)
        const messages = await Message.find({
            $or: [
                { conversationId: cleanId },
                { conversationId: conversationId }
            ]
        })
        .sort({ createdAt: 1 })
        .lean();
        
        // ফরম্যাটেড মেসেজ অ্যারে রিটার্ন করা
        const formattedMessages = messages.map(m => ({
            id: m._id.toString(),
            conversationId: m.conversationId,
            senderId: m.senderId,
            text: m.text,
            image: m.image,
            createdAt: m.createdAt
        }));

        res.status(200).json(formattedMessages);
    } catch (err) {
        res.status(500).json({ error: "হিস্ট্রি লোড করতে ব্যর্থ" });
    }
});

export default router;