import express from 'express';
import User from '../models/User.js'; 
import auth from '../middleware/auth.js'; 
import upload from '../middleware/multer.js'; 
import Post from '../models/Post.js'; 
import mongoose from 'mongoose';

const router = express.Router();

/* ==========================================================
    1️⃣ GET USER BY ID (MongoDB ID Based)
========================================================== */
router.get('/:id', auth, async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.id);

    // ১. আইডি ভ্যালিডেশন
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ msg: "Invalid Neural ID format" });
    }

    // ২. সরাসরি মঙ্গো আইডি দিয়ে ইউজার খোঁজা
    const user = await User.findById(targetId).select("-password -__v").lean();
    
    if (!user) {
      return res.status(404).json({ msg: "Drifter not found in neural grid" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("📡 Profile Fetch Error:", err);
    res.status(500).json({ msg: "Neural link interrupted" });
  }
});

/* ==========================================================
    2️⃣ GET POSTS BY USER ID
========================================================== */
router.get("/posts/user/:userId", auth, async (req, res) => {
  try {
    const targetUserId = decodeURIComponent(req.params.userId);

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ msg: "Invalid User ID" });
    }
    
    // শুধু author ফিল্ড চেক করলেই হবে (যেখানে মঙ্গো আইডি সেভ থাকে)
    const posts = await Post.find({ author: targetUserId })
      .populate("author", "name nickname avatar firstName lastName profilePic username") 
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts || []);
  } catch (err) {
    console.error("📡 User Posts Error:", err);
    res.status(500).json({ msg: "Error fetching user signals" });
  }
});

/* ==========================================================
    3️⃣ UPDATE PROFILE
========================================================== */
router.put("/update-profile", auth, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, name, bio, location, workplace, avatar: bodyAvatar } = req.body;
    const myId = req.user.id; // তোমার নিজস্ব JWT auth মিডলওয়্যার থেকে আসা আইডি

    let updateFields = {};
    if (name) updateFields.name = name;
    if (nickname) updateFields.nickname = nickname;
    if (bio) updateFields.bio = bio;
    if (location) updateFields.location = location;
    if (workplace) updateFields.workplace = workplace;
    if (bodyAvatar) updateFields.avatar = bodyAvatar;

    if (req.files) {
      if (req.files.avatar) updateFields.avatar = req.files.avatar[0].path;
      if (req.files.cover) updateFields.coverImg = req.files.cover[0].path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      myId, 
      { $set: updateFields },
      { new: true, lean: true }
    );

    if (!updatedUser) return res.status(404).json({ msg: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error("📡 Update Error:", err);
    res.status(500).json({ msg: 'Identity Sync Failed' });
  }
});

/* ==========================================================
    4️⃣ SEARCH & DISCOVERY
========================================================== */
router.get("/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    const myId = req.user.id;
    
    let filter = { _id: { $ne: myId } }; // নিজেকে বাদ দিয়ে

    if (query && query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      filter.$or = [
        { name: { $regex: searchRegex } },
        { nickname: { $regex: searchRegex } },
        { username: { $regex: searchRegex } }
      ];
    }

    const users = await User.find(filter)
      .select("name nickname avatar neuralRank username")
      .limit(10)
      .lean();
      
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Search signal lost" });
  }
});

router.get("/all", auth, async (req, res) => {
  try {
    const myId = req.user.id;
    const users = await User.find({ _id: { $ne: myId } })
      .select("name nickname avatar bio isVerified username")
      .sort({ createdAt: -1 })
      .limit(20).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Discovery signal lost" });
  }
});

/* ==========================================================
    5️⃣ FOLLOW / UNFOLLOW SYSTEM
========================================================== */
router.post("/follow/:targetId", auth, async (req, res) => {
  try {
    const myId = req.user.id; 
    const targetId = req.params.targetId;

    if (myId === targetId) return res.status(400).json({ msg: "Neural Loop detected." });

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ msg: "Invalid Target ID" });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ msg: "Target drifter not found" });

    const isFollowing = targetUser.followers && targetUser.followers.includes(myId);

    if (isFollowing) {
      // Unfollow
      await Promise.all([
        User.findByIdAndUpdate(myId, { $pull: { following: targetId } }),
        User.findByIdAndUpdate(targetId, { $pull: { followers: myId } })
      ]);
      return res.json({ followed: false, msg: "Unlinked" });
    } else {
      // Follow
      await Promise.all([
        User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } }),
        User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } })
      ]);
      return res.json({ followed: true, msg: "Linked" });
    }
  } catch (err) {
    console.error("📡 Follow Error:", err);
    res.status(500).json({ msg: "Connection failed" });
  }
});

export default router;