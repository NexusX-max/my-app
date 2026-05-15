import express from "express";
import User from "../models/User.js";
import upload from "../middleware/multer.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ১. নিজের ডাটা গেট করা (URL: /api/profile/me)
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    
    const data = user.toObject();
    data.followersCount = user.followers?.length || 0;
    data.followingCount = user.following?.length || 0;
    data.isMe = true;
    res.json(data);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ২. প্রোফাইল আপডেট (URL: /api/profile/update)
router.put(
  "/update",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const myId = req.user._id;
      let updateFields = { ...req.body };

      // ফাইল থাকলে পাথ সেভ করা
      if (req.files) {
        if (req.files.avatar) {
          updateFields.avatar = req.files.avatar[0].path.replace(/\\/g, "/"); // Windows path fix
        }
        if (req.files.coverImg) {
          updateFields.coverImg = req.files.coverImg[0].path.replace(/\\/g, "/");
        }
      }

      const user = await User.findByIdAndUpdate(
        myId,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) return res.status(404).json({ msg: "User not found" });

      const data = user.toObject();
      data.followersCount = user.followers?.length || 0;
      data.followingCount = user.following?.length || 0;
      data.isMe = true;

      res.json(data);
    } catch (err) {
      console.error("Update Error:", err);
      res.status(500).json({ msg: "Update failed", error: err.message });
    }
  }
);

export default router;