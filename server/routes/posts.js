import express from "express";
import Post from "../models/Post.js"; 
import User from "../models/User.js"; // ইউজার মডেল ইমপোর্ট করতে হবে
import { protect } from '../middleware/authMiddleware.js';
import { redisClient } from '../config/db.js';

const router = express.Router();

/* ==========================================================
    👤 ০. GET MY POSTS (For MyProfile.jsx)
========================================================== */
router.get("/me", protect, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id }) 
            .populate("author", "firstName lastName username avatar profilePic")
            .sort({ createdAt: -1 });

        const formattedPosts = posts.map(p => ({
            ...p._doc,
            _id: p._id,
            image: p.mediaUrl || "", 
            content: p.text || "",
            user: p.author, 
            likes: p.likes || [],
            comments: p.comments || [],
            createdAt: p.createdAt
        }));

        res.json(formattedPosts);
    } catch (err) {
        console.error("🛰️ Profile Feed Error:", err);
        res.status(500).json({ msg: "Neural Link Offline" });
    }
});

/* ==========================================================
    🌌 ১. GET USER POSTS (Fix for 404 error)
    ফ্রন্টএন্ডের জন্য নির্দিষ্ট ইউজারের সব পোস্ট পাওয়ার রাউট
========================================================== */
router.get("/user/:userId", protect, async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.userId })
            .populate("author", "firstName lastName username avatar profilePic")
            .sort({ createdAt: -1 });
        
        // যদি কোনো পোস্ট না থাকে তবে খালি অ্যারে পাঠাবে (এরর নয়)
        res.json(posts);
    } catch (err) {
        console.error("🛰️ User Posts Error:", err);
        res.status(500).json({ msg: "Failed to fetch user transmissions" });
    }
});

/* ==========================================================
    🧠 ২. NEURAL FEED (Get all posts)
========================================================== */
router.get("/neural-feed", protect, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "firstName lastName username avatar profilePic") 
            .sort({ createdAt: -1 })
            .limit(50);

        const formattedPosts = posts.map(p => ({
            ...p._doc,
            _id: p._id,
            user: p.author, 
            authorName: p.author ? `${p.author.firstName} ${p.author.lastName || ''}` : "Onyx Drifter",
            authorUsername: p.author?.username || "drifter",
            authorAvatar: p.author?.avatar || p.author?.profilePic || "",
            isLiked: p.likes ? p.likes.includes(req.user.id) : false,
            likesCount: p.likes ? p.likes.length : 0,
            commentsCount: p.comments ? p.comments.length : 0,
            mediaUrl: p.mediaUrl || ""
        }));

        res.json(formattedPosts);
    } catch (err) {
        console.error("🛰️ Feed Error:", err);
        res.status(500).json({ msg: "Neural Grid Offline" });
    }
});

/* ==========================================================
    🚀 ৩. CREATE POST
========================================================== */
router.post("/", protect, async (req, res) => {
    try {
        const { text, mediaUrl, mediaType } = req.body;

        if (!text && !mediaUrl) {
            return res.status(400).json({ msg: "Neural transmission empty!" });
        }

        const newPost = new Post({
            author: req.user.id, 
            text: text || "",
            mediaUrl: mediaUrl || "", 
            mediaType: mediaType || "text",
            views: 0
        });

        const savedPost = await newPost.save();
        const populatedPost = await Post.findById(savedPost._id).populate("author", "firstName lastName username avatar profilePic");

        try { 
            if (redisClient && redisClient.status === 'ready') {
                await redisClient.del('neural_feed'); 
            }
        } catch (e) {}

        res.status(201).json(populatedPost);
    } catch (err) {
        console.error("🔥 Cloud Sync Error:", err);
        res.status(500).json({ msg: "Neural Breakdown.", error: err.message });
    }
});

/* ==========================================================
    🎬 ৪. GET REELS (Video Only)
========================================================== */
router.get("/reels", protect, async (req, res) => {
    try {
        const reels = await Post.find({ mediaType: "video" })
            .populate("author", "firstName lastName username avatar profilePic")
            .sort({ createdAt: -1 })
            .limit(20);

        const formattedReels = reels.map(r => ({
            ...r._doc,
            _id: r._id,
            user: r.author,
            authorName: r.author ? `${r.author.firstName} ${r.author.lastName || ''}` : "Drifter",
            authorAvatar: r.author?.avatar || r.author?.profilePic || "",
            mediaUrl: r.mediaUrl,
            likesCount: r.likes ? r.likes.length : 0,
            isLiked: r.likes ? r.likes.includes(req.user.id) : false,
        }));

        res.json(formattedReels);
    } catch (err) {
        res.status(500).json({ msg: "Reels Offline" });
    }
});

/* ==========================================================
    ❤️ ৫. LIKE/UNLIKE SYSTEM
========================================================== */
router.post("/:id/like", protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        const index = post.likes.indexOf(req.user.id);
        if (index === -1) {
            post.likes.push(req.user.id); 
        } else {
            post.likes.splice(index, 1); 
        }

        await post.save();
        res.json({ 
            success: true, 
            liked: index === -1, 
            likesCount: post.likes.length 
        });
    } catch (err) {
        res.status(500).json({ error: "Heart sync error." });
    }
});

/* ==========================================================
    📊 ৬. UPDATE VIEWS (Pulse)
========================================================== */
router.patch("/:id/pulse", protect, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id, 
            { $inc: { views: 1 } }, 
            { new: true }
        );
        res.json({ success: true, views: post.views });
    } catch (err) {
        res.status(500).json({ error: "Pulse sync failed" });
    }
});
router.get("/:id", protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "firstName lastName username avatar profilePic")
            .populate({
                path: "comments.author",
                select: "firstName lastName username avatar profilePic"
            });

        if (!post) {
            return res.status(404).json({ msg: "Neural Transmission not found" });
        }

        // ফ্রন্টএন্ডের জন্য ডাটা ফরম্যাট করা
        const formattedPost = {
            ...post._doc,
            isLiked: post.likes ? post.likes.includes(req.user.id) : false,
            likesCount: post.likes ? post.likes.length : 0,
            commentsCount: post.comments ? post.comments.length : 0
        };

        res.json(formattedPost);
    } catch (err) {
        console.error("🛰️ Single Post Error:", err);
        res.status(500).json({ msg: "Neural link broken" });
    }
});
/* ==========================================================
    💬 ৭. COMMENT SYSTEM
========================================================== */
router.post("/:id/comment", protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ msg: "Empty comment" });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: "Post not found" });

        const newComment = {
            text,
            author: req.user.id,
            createdAt: new Date()
        };

        post.comments.unshift(newComment); // নতুন কমেন্ট শুরুতে যোগ হবে
        await post.save();

        // নতুন কমেন্টটি অথর ডিটেইলস সহ ফ্রন্টএন্ডে পাঠানোর জন্য পপুলেট করা
        const updatedPost = await Post.findById(post._id).populate({
            path: "comments.author",
            select: "firstName lastName username avatar profilePic"
        });

        res.json(updatedPost.comments[0]);
    } catch (err) {
        res.status(500).json({ error: "Comment transmission failed" });
    }
});
export default router;