import express from 'express';
import multer from 'multer';
import * as Minio from 'minio';
import User from '../models/User.js'; 
import Post from '../models/Post.js'; 
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

dotenv.config();
const router = express.Router();

/* ==========================================================
    📦 MINIO CONFIGURATION (The Neural Storage)
========================================================== */
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
  secretKey: process.env.MINIO_SECRET_KEY || '62146214'
});

const bucketName = process.env.MINIO_BUCKET || 'onyxdrift-media';

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } 
});

/* ==========================================================
    🧠 HELPER: GET USER ID FROM JWT
========================================================== */
const getUserId = (req) => req.user?._id || req.user?.id;

/* ==========================================================
    1️⃣ SEARCH DRIFTERS (Neural Search)
========================================================== */
router.get("/search", protect, async (req, res) => {
  try {
    const queryTerm = req.query.q || "";
    const currentUserId = getUserId(req);

    let dbQuery = { _id: { $ne: currentUserId } }; 

    if (queryTerm.trim() !== "") {
      const searchRegex = new RegExp(queryTerm.trim(), "i");
      dbQuery.$or = [
        { name: { $regex: searchRegex } },
        { nickname: { $regex: searchRegex } },
        { username: { $regex: searchRegex } }
      ];
    }

    const users = await User.find(dbQuery)
      .select("name nickname avatar bio isVerified neuralRank drifterLevel username")
      .limit(20)
      .lean();

    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json(users || []);
  } catch (err) {
    console.error("❌ Search Error:", err);
    return res.status(500).json({ msg: "Search signal lost" });
  }
});

/* ==========================================================
    2️⃣ GET PROFILE BY ID (Neural Identity Scanner)
========================================================== */
// @route   GET /api/user/profile/:id
// @desc    Get user profile and posts by ID
router.get(['/profile/:id', '/:id'], protect, async (req, res) => {
  try {
    // আইডি থেকে কোলন রিমুভ করা (ফ্রন্টএন্ড সেফটি)
    const targetId = req.params.id.replace(/^:/, '').trim();
    
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ msg: "Invalid Neural ID format" });
    }

    // ইউজার ডাটা খোঁজা
    const user = await User.findById(targetId).select("-password -__v").lean();
    if (!user) return res.status(404).json({ msg: "Drifter not found in Matrix" });

    // ওই ইউজারের পোস্টগুলো খোঁজা
    const posts = await Post.find({ author: targetId })
      .sort({ createdAt: -1 })
      .populate("author", "name nickname avatar")
      .lean();
    
    // ইউজার এবং পোস্ট একসাথে পাঠানো হচ্ছে
    res.json({ user, posts: posts || [] });
  } catch (err) {
    console.error("🚨 Profile Fetch Error:", err.message);
    res.status(500).json({ msg: "Neural link interrupted", error: err.message });
  }
});

/* ==========================================================
    3️⃣ UPDATE PROFILE (MinIO Integration)
========================================================== */
router.put("/update-profile", protect, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nickname, name, bio, location, workplace } = req.body;
    const userId = getUserId(req);

    if (!userId) return res.status(401).json({ msg: "Identity unknown" });

    let updateFields = { name, nickname, bio, location, workplace };

    const uploadToMinio = async (file, folder) => {
      const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
      await minioClient.putObject(
        bucketName,
        fileName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );
      const host = process.env.MINIO_EXTERNAL_URL || 'http://127.0.0.1:9000';
      return `${host}/${bucketName}/${fileName}`;
    };

    if (req.files?.avatar) {
      updateFields.avatar = await uploadToMinio(req.files.avatar[0], 'avatars');
    }
    if (req.files?.cover) {
      updateFields.coverImg = await uploadToMinio(req.files.cover[0], 'covers');
    }

    Object.keys(updateFields).forEach(key => 
      (updateFields[key] === undefined || updateFields[key] === "") && delete updateFields[key]
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: updateFields },
      { new: true, lean: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ msg: 'Identity Sync Failed' });
  }
});

/* ==========================================================
    4️⃣ FOLLOW SYSTEM
========================================================== */
router.post("/follow/:targetId", protect, async (req, res) => {
  try {
    const myId = getUserId(req);
    const targetId = req.params.targetId.replace(/^:/, '').trim();

    if (!myId || myId.toString() === targetId) return res.status(400).json({ msg: "Invalid Neural Link" });

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ msg: 'Target not found' });

    const isFollowing = targetUser.followers?.some(id => id.toString() === myId.toString());

    if (isFollowing) {
      await User.updateOne({ _id: myId }, { $pull: { following: targetId } });
      await User.updateOne({ _id: targetId }, { $pull: { followers: myId }, $inc: { neuralImpact: -5 } });
      return res.json({ followed: false });
    } else {
      await User.updateOne({ _id: myId }, { $addToSet: { following: targetId } });
      await User.updateOne({ _id: targetId }, { $addToSet: { followers: myId }, $inc: { neuralImpact: 10 } });
      return res.json({ followed: true });
    }
  } catch (err) {
    res.status(500).json({ msg: "Connection failed" });
  }
});

/* ==========================================================
    5️⃣ DISCOVERY & TEST
========================================================== */
router.get("/all", protect, async (req, res) => {
  try {
    const myId = getUserId(req);
    const users = await User.find({ _id: { $ne: myId } })
      .select("name nickname avatar bio isVerified neuralRank")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Discovery signal lost" });
  }
});

router.get("/test", (req, res) => res.json({ status: "Onyx Core Active", hardware: "i7 Neural Server" }));

export default router;