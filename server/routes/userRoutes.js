import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js'; 
import Post from '../models/Post.js'; 
import User from '../models/User.js';
import { createPost } from '../controllers/postController.js';
import mongoose from 'mongoose';

const router = express.Router();

/* ==========================================================
    ⚙️ MULTER CONFIGURATION
========================================================== */
const storage = multer.diskStorage({});
const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 } 
});

/* ==========================================================
    🚀 STATIC & SPECIFIC ROUTES (এগুলো সবসময় উপরে থাকবে)
========================================================== */

// ১. নিজের প্রোফাইল ডাটা (MyProfile)
router.get('/profile/me', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "Drifter profile not found." });
    
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ user, posts });
  } catch (err) {
    res.status(500).json({ message: "Neural Link Error" });
  }
});

// ২. ড্রিপ্টার সার্চ
router.get('/search', protect, async (req, res) => {
  try {
    const searchQuery = req.query.query || req.query.q;
    if (!searchQuery || searchQuery.trim() === "") return res.json([]);

    const searchRegex = new RegExp(`${searchQuery.trim()}`, "i");
    const myId = req.user.id || req.user._id;

    const users = await User.find({
      _id: { $ne: myId }, 
      $or: [
        { firstName: { $regex: searchRegex } },
        { lastName: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { nickname: { $regex: searchRegex } },
        { username: { $regex: searchRegex } }
      ]
    })
    .select("name firstName lastName nickname avatar bio neuralImpact")
    .limit(12)
    .lean();
    
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Search signal lost" });
  }
});

// ৩. রিলস ডাটা
router.get('/reels/all', async (req, res) => {
    try {
        const reels = await Post.find({ 
            $or: [{ mediaType: 'reel' }, { mediaType: 'video' }] 
        })
        .sort({ createdAt: -1 })
        .populate("author", "name firstName lastName nickname avatar")
        .lean();
        
        res.status(200).json(reels || []);
    } catch (err) {
        res.status(400).json({ message: "Failed to fetch reels" });
    }
});

// ৪. ইউজার ডাটা সিঙ্ক (Handshake)
router.post('/sync', protect, async (req, res) => {
  try {
    const { name, email, avatar, username } = req.body;
    const userId = req.user.id || req.user._id;

    const user = await User.findByIdAndUpdate(
      userId, 
      { 
        $set: { 
          email: email,
          avatar: avatar,
          nickname: username?.replace(/\s+/g, '').toLowerCase()
        },
        $setOnInsert: {
          name: name,
          neuralImpact: 0
        }
      },
      { upsert: true, new: true } 
    );

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Identity sync failed" });
  }
});

// ৫. প্রোফাইল আপডেট
router.put('/profile/update', protect, async (req, res) => {
  try {
    const { firstName, lastName, nickname, bio, avatar, coverImg, location } = req.body;
    const userId = req.user.id || req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          firstName, 
          lastName,
          nickname: nickname?.replace(/\s+/g, '').toLowerCase(),
          bio,
          avatar,
          coverImg,
          location
        } 
      },
      { new: true }
    );

    res.status(200).json({ success: true, user: updatedUser, msg: "Identity Secured." });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update identity" });
  }
});

/* ==========================================================
    👤 DYNAMIC ROUTES (এগুলো সবসময় নিচে থাকবে)
========================================================== */

/**
 * ৬. পাবলিক প্রোফাইল দেখা
 */
router.get('/profile/:userId', protect, async (req, res) => {
  try {
    const rawId = req.params.userId.replace(/^:/, '').trim();

    if (!mongoose.Types.ObjectId.isValid(rawId)) {
        return res.status(400).json({ message: "Invalid Neural ID format" });
    }

    const user = await User.findById(rawId).select("-password").lean();

    if (!user) {
        return res.status(404).json({ message: "Drifter not found in matrix" });
    }

    const posts = await Post.find({ author: rawId })
      .sort({ createdAt: -1 })
      .populate("author", "name firstName lastName nickname avatar")
      .lean();

    res.status(200).json({ user, posts });
  } catch (err) {
    console.error("Public Profile Error:", err);
    res.status(500).json({ message: "Neural Link Synchronization Error" });
  }
});

/**
 * ৭. ফলো সিস্টেম
 */
router.post("/follow/:targetId", protect, async (req, res) => {
  try {
    const myId = (req.user.id || req.user._id).toString();
    const targetId = req.params.targetId.replace(/^:/, '').trim();

    if (myId === targetId) return res.status(400).json({ msg: "Self-link forbidden" });
    if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ msg: "Invalid Target" });

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    // ফলো চেক (ID গুলোকে স্ট্রিং এ কনভার্ট করে চেক করা নিরাপদ)
    const isFollowing = targetUser.followers?.some(followerId => followerId.toString() === myId);

    if (isFollowing) {
      // আনফলো
      await User.findByIdAndUpdate(myId, { $pull: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $pull: { followers: myId }, $inc: { neuralImpact: -5 } });
      res.json({ followed: false, message: "Connection Severed" });
    } else {
      // ফলো
      await User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } });
      await User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId }, $inc: { neuralImpact: 10 } });
      res.json({ followed: true, message: "Neural Link Established" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Connection failed" });
  }
});

/**
 * ৮. পোস্ট তৈরি
 */
router.post('/create', protect, upload.single('file'), createPost);

export default router;