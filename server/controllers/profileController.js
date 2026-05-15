// controllers/profileController.js
const Profile = require('../models/Profile'); // তোমার মডেলটি ইমপোর্ট করো

const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // মালিক কি না চেক
    const isOwner = req.user && req.user.id === profile.user.toString();

    if (isOwner) {
      return res.json(profile);
    } else {
      const publicData = {
        name: profile.name,
        username: profile.username,
        profilePic: profile.profilePic,
        coverImg: profile.coverImg,
        bio: profile.bio,
        headline: profile.headline,
        followers: profile.followers.length,
        following: profile.following.length,
        isVerified: profile.isVerified,
        location: profile.privacy.showLocation ? profile.location : null
      };
      return res.json(publicData);
    }
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// ফাংশনটি এক্সপোর্ট করো
module.exports = { getProfile };