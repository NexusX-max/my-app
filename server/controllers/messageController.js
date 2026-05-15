import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendNotification } from '../utils/notificationHelper.js';
// Gemini AI Setup (Ensure API Key is in .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 🤖 AI AUTO REPLY LOGIC
 */
export const handleAiAutoReply = async (receiverId, senderName, messageText) => {
  try {
    const user = await User.findOne({ auth0Id: receiverId });
    
    // Check if user exists and has AI Autopilot enabled
    if (user && user.isAiAutopilotActive) {
       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
       const prompt = `You are ${user.name}'s AI assistant. ${senderName} sent a message: "${messageText}". 
       Reply in a short, cyberpunk style, maximum 20 words.`;

       const result = await model.generateContent(prompt);
       return result.response.text();
    }
    return null;
  } catch (error) {
    console.error("AI Auto-Reply Error:", error);
    return null;
  }
};

/**
 * 🚀 CREATE NEW MESSAGE
 */
export const createMessage = async (req, res) => {
  const { 
    conversationId, 
    senderId, 
    senderName, 
    senderAvatar, 
    text, 
    tempId, 
    isSelfDestruct,
    media,
    mediaType 
  } = req.body;

  try {
    // ১. সেলফ-ডিস্ট্রাক্ট লজিক
    let expireAt = null;
    if (isSelfDestruct) {
      expireAt = new Date(Date.now() + 15 * 1000); // ১৫ সেকেন্ড পর ডিলিট হবে
    }

    const newMessage = new Message({
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      text,
      tempId,
      media,
      mediaType: mediaType || "text",
      isSelfDestruct,
      expireAt 
    });

    const savedMessage = await newMessage.save();

    // ২. কনভারসেশনের 'lastMessage' আপডেট করা
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { 
        lastMessage: text || "Sent a media file",
        updatedAt: Date.now() 
      }
    });

    res.status(200).json(savedMessage);
  } catch (err) {
    console.error("Message Send Error:", err);
    res.status(500).json({ error: "Could not send message signal.", details: err.message });
  }
};

/**
 * 📥 GET MESSAGES (History)
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId) return res.status(400).json({ error: "Conversation ID required" });

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean(); // Performance boost

    res.status(200).json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ error: "Failed to sync history." });
  }
};

/**
 * 🗂️ GET ALL CONVERSATIONS (For a specific user)
 * আপনার কনসোলের 500 error ফিক্স করার জন্য এটি যোগ করা হয়েছে
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id; // From Auth middleware
    const conversations = await Conversation.find({
      members: { $in: [userId] }
    }).sort({ updatedAt: -1 });

    res.status(200).json(conversations || []);
  } catch (err) {
    console.error("Conversation Fetch Error:", err);
    res.status(500).json({ error: "Could not load conversations." });
  }
};

/**
 * 👀 MARK AS SEEN
 */
export const markMessageSeen = async (req, res) => {
  try {
    const { messageId, userId } = req.body;
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { seenBy: { userId, seenAt: Date.now() } }
      },
      { new: true }
    );
    res.status(200).json(updatedMessage);
  } catch (err) {
    res.status(500).json({ error: "Mark seen failed." });
  }
};

/**
 * 🗑️ DELETE MESSAGE (Manual)
 */
export const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.messageId);
    res.status(200).json({ message: "Message deleted from reality." });
  } catch (err) {
    res.status(500).json({ error: "De-synthesis failed." });
  }
};