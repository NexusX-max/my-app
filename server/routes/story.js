import express from 'express';
import Story from '../models/Story.js';


const router = express.Router();

// মিডলওয়্যার প্রোটেকশন (ইউজার লগইন থাকা বাধ্যতামূলক)
// এখানে মক মিডলওয়্যার হিসেবে জাস্ট একটি ফাংশন ধরে নিচ্ছি, আপনার নিজস্ব মিডলওয়্যার (যেমন: protect, verifyToken) দিয়ে এটি রিপ্লেস করবেন।
const protect = async (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ success: false, message: "Unauthorized Drifter Link" });
};

/* ==========================================================
    🔥 ১. SHARE NEW STORY (স্টোরি আপলোড পাইপলাইন)
========================================================== */
router.post('/upload', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, mediaUrl, effects, music, aiMetadata, interactiveElements } = req.body;

    if (!type || !mediaUrl) {
      return res.status(400).json({ success: false, message: "Media URL and Type are mandatory." });
    }

    const newStoryItem = {
      type,
      mediaUrl,
      effects: effects || {},
      music: music || {},
      aiMetadata: aiMetadata || {},
      interactiveElements: interactiveElements || [],
      viewers: []
    };

    // ইউজারের অলরেডি কোনো একটিভ স্টোরি গ্রুপ আছে কিনা চেক করি
    let storyGroup = await Story.findOne({ user: userId });

    if (storyGroup) {
      // গ্রুপ থাকলে নতুন স্টোরিটি পুশ করে দিই
      storyGroup.stories.push(newStoryItem);
      await storyGroup.save();
    } else {
      // গ্রুপ না থাকলে নতুন গ্রুপ তৈরি করি
      storyGroup = await Story.create({
        user: userId,
        stories: [newStoryItem]
      });
    }

    res.status(201).json({ success: true, message: "Story injected into Onyx pipeline successfully!", data: storyGroup });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    ⚡ ২. GET ALL ACTIVE STORIES (ইন্সট্যান্ট লোড ও ফিড ইঞ্জিন)
========================================================== */
router.get('/feed', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // গত ২৪ ঘণ্টার ভেতরের একটিভ স্টোরি গ্রুপগুলো নিয়ে আসা
    // ফ্রন্টএন্ডে Ultra-Smooth সুইপ এবং প্রিলোডিং নিশ্চিত করতে ইউজার ডেটাসহ পপুলেট করা হয়েছে
    const activeTimeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const feedStories = await Story.find({
      "stories.createdAt": { $gte: activeTimeLimit }
    })
    .populate('user', 'fullName username profilePic online')
    .sort({ updatedAt: -1 });

    // প্রতিটি গ্রুপের ভেতর শুধু ২৪ ঘণ্টার ভেতরের স্টোরি ফিল্টার করে পাঠানো (যদি ক্রন জব ডিলে করে)
    const activeFeed = feedStories.map(group => {
      const freshStories = group.stories.filter(s => s.createdAt >= activeTimeLimit);
      return {
        ...group._doc,
        stories: freshStories
      };
    }).filter(group => group.stories.length > 0);

    res.status(200).json({ success: true, data: activeFeed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    👀 ৩. TRACK VIEW & QUICK REACTIONS (ভিউয়ার সিস্টেম ও রিয়াকশন)
========================================================== */
router.post('/view/:storyGroupId/:storyId', protect, async (req, res) => {
  try {
    const viewerId = req.user._id;
    const { storyGroupId, storyId } = req.params;
    const { reactionEmoji } = req.body; // অপশনাল: কুইক রিয়াকশন ইমোজি (❤️, 🔥 ইত্যাদি)

    const storyGroup = await Story.findById(storyGroupId);
    if (!storyGroup) return res.status(404).json({ success: false, message: "Story node not found" });

    const targetStory = storyGroup.stories.id(storyId);
    if (!targetStory) return res.status(404).json({ success: false, message: "Single transmission not found" });

    // চেক করি ইউজার অলরেডি এই স্টোরিটা দেখেছে কিনা
    const existingViewer = targetStory.viewers.find(v => v.userId.toString() === viewerId.toString());

    if (existingViewer) {
      // অলরেডি দেখলে Rewatch Count বাড়িয়ে দেবো
      existingViewer.rewatchCount += 1;
      if (reactionEmoji) existingViewer.reactionEmoji = reactionEmoji;
    } else {
      // প্রথমবার দেখলে নতুন ভিউয়ার অবজেক্ট পুশ হবে
      targetStory.viewers.push({
        userId: viewerId,
        reactionEmoji: reactionEmoji || null
      });
    }

    await storyGroup.save();
    res.status(200).json({ success: true, message: "Metrics updated successfully", data: targetStory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    📊 ৪. INTERACTIVE POLL/QUIZ VOTE (ইন্টারেক্টিভ পোলিং সিস্টেম)
========================================================== */
router.post('/interact/:storyGroupId/:storyId/:elementId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { storyGroupId, storyId, elementId } = req.params;
    const { optionIndex, sliderValue, answerText } = req.body;

    const storyGroup = await Story.findById(storyGroupId);
    if (!storyGroup) return res.status(404).json({ success: false, message: "Pipeline target invalid" });

    const story = storyGroup.stories.id(storyId);
    const interactiveElement = story?.interactiveElements.id(elementId);

    if (!interactiveElement) {
      return res.status(404).json({ success: false, message: "Interactive layer/widget not found" });
    }

    // ইউজার অলরেডি ভোট দিয়েছে কিনা চেক করি
    const alreadyVoted = interactiveElement.votes.find(v => v.userId.toString() === userId.toString());
    if (alreadyVoted) {
      return res.status(400).json({ success: false, message: "Drifter has already interacted with this node." });
    }

    // ভোটের টাইপ অনুযায়ী ডেটা পুশ
    interactiveElement.votes.push({
      userId,
      optionIndex,
      sliderValue,
      answerText
    });

    await storyGroup.save();
    res.status(200).json({ success: true, message: "Interaction recorded into core matrix!", data: interactiveElement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    🔒 ৫. UPDATE PRIVACY SETTINGS (কাস্টম অডিয়েন্স কন্ট্রোল)
========================================================== */
router.put('/privacy', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { privacyType, allowedUsers, blockedUsers, antiDownload } = req.body;

    let storyGroup = await Story.findOne({ user: userId });
    if (!storyGroup) {
      storyGroup = new Story({ user: userId, stories: [] });
    }

    storyGroup.privacy = {
      type: privacyType || 'everyone',
      allowedUsers: allowedUsers || [],
      blockedUsers: blockedUsers || [],
      antiDownload: antiDownload !== undefined ? antiDownload : true
    };

    await storyGroup.save();
    res.status(200).json({ success: true, message: "Privacy protocol updated.", data: storyGroup.privacy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    🗑️ ৬. DELETE STORY MANUALLY (২৪ ঘণ্টার আগে ম্যানুয়াল রিমুভ)
========================================================== */
router.delete('/remove/:storyId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { storyId } = req.params;

    const storyGroup = await Story.findOne({ user: userId });
    if (!storyGroup) return res.status(404).json({ success: false, message: "No active streams found." });

    // সাব-ডকুমেন্ট থেকে স্পেসিফিক স্টোরি রিমুভ করা
    storyGroup.stories.pull({ _id: storyId });
    await storyGroup.save();

    res.status(200).json({ success: true, message: "Story successfully purged from matrix." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;