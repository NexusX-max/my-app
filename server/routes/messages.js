import express from "express";
import mongoose from "mongoose";
// Disable Mongoose schema / query buffering so offline simulated fallbacks trigger immediately
mongoose.set('bufferCommands', false);
import { protect } from "../middleware/authMiddleware.js";
import { GoogleGenAI } from "@google/genai";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();

// System instruction for Gemini Core AI
const CYBER_SYSTEM_INSTRUCTION = `
You are "Onyx Core Intelligence", the hyper-advanced, ultra-secure neural AI assistant powering the Onyx Chat network.
Your tone is sleek, technical, slightly mysterious, helpful, and deeply immersed in cyberpunk/neural network terminology.
You refer to users as "Nodes", "Operators", or "Drifters".
You refer to chat connections as "Neural Paths" or "Quantum Links".
Respond in elegant, formatted Markdown. Keep answers concise, snappy, and visually beautiful.
`;

// Helper to get Gemini client
let aiClient = null;
function getAi() {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            aiClient = new GoogleGenAI({ apiKey });
        }
    }
    return aiClient;
}

// 1. Search for users
router.get("/search-users/:query", protect, async (req, res) => {
    try {
        const { query } = req.params;
        const currentUserId = req.user._id || req.user.id || "me";
        
        let users = [];
        try {
            users = await User.find({
                _id: { $ne: currentUserId },
                $or: [
                    { firstName: { $regex: query, $options: "i" } },
                    { lastName: { $regex: query, $options: "i" } },
                    { username: { $regex: query, $options: "i" } },
                ],
            }).limit(8).select("firstName lastName username avatar bio online isBot").lean();
        } catch (dbErr) {
            console.warn("MongoDB user search failed: ", dbErr.message);
        }
        
        // If no database users or offline, we fallback to custom matching for sandbox simulation
        if (users.length === 0) {
            const mockUsers = [
                { _id: "bot-onyx", firstName: "Onyx Core", lastName: "Intelligence", username: "core_ai", avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80", bio: "Main artificial intelligence framework.", online: true, isBot: true },
                { _id: "bot-luna", firstName: "Dr. Luna", lastName: "Vane", username: "luna_psych", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", bio: "Chief Bio-Neural Psychologist of Onyx Citadel.", online: true, isBot: true },
                { _id: "user-kaelen", firstName: "Kaelen", lastName: "Vex", username: "kaelen_deck", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", bio: "Underground network decker and freelance ingress engineer.", online: true, isBot: false },
                { _id: "user-sasha", firstName: "Sasha", lastName: "Glimmer", username: "sasha_design", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", bio: "Synthetic interface architect.", online: false, isBot: false },
                { _id: "zephyr", firstName: "Zephyr", lastName: "Nox", username: "zephyr01", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", bio: "Optical fiber quantum tracer.", online: true, isBot: false },
                { _id: "oracle", firstName: "Oracle", lastName: "Cyber", username: "oracle_sys", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", bio: "Quantum database core synchronizer.", online: true, isBot: false }
            ];

            users = mockUsers.filter(u => 
                u._id !== currentUserId && 
                (u.firstName.toLowerCase().includes(query.toLowerCase()) || 
                 u.lastName.toLowerCase().includes(query.toLowerCase()) || 
                 u.username.toLowerCase().includes(query.toLowerCase()))
            );
        }

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

        const currentUserId = (req.user._id || req.user.id || "me").toString();

        let conversation = null;
        try {
            conversation = await Conversation.findOne({
                members: { $all: [currentUserId, otherId] },
            });

            if (!conversation) {
                const tempConv = new Conversation({
                    members: [currentUserId, otherId],
                    lastMessage: { text: "Neural link established.", senderId: currentUserId },
                });
                conversation = await tempConv.save();
            }
        } catch (dbErr) {
            console.warn("MongoDB conversation create failed, fallback to simulated model:", dbErr.message);
            // Simulate creation for interface responsiveness
            conversation = {
                _id: "conv-temp-" + otherId,
                members: [currentUserId, otherId],
                lastMessage: { text: "Neural link established (Sandbox Fallback).", senderId: currentUserId },
                updatedAt: new Date()
            };
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
        
        let conversations = [];
        if (mongoose.connection.readyState === 1) {
            try {
                conversations = await Conversation.find({
                    members: { $in: [currentUserId] },
                }).sort({ updatedAt: -1 }).lean();
            } catch (dbErr) {
                console.warn("MongoDB read conversations failed:", dbErr.message);
            }
        }

        // Standard seed users to populate offline list or resolve usernames easily
        const mockUsers = [
            { _id: "bot-onyx", firstName: "Onyx Core", lastName: "Intelligence", username: "core_ai", avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80", bio: "Main artificial intelligence framework.", online: true, isBot: true },
            { _id: "bot-luna", firstName: "Dr. Luna", lastName: "Vane", username: "luna_psych", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", bio: "Chief Bio-Neural Psychologist of Onyx Citadel.", online: true, isBot: true },
            { _id: "user-kaelen", firstName: "Kaelen", lastName: "Vex", username: "kaelen_deck", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", bio: "Underground network decker and freelance ingress engineer.", online: true, isBot: false },
            { _id: "user-sasha", firstName: "Sasha", lastName: "Glimmer", username: "sasha_design", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", bio: "Synthetic interface architect.", online: false, isBot: false },
            { _id: "zephyr", firstName: "Zephyr", lastName: "Nox", username: "zephyr01", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", bio: "Optical fiber quantum tracer.", online: true, isBot: false },
            { _id: "oracle", firstName: "Oracle", lastName: "Cyber", username: "oracle_sys", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", bio: "Quantum database core synchronizer.", online: true, isBot: false }
        ];

        // If conversations is empty, provide custom sandbox list
        if (conversations.length === 0) {
            conversations = [
                { _id: "conv-onyx", members: ["me", "bot-onyx"], lastMessage: { text: "Onyx Core Boot v4.8 completed. Syncing coordinates...", senderId: "bot-onyx" }, updatedAt: new Date() },
                { _id: "conv-luna", members: ["me", "bot-luna"], lastMessage: { text: "A standard architectural trap. Rest your visual iris.", senderId: "bot-luna" }, updatedAt: new Date() },
                { _id: "conv-kaelen", members: ["me", "user-kaelen"], lastMessage: { text: "Yo, are you looking at the live reverse proxy streams?", senderId: "user-kaelen" }, updatedAt: new Date() }
            ];
        }

        const result = await Promise.all(conversations.map(async (conv) => {
            const otherId = conv.members.find((m) => m.toString() !== currentUserId);
            let userDetails = null;
            if (otherId) {
                // Try to find on MongoDB first
                if (mongoose.Types.ObjectId.isValid(otherId)) {
                    try {
                        userDetails = await User.findById(otherId).select("firstName lastName username avatar bio online isBot").lean();
                    } catch (e) {}
                } else {
                    try {
                        userDetails = await User.findOne({ username: otherId }).select("firstName lastName username avatar bio online isBot").lean();
                        if (!userDetails) {
                            userDetails = await User.findOne({ _id: otherId }).select("firstName lastName username avatar bio online isBot").lean();
                        }
                    } catch (e) {}
                }

                // If not found inside database, check seed nodes matching fallback IDs
                if (!userDetails) {
                    userDetails = mockUsers.find(u => u._id === otherId || u.username === otherId);
                }
            }
            return { ...conv, userDetails: userDetails || null };
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error("Get conversations error:", err);
        res.status(500).json({ error: "কনভারসেশন লোড করতে সমস্যা হয়েছে" });
    }
});

// 4. Send Message and Trigger AI Responses
router.post("/message", protect, async (req, res) => {
    try {
        const { conversationId, text, image } = req.body;
        const senderId = (req.user._id || req.user.id || "me").toString();

        if (!conversationId) {
            return res.status(400).json({ error: "ইনভ্যালিড কনভারসেশন আইডি" });
        }

        let targetConversationId = conversationId;
        const cleanId = conversationId.replace(/^conv-temp-|^conv-/, '');

        // If conversationId is a temporary or user-direct ID (not a valid ObjectId of conversation)
        // Check if cleanId is not one of the bot and preset IDs, and verify if cleanId is a valid ObjectId (user ID)
        const isBotOrCustom = [
            'onyx', 'luna', 'kaelen', 'sasha', 
            'bot-onyx', 'bot-luna', 'user-kaelen', 'user-sasha', 
            'zephyr', 'oracle'
        ].includes(cleanId) || 
        cleanId.startsWith('bot-') || 
        cleanId.startsWith('user-') ||
        !mongoose.Types.ObjectId.isValid(cleanId);

        let isAlreadyConversation = false;
        if (mongoose.connection.readyState === 1 && !isBotOrCustom && mongoose.Types.ObjectId.isValid(cleanId)) {
            try {
                const existingConv = await Conversation.exists({ _id: cleanId });
                if (existingConv) {
                    isAlreadyConversation = true;
                }
            } catch (err) {
                console.warn("Error checking existing conversation:", err.message);
            }
        }

        if (mongoose.connection.readyState === 1 && cleanId && !isBotOrCustom && !isAlreadyConversation && mongoose.Types.ObjectId.isValid(cleanId)) {
            try {
                let conv = await Conversation.findOne({
                    members: { $all: [senderId, cleanId] }
                });
                if (!conv) {
                    const tempConv = new Conversation({
                        members: [senderId, cleanId],
                        lastMessage: { text: image ? "📷 Image" : (text || "Neural link established."), senderId: senderId },
                    });
                    conv = await tempConv.save();
                }
                targetConversationId = conv._id.toString();
            } catch (err) {
                console.warn("Resolving temp conversation during message send failed:", err.message);
            }
        }

        let newMessage = null;
        if (mongoose.connection.readyState === 1) {
            try {
                const tempMsg = new Message({
                    conversationId: targetConversationId,
                    senderId,
                    text: text || "",
                    image: image || null,
                });
                newMessage = await tempMsg.save();
            } catch (dbErr) {
                console.warn("MongoDB write message failed, spawning simulated in-memory packet:", dbErr.message);
            }
        }

        if (!newMessage) {
            newMessage = {
                _id: "msg-temp-" + Date.now(),
                conversationId: targetConversationId,
                senderId,
                text: text || "",
                image: image || null,
                createdAt: new Date()
            };
        }

        // Update Conversation lastMessage if possible
        if (mongoose.connection.readyState === 1) {
            try {
                if (mongoose.Types.ObjectId.isValid(targetConversationId)) {
                    await Conversation.findByIdAndUpdate(targetConversationId, {
                        lastMessage: { text: image ? "📷 Image" : text, senderId },
                        updatedAt: Date.now(),
                    });
                } else {
                    await Conversation.findOneAndUpdate(
                        { _id: targetConversationId },
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
        }

        let conv = null;
        if (mongoose.connection.readyState === 1) {
            try {
                if (mongoose.Types.ObjectId.isValid(targetConversationId)) {
                    conv = await Conversation.findById(targetConversationId).lean();
                } else {
                    conv = await Conversation.findOne({ _id: targetConversationId }).lean();
                }
            } catch (err) {
                console.warn("Could not find conversation for payload enrichment, checking mock memory fallback:", err.message);
            }
        }

        // --- Mock Memory & Temporary Format Fallback ---
        if (!conv) {
            const fallbackConvs = [
                { _id: "conv-onyx", members: ["me", "bot-onyx"] },
                { _id: "conv-luna", members: ["me", "bot-luna"] },
                { _id: "conv-kaelen", members: ["me", "user-kaelen"] },
                { _id: "user-kaelen", members: ["me", "user-kaelen"] },
                { _id: "conv-sasha", members: ["me", "user-sasha"] },
                { _id: "user-sasha", members: ["me", "user-sasha"] }
            ];
            conv = fallbackConvs.find(c => c._id === targetConversationId);
            
            // Generate clean dynamic pairing support for cross-session switching 
            if (!conv && targetConversationId) {
                let partnerId = targetConversationId.replace(/^conv-temp-|^conv-/, '');
                if (partnerId === 'kaelen' || partnerId === 'user-kaelen') partnerId = 'user-kaelen';
                if (partnerId === 'sasha' || partnerId === 'user-sasha') partnerId = 'user-sasha';
                if (partnerId === 'onyx' || partnerId === 'bot-onyx') partnerId = 'bot-onyx';
                if (partnerId === 'luna' || partnerId === 'bot-luna') partnerId = 'bot-luna';

                conv = {
                    _id: targetConversationId,
                    members: [senderId, partnerId]
                };
            }
        }

        const io = req.app.get("io");
        const activeUsersMap = req.app.get("activeUsers");

        const payload = {
            conversationId: targetConversationId,
            message: newMessage,
            conversation: conv
        };

        if (io) {
            // Broadcast payload to targeted rooms
            io.to(targetConversationId).emit("receiveMessage", payload);
            io.to(conversationId).emit("receiveMessage", payload);

            // Emit directly to other user's and sender's personal rooms to ensure reliable multi-user and multi-device delivery
            try {
                let otherId = null;
                if (conv && conv.members) {
                    otherId = conv.members.find(m => m.toString() !== senderId);
                }

                if (otherId) {
                    const cleanOtherId = otherId.toString().replace(/^conv-temp-|^conv-/, '');
                    const cleanSenderId = senderId.replace(/^conv-temp-|^conv-/, '');
                    
                    // Dispatch to recipient rooms
                    io.to(cleanOtherId).to(otherId.toString()).emit("receiveMessage", payload);
                    // Dispatch to sender rooms for multi-device sync (e.g. phone to laptop)
                    io.to(cleanSenderId).to(senderId).emit("receiveMessage", payload);
                    
                    console.log(`📡 [EMIT] Sockets dispatched receiveMessage directly to rooms: destination[${cleanOtherId}, ${otherId.toString()}], source[${cleanSenderId}, ${senderId}]`);
                }
            } catch (socketErr) {
                console.warn("Socket opponent lookup failed: ", socketErr.message);
            }
        }

        res.status(201).json(newMessage);

        // --- Bot/AI Auto-Response triggers ---
        try {
            let otherId = null;
            let conv = null;
            if (mongoose.connection.readyState === 1) {
                try {
                    if (mongoose.Types.ObjectId.isValid(conversationId)) {
                        conv = await Conversation.findById(conversationId).lean();
                    } else {
                        conv = await Conversation.findOne({ _id: conversationId }).lean();
                    }
                } catch (convErr) {}
            }

            // Fallback lookup if DB is unready or conversation is not found in DB
            if (!conv) {
                const fallbackConvs = [
                    { _id: "conv-onyx", members: ["me", "bot-onyx"] },
                    { _id: "conv-luna", members: ["me", "bot-luna"] },
                    { _id: "conv-kaelen", members: ["me", "user-kaelen"] }
                ];
                conv = fallbackConvs.find(c => c._id === conversationId);
                
                // If still not resolved, and conversationId is formatted like conv-temp-{userId}
                if (!conv && conversationId && conversationId.startsWith("conv-temp-")) {
                    const partnerId = conversationId.replace("conv-temp-", "");
                    conv = {
                        _id: conversationId,
                        members: [senderId, partnerId]
                    };
                }
            }

            if (conv && conv.members) {
                otherId = conv.members.find(m => m.toString() !== senderId);
            }

            if (otherId) {
                const cleanOtherId = otherId.replace(/^conv-temp-|^conv-/, '');
                const isLuna = cleanOtherId === "bot-luna" || otherId === "bot-luna" || otherId === "luna";
                const isOnyx = cleanOtherId === "bot-onyx" || otherId === "bot-onyx" || otherId === "onyx";

                if (isLuna || isOnyx) {
                    setTimeout(async () => {
                        let aiResponseText = "";
                        if (isLuna) {
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
                                    let dbMsgs = [];
                                    if (mongoose.connection.readyState === 1) {
                                        try {
                                            dbMsgs = await Message.find({ conversationId })
                                                .sort({ createdAt: -1 })
                                                .limit(6)
                                                .lean();
                                        } catch (e) {}
                                    }

                                    const sorted = dbMsgs.reverse();
                                    const contents = sorted.map(m => ({
                                        role: m.senderId === senderId ? 'user' : 'model',
                                        parts: [{ text: m.text }]
                                    }));

                                    if (contents.length === 0) {
                                        contents.push({ role: 'user', parts: [{ text: text || "Query" }] });
                                    }

                                    const response = await ai.models.generateContent({
                                        model: "gemini-3.5-flash",
                                        contents: contents,
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

                        let botMessage = null;
                        if (mongoose.connection.readyState === 1) {
                            try {
                                const tempBotMsg = new Message({
                                    conversationId,
                                    senderId: otherId,
                                    text: aiResponseText,
                                });
                                botMessage = await tempBotMsg.save();
                            } catch (e) {}
                        }

                        if (!botMessage) {
                            botMessage = {
                                _id: "msg-bot-temp-" + Date.now(),
                                conversationId,
                                senderId: otherId,
                                text: aiResponseText,
                                createdAt: new Date()
                            };
                        }

                        if (mongoose.connection.readyState === 1) {
                            try {
                                if (mongoose.Types.ObjectId.isValid(conversationId)) {
                                    await Conversation.findByIdAndUpdate(conversationId, {
                                        lastMessage: { text: aiResponseText, senderId: otherId },
                                        updatedAt: new Date()
                                    });
                                } else {
                                    await Conversation.findOneAndUpdate(
                                        { _id: conversationId },
                                        {
                                            lastMessage: { text: aiResponseText, senderId: otherId },
                                            updatedAt: new Date()
                                        },
                                        { upsert: false }
                                    );
                                }
                            } catch (e) {}
                        }

                        if (io) {
                            const botPayload = {
                                conversationId,
                                message: botMessage
                            };

                            io.to(conversationId).emit("receiveMessage", botPayload);
                            
                            // Emit directly to the user's personal rooms to ensure they receive it immediately
                            const cleanSenderId = senderId.replace(/^conv-temp-|^conv-/, '');
                            io.to(cleanSenderId).to(senderId).emit("receiveMessage", botPayload);
                            console.log(`🤖 [BOT EMIT] Dispatched response directly to rooms: ${cleanSenderId}, ${senderId}`);
                        }
                    }, 1200);
                }
            }
        } catch (botErr) {
            console.error("Bot auto-response execution failed:", botErr.message);
        }

    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ error: "মেসেজ পাঠানো সম্ভব হয়নি" });
    }
});

// 5. Get Chat History (সংশোধিত রাউট)
router.get("/history/:conversationId", protect, async (req, res) => {
    try {
        const { conversationId } = req.params;
        
        if (!conversationId || conversationId === "null" || conversationId === "undefined") {
            return res.status(200).json([]);
        }
        
        const senderId = (req.user._id || req.user.id || "me").toString();
        
        // আইডি প্রিফিক্স ক্লিন করা (যেমন: conv-temp-onyx -> onyx)
        const cleanId = conversationId.replace(/^conv-temp-|^conv-/, '');

        let queryConvId = conversationId;
        // বোট আইডি বা কাস্টম আইডি চেক (যেগুলো মঙ্গোডিবি আইডি নয়)
        const isBotOrCustom = [
            'onyx', 'luna', 'kaelen', 'sasha', 
            'bot-onyx', 'bot-luna', 'user-kaelen', 'user-sasha', 
            'zephyr', 'oracle'
        ].includes(cleanId) || 
        cleanId.startsWith('bot-') || 
        cleanId.startsWith('user-') ||
        !mongoose.Types.ObjectId.isValid(cleanId);

        let isAlreadyConversation = false;
        if (mongoose.connection.readyState === 1 && !isBotOrCustom && mongoose.Types.ObjectId.isValid(cleanId)) {
            try {
                const existingConv = await Conversation.exists({ _id: cleanId });
                if (existingConv) {
                    isAlreadyConversation = true;
                }
            } catch (err) {
                console.warn("Error checking existing conversation for history:", err.message);
            }
        }

        if (mongoose.connection.readyState === 1 && cleanId && !isBotOrCustom && !isAlreadyConversation && mongoose.Types.ObjectId.isValid(cleanId)) {
            try {
                const conv = await Conversation.findOne({
                    members: { $all: [senderId, cleanId] }
                });
                if (conv) {
                    queryConvId = conv._id.toString();
                }
            } catch (err) {
                console.warn("Resolving conversation history redirection failed:", err.message);
            }
        }

        // Search messages from MongoDB matching either cleanId or raw conversationId
        let messages = [];
        if (mongoose.connection.readyState === 1) {
            try {
                messages = await Message.find({
                    $or: [
                        { conversationId: queryConvId },
                        { conversationId: cleanId },
                        { conversationId: conversationId }
                    ]
                }).sort({ createdAt: 1 }).lean();
            } catch (dbErr) {
                console.warn("MongoDB fetch history failed, using fallback:", dbErr.message);
            }
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
