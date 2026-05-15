import Post from '../models/Post.js'; 
import User from '../models/User.js'; 
import { redisClient } from '../config/db.js';
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import dotenv from "dotenv";
import { sendNotification } from '../utils/notificationHelper.js';
dotenv.config();

/* ==========================================================
    ⚙️ CLOUDINARY CONFIGURATION
========================================================== */
cloudinary.config({
    cloud_name: 'dx0cf0ggu',
    api_key: '878323969996593',
    api_secret: 'Bzn7iQULbokfR8cD_5pUyN_zpDs'
});

// Multer Memory Storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

/* ==========================================================
    🚀 ১. CREATE POST (MongoDB Version)
========================================================== */
export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const authorId = req.user.id; 
        let mediaUrl = "";
        let mediaType = "text";

        if (req.file) {
            const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const uploadRes = await cloudinary.uploader.upload(fileBase64, {
                folder: 'onyx_drift_posts',
                resource_type: "auto"
            });
            mediaUrl = uploadRes.secure_url;
            mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
        }

        const newPost = new Post({
            user: authorId,
            text: text || "",
            mediaUrl,
            mediaType,
            likes: [], 
            views: 0
        });

        const savedPost = await newPost.save();

        // ক্যাশ ক্লিয়ার করা
        try { await redisClient.del('neural_feed'); } catch (e) {}
        
        res.status(201).json(savedPost);
    } catch (err) {
        console.error("Post Creation Error:", err);
        res.status(500).json({ msg: "Neural Breakdown on Cloud Sync." });
    }
};

/* ==========================================================
    🧠 ২. NEURAL FEED (MongoDB with Populate)
========================================================== */
export const getNeuralFeed = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const posts = await Post.find()
            .populate('user', 'fullName profilePic username firstName lastName avatar') 
            .sort({ createdAt: -1 })
            .limit(50);

        const formattedPosts = posts.map(post => {
            const p = post.toObject();
            return {
                ...p,
                _id: p._id,
                authorId: p.user?._id,
                authorName: p.user?.fullName || `${p.user?.firstName || ''} ${p.user?.lastName || ''}`.trim() || "Onyx Drifter",
                authorAvatar: p.user?.profilePic || p.user?.avatar,
                authorUsername: p.user?.username || "drifter",
                likesCount: p.likes ? p.likes.length : 0,
                isLiked: p.likes ? p.likes.some(id => id.toString() === userId) : false
            };
        });

        res.json(formattedPosts);
    } catch (err) {
        console.error("Feed Error:", err);
        res.status(500).json({ msg: "Neural Grid Offline" });
    }
};
/* ==========================================================
    🎬 ৩. REELS FETCHING (Fixed for OnyxDrift)
========================================================== */
export const getReels = async (req, res) => {
    try {
        const reels = await Post.find({ mediaType: 'video' })
            .populate({
                path: 'user',        // 'author' এর বদলে 'user' কারণ স্কিমাতে এটাই আছে
                select: 'fullName profilePic username firstName lastName avatar', 
                model: 'User'
            })
            .sort({ createdAt: -1 })
            .limit(20);
            
        const formattedReels = reels.map(reel => {
            const r = reel.toObject();
            return {
                ...r,
                // ফ্রন্টএন্ডে যাতে কোনোভাবেই আইডি মিস না হয়
                author: r.user 
            };
        });
            
        res.status(200).json(formattedReels);
    } catch (err) {
        console.error("Reels Error:", err);
        res.status(500).json({ msg: "Reels fetch failed" });
    }
};
/* ==========================================================
    ⚡ ৪. LIKE/UNLIKE (Notification Added)
========================================================= */
export const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        const index = post.likes.indexOf(userId);
        let liked = false;

        if (index === -1) {
            // লাইক করা হলো
            post.likes.push(userId);
            liked = true;

            // 🔔 নোটিফিকেশন ট্রিগার (পোস্টের মালিককে জানানো)
            // নোট: নিজের পোস্টে লাইক দিলে নোটিফিকেশন যাবে না (হেল্পার ফাংশন এটা হ্যান্ডেল করবে)
            await sendNotification(
                post.user,         // প্রাপক (পোস্টের মালিক)
                userId,            // প্রেরক (যে লাইক দিলো)
                'like',            // টাইপ
                post._id,          // পোস্ট আইডি
                'liked your neural spark' // মেসেজ
            );
        } else {
            // আনলাইক করা হলো
            post.likes.splice(index, 1);
            liked = false;
        }

        await post.save();
        
        try { await redisClient.del('neural_feed'); } catch (e) {}

        res.status(200).json({ 
            message: liked ? "Pulse Charged" : "Pulse Drained",
            liked, 
            likesCount: post.likes.length 
        });
    } catch (err) {
        console.error("Like Error:", err);
        res.status(500).json({ msg: "Pulse Update Failed" });
    }
};

/* ==========================================================
    📊 ৫. VIEW UPDATE
========================================================== */
export const updateReelPulse = async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("View Update Error:", err);
        res.status(500).json({ error: "Pulse sync failed" });
    }
};