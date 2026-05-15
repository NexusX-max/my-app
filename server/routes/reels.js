import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Post from "../models/Post.js"; 
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
    ☁️ Cloudinary Storage Configuration
========================================================== */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "onyx_reels",
    resource_type: "video", 
    allowed_formats: ["mp4", "mov", "webm", "quicktime"],
  },
});
const upload = multer({ storage });

/* ==========================================================
    📺 GET ALL REELS (Route: GET /api/reels)
========================================================== */
router.get("/", async (req, res) => {
  try {
    const reels = await Post.find({ mediaType: "video" })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("author", "fullName avatar username isVerified") 
      .lean();
    
    if (!reels || reels.length === 0) {
      return res.status(200).json([]);
    }

    // ফ্রন্টএন্ডের জন্য ডাটা ম্যাপ করা (সংশোধিত অংশ)
    const formattedReels = reels.map(reel => ({
      _id: reel._id,
      videoUrl: reel.mediaUrl || "", 
      
      // এই অংশটুকু ফিক্স করা হয়েছে যাতে ফ্রন্টএন্ডে আইডি এবং নাম পাওয়া যায়
      author: {
        _id: reel.author?._id,
        fullName: reel.author?.fullName || "Onyx Drifter",
        avatar: reel.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel._id}`,
        username: reel.author?.username || "drifter",
        isVerified: reel.author?.isVerified || false
      },

      // সরাসরি ব্যবহারের সুবিধার্থে নিচের ফিল্ডগুলো রাখা হলো
      username: reel.author?.fullName || "Onyx Drifter",
      userAvatar: reel.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel._id}`,
      
      caption: reel.text || "",
      likesCount: Array.isArray(reel.likes) ? reel.likes.length : 0,
      
      // লাইক স্টেট চেক
      likedByMe: req.user ? reel.likes.some(id => id.toString() === req.user._id.toString()) : false,
      
      commentsCount: Array.isArray(reel.comments) ? reel.comments.length : 0,
      audioName: "Onyx Neural Signal",
      createdAt: reel.createdAt
    }));

    res.status(200).json(formattedReels);
  } catch (err) {
    console.error("🔥 Fetch Error:", err.message);
    res.status(500).json({ error: "Neural Link Offline" });
  }
});

/* ==========================================================
    🚀 UPLOAD REEL (Route: POST /api/reels/upload)
========================================================== */
router.post("/upload", protect, upload.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No video provided" });

    const newReel = new Post({
      author: req.user._id, 
      text: req.body.caption || "",
      mediaUrl: req.file.path,
      mediaType: "video",
      likes: [],
      comments: []
    });

    await newReel.save();
    res.status(201).json({ msg: "Reel Sync Complete", data: newReel });
  } catch (err) {
    console.error("🔥 Upload Error:", err.message);
    res.status(500).json({ error: "Upload Failed" });
  }
});

/* ==========================================================
    ❤️ LIKE REEL (Route: POST /api/reels/:id/like)
========================================================== */
router.post("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Neural Post Not Found" });

    const userId = req.user._id.toString();
    const isLiked = post.likes.some(id => id.toString() === userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ 
      likes: post.likes.length, 
      isLiked: !isLiked 
    });
  } catch (err) {
    console.error("🔥 Like Error:", err.message);
    res.status(500).json({ msg: "Interaction Sync Error" });
  }
});

/* ==========================================================
    💬 COMMENT ON REEL (Route: POST /api/reels/:id/comment)
========================================================== */
router.post("/:id/comment", protect, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ msg: "Comment text required" });
  
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ msg: "Post Not Found" });
  
      const newComment = {
        user: req.user._id,
        text,
        createdAt: new Date()
      };
  
      post.comments.unshift(newComment);
      await post.save();
  
      res.status(201).json({ msg: "Comment added", commentsCount: post.comments.length });
    } catch (err) {
      res.status(500).json({ msg: "Comment Sync Error" });
    }
  });

export default router;