import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { 
  createPost, 
  likePost, 
  getReels, 
  addComment, 
  updateReelPulse,
  getNeuralFeed 
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================
    ☁️ Cloudinary Configuration (Neural Storage)
========================================================== */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.includes("video");
    return {
      folder: "onyx_posts",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: ["jpg", "png", "mp4", "mov", "webm"],
      transformation: isVideo ? [{ quality: "auto" }] : [{ width: 1080, quality: "auto" }]
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // ১০০ এমবি লিমিট (AI/Video কন্টেন্টের জন্য বাড়ানো হয়েছে)
});

/* ==========================================================
    🛰️ Neural Transmission Routes (Post & Feed)
========================================================== */

/**
 * @route   POST /api/posts/create
 * @desc    Create a new post (Neural Drift) with optional media
 */
router.post('/create', protect, upload.single('media'), createPost);

/**
 * @route   GET /api/posts/neural-feed
 * @desc    Main feed based on user's active mode
 */
router.get('/neural-feed', protect, getNeuralFeed);

/**
 * @route   POST /api/posts/:id/like
 * @desc    Toggle energy (like) on a post
 */
router.post('/:id/like', protect, likePost);

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add a neural response (comment)
 */
router.post('/:id/comment', protect, addComment);


/* ==========================================================
    📺 Reels & High-Frequency Interaction
========================================================== */

/**
 * @route   GET /api/posts/reels
 * @desc    Fetch vertical video reels
 */
router.get('/reels', protect, getReels);

/**
 * @route   PATCH /api/posts/:id/pulse
 * @desc    Update reel engagement pulse (View tracking)
 */
router.patch('/:id/pulse', protect, updateReelPulse);

export default router;