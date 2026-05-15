import express from 'express';
import Post from '../models/Post.js'; 
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { sendNotification } from '../utils/notificationHelper.js';

const router = express.Router();

/* ==========================================================
    ১. CONTROLLER FUNCTIONS (প্রোফাইল ও সিস্টেম কন্ট্রোল)
========================================================== */

// --- ✅ প্রোফাইল আপডেট ফাংশন (API Independent) ---
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, nickname, bio, location, avatar, coverImg, skills } = req.body;
    const auth0Id = req.user.sub;

    // এআই এমবেডিং আপাতত স্কিপ করা হচ্ছে (এপিআই এরর এড়াতে)
    // যখন গুগল এপিআই ঠিক হবে, তখন এখানে getEmbeddings আবার চালু করা যাবে।
    
    const updateData = { 
      firstName, 
      lastName, 
      nickname, 
      bio, 
      location, 
      avatar, 
      profilePic: avatar, 
      coverImg, 
      skills: Array.isArray(skills) ? skills : [] // নিশ্চিত করা যেন এটি এরি হয়
    };

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id: auth0Id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ success: true, user: updatedUser, msg: "Neural Identity Updated" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ msg: "Profile Sync Failure" });
  }
};

// --- সিস্টেম কন্ট্রোল ফাংশনস ---
const toggleAutopilot = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.user.sub });
    user.aiAutopilot = !user.aiAutopilot;
    await user.save();
    res.json({ aiAutopilot: user.aiAutopilot, msg: "Neural Autopilot Updated" });
  } catch (err) { res.status(500).json({ msg: "System Sync Failure" }); }
};

const updateAiTone = async (req, res) => {
  try {
    const { tone } = req.body;
    const user = await User.findOneAndUpdate({ auth0Id: req.user.sub }, { aiTone: tone }, { new: true });
    res.json({ aiTone: user.aiTone, msg: "Personality Calibrated" });
  } catch (err) { res.status(500).json({ msg: "Calibration Failure" }); }
};

const toggleGhostMode = async (req, res) => {
  try {
    const user = await User.findOne({ auth0Id: req.user.sub });
    user.ghostMode = !user.ghostMode;
    await user.save();
    res.json({ ghostMode: user.ghostMode, msg: "Ghost Protocol Updated" });
  } catch (err) { res.status(500).json({ msg: "Ghost Protocol Error" }); }
};

/* ==========================================================
    ২. SEARCH ENGINE (Onyx Hybrid Search)
========================================================== */

router.post("/neural-search", auth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Neural input required" });

    // মঙ্গোডিবি টেক্সট সার্চ লজিক (যা এআই-এর মতোই কাজ করবে)
    const results = await User.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } }) // সবথেকে ভালো ম্যাচটি আগে আসবে
    .limit(15)
    .select("username firstName lastName avatar profilePic location skills bio");

    res.json({ 
      success: true, 
      count: results.length,
      results 
    });

  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Search Connection Failure" });
  }
});

/* ==========================================================
    ৩. ROUTES (পাবলিক ও সোশ্যাল গেটওয়ে)
========================================================== */

// প্রোফাইল এবং পোস্ট ডাটা পাওয়া (সংশোধিত রাউট)
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.userId).replace(/^:/, '').trim();
    
    // মঙ্গো আইডি নাকি অথ আইডি তা চেক করা
    const isMongoId = targetId.match(/^[0-9a-fA-F]{24}$/);

    const [user, posts] = await Promise.all([
      User.findOne({ 
        $or: [
          { auth0Id: targetId }, 
          { _id: isMongoId ? targetId : null }
        ] 
      }).lean(),
      Post.find({ 
        $or: [
          { authorAuth0Id: targetId },
          { author: isMongoId ? targetId : null }
        ] 
      })
      .sort({ createdAt: -1 })
      .populate('author', 'firstName lastName avatar nickname')
      .lean()
    ]);

    if (!user) return res.status(404).json({ msg: "Target not found" });

    res.json({ user, posts: posts || [] });
  } catch (err) {
    res.status(500).json({ msg: "Neural Link Synchronization Error" });
  }
});

router.put('/profile/update', auth, updateProfile);

// ফলো/আনফলো টগল
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const targetId = decodeURIComponent(req.params.id).replace(/^:/, '').trim();
    const isMongoId = targetId.match(/^[0-9a-fA-F]{24}$/);

    const [targetUser, currentUser] = await Promise.all([
      User.findOne({ $or: [{ auth0Id: targetId }, { _id: isMongoId ? targetId : null }] }),
      User.findOne({ auth0Id: req.user.sub })
    ]);

    if (!targetUser || !currentUser) return res.status(404).json({ message: "Node not found." });
    if (currentUser.auth0Id === targetUser.auth0Id) return res.status(400).json({ message: "Cannot link own node." });

    const targetIdentifier = targetUser.auth0Id;
    const isFollowing = currentUser.following.includes(targetIdentifier);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id !== targetIdentifier);
      targetUser.followers = targetUser.followers.filter(id => id !== currentUser.auth0Id);
    } else {
      currentUser.following.push(targetIdentifier);
      targetUser.followers.push(currentUser.auth0Id);
      // ফলো নোটিফিকেশন পাঠানো
      await sendNotification(targetUser._id, currentUser._id, 'follow', null, 'started following your drift');
    }

    await Promise.all([currentUser.save(), targetUser.save()]);
    res.status(200).json({ isFollowing: !isFollowing, message: isFollowing ? "Link severed." : "Link established!" });
  } catch (err) { res.status(500).json({ message: "Neural Connection Failure" }); }
});


// সিস্টেম কন্ট্রোল রাুটস
router.post('/autopilot/toggle', auth, toggleAutopilot);
router.put('/tone/update', auth, updateAiTone);
router.post('/ghost/toggle', auth, toggleGhostMode);

export default router;