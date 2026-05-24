import express from 'express';
import Story from '../models/Story.js';

const router = express.Router();

// মিডলওয়্যার: ইউজার প্রোটেকশন
const protect = async (req, res, next) => {
    // আপনার অরিজিনাল অথেন্টিকেশন লজিক এখানে থাকা উচিত
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

        let storyGroup = await Story.findOne({ user: userId });

        if (storyGroup) {
            storyGroup.stories.push(newStoryItem);
            await storyGroup.save();
        } else {
            storyGroup = await Story.create({
                user: userId,
                stories: [newStoryItem]
            });
        }

        res.status(201).json({ success: true, message: "Story injected into Onyx pipeline!", data: storyGroup });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ==========================================================
    ⚡ ২. GET ALL ACTIVE STORIES (ফিড ইঞ্জিন)
========================================================== */
router.get('/feed', protect, async (req, res) => {
    try {
        const activeTimeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const feedStories = await Story.find({
            "stories.createdAt": { $gte: activeTimeLimit }
        })
        .populate('user', 'fullName username profilePic online')
        .sort({ updatedAt: -1 });

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
    👀 ৩. TRACK VIEW & QUICK REACTIONS
========================================================== */
router.post('/view/:storyGroupId/:storyId', protect, async (req, res) => {
    try {
        const viewerId = req.user._id;
        const { storyGroupId, storyId } = req.params;
        const { reactionEmoji } = req.body;

        const storyGroup = await Story.findById(storyGroupId);
        if (!storyGroup) return res.status(404).json({ success: false, message: "Story node not found" });

        const targetStory = storyGroup.stories.id(storyId);
        if (!targetStory) return res.status(404).json({ success: false, message: "Transmission not found" });

        const existingViewer = targetStory.viewers.find(v => v.userId.toString() === viewerId.toString());

        if (existingViewer) {
            existingViewer.rewatchCount += 1;
            if (reactionEmoji) existingViewer.reactionEmoji = reactionEmoji;
        } else {
            targetStory.viewers.push({ userId: viewerId, reactionEmoji: reactionEmoji || null });
        }

        await storyGroup.save();
        res.status(200).json({ success: true, message: "Metrics updated", data: targetStory });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ==========================================================
    📊 ৪. INTERACTIVE POLL/QUIZ VOTE
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

        if (!interactiveElement) return res.status(404).json({ success: false, message: "Widget not found" });

        const alreadyVoted = interactiveElement.votes.find(v => v.userId.toString() === userId.toString());
        if (alreadyVoted) return res.status(400).json({ success: false, message: "Already interacted." });

        interactiveElement.votes.push({ userId, optionIndex, sliderValue, answerText });
        await storyGroup.save();

        res.status(200).json({ success: true, message: "Interaction recorded!", data: interactiveElement });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/* ==========================================================
    🗑️ ৬. DELETE STORY MANUALLY
========================================================== */
router.delete('/remove/:storyId', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { storyId } = req.params;

        const storyGroup = await Story.findOne({ user: userId });
        if (!storyGroup) return res.status(404).json({ success: false, message: "No active streams found." });

        storyGroup.stories.pull({ _id: storyId });
        await storyGroup.save();

        res.status(200).json({ success: true, message: "Story purged from matrix." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;