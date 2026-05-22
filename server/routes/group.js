import express from 'express';
import mongoose from 'mongoose';
import Group from '../models/Group.js'; // আপনার গ্রুপ মঙ্গুস মডেল (নিচে এর স্ট্রাকচারও আইডিয়া দেওয়া হলো)
// আপনার প্রজেক্টের অথ মিডলওয়্যার (প্রয়োজন অনুযায়ী আপনার মিডলওয়্যার ফাইল দিয়ে রিপ্লেস করবেন)
// const protect = require('../middleware/authMiddleware'); 

const router = express.Router();

// মক মিডলওয়্যার (আপনার প্রজেক্টের আসল প্রোটেকশন মিডলওয়্যার এখানে ব্যবহার করবেন)
const protect = async (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ success: false, message: "Unauthorized Node Access" });
};

/* ==========================================================
    🏢 ১. CREATE NEW GROUP (নতুন গ্রুপ তৈরি পাইপলাইন)
========================================================== */
router.post('/create', protect, async (req, res) => {
  try {
    const creatorId = req.user._id;
    const { name, description, avatar, members, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Group name is mandatory." });
    }

    // মেম্বার লিস্ট রেডি করা (ক্রিয়েটর নিজে ডিফল্টভাবে অ্যাডমিন এবং মেম্বার থাকবে)
    let finalMembers = [{ userId: creatorId, role: 'creator' }];

    if (members && Array.isArray(members)) {
      members.forEach(memberId => {
        if (memberId.toString() !== creatorId.toString()) {
          finalMembers.push({
            userId: memberId,
            role: 'member'
          });
        }
      });
    }

    const newGroup = await Group.create({
      name,
      description: description || '',
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c3aed&color=fff`,
      creator: creatorId,
      members: finalMembers,
      isPrivate: isPrivate !== undefined ? isPrivate : false
    });

    res.status(201).json({ success: true, message: "Group Matrix Initialized!", data: newGroup });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    📥 ২. GET MY GROUPS (ইউজারের সব একটিভ গ্রুপ লিস্ট)
========================================================== */
router.get('/my-groups', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // ইউজার যে যে গ্রুপের মেম্বার লিস্টে আছে সেগুলো নিয়ে আসা
    const userGroups = await Group.find({
      "members.userId": userId
    })
    .populate('creator', 'fullName username profilePic')
    .populate('members.userId', 'fullName username profilePic online')
    .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: userGroups.length, data: userGroups });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    🔍 ৩. GET SINGLE GROUP DETAILS (গ্রুপ ইনফো ও মেম্বারস)
========================================================== */
router.get('/:groupId', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId)
      .populate('creator', 'fullName username profilePic')
      .populate('members.userId', 'fullName username profilePic online');

    if (!group) {
      return res.status(404).json({ success: false, message: "Group matrix not found." });
    }

    // সিকিউরিটি চেক: প্রাইভেট গ্রুপের ক্ষেত্রে ইউজার মেম্বার কিনা তা যাচাই করা
    const isMember = group.members.some(m => m.userId._id.toString() === userId.toString());
    if (group.isPrivate && !isMember) {
      return res.status(403).json({ success: false, message: "Access Denied. Private Infrastructure." });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    ➕ ৪. ADD MEMBERS TO GROUP (গ্রুপে নতুন মেম্বার ইনজেক্ট করা)
========================================================== */
router.post('/:groupId/add-members', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body; // অ্যারে আকারে ইউজার আইডি আসবে [id1, id2]
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found." });

    // চেক করা রিকোয়েস্টকারী মেম্বার বা অ্যাডমিন কিনা (অ্যাডমিন প্রিভিলেজ কাস্টমাইজ করতে পারেন)
    const requester = group.members.find(m => m.userId.toString() === requesterId.toString());
    if (!requester || (requester.role !== 'admin' && requester.role !== 'creator')) {
      return res.status(403).json({ success: false, message: "Only admins/creators can add members." });
    }

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ success: false, message: "userIds array is required." });
    }

    let addedCount = 0;
    userIds.forEach(id => {
      const alreadyMember = group.members.some(m => m.userId.toString() === id.toString());
      if (!alreadyMember) {
        group.members.push({ userId: id, role: 'member' });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      await group.save();
    }

    res.status(200).json({ success: true, message: `${addedCount} new nodes synched to the group.`, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    ❌ ৫. REMOVE MEMBER / KICK FROM GROUP (মেম্বার রিমুভ)
========================================================== */
router.post('/:groupId/kick/:targetUserId', protect, async (req, res) => {
  try {
    const { groupId, targetUserId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group node invalid." });

    // চেক করি রিকোয়েস্টকারী অ্যাডমিন বা ক্রিয়েটর কিনা
    const requester = group.members.find(m => m.userId.toString() === requesterId.toString());
    if (!requester || (requester.role !== 'admin' && requester.role !== 'creator')) {
      return res.status(403).json({ success: false, message: "Action unauthorized. High level access needed." });
    }

    // ক্রিয়েটরকে কিক করা যাবে না লজিক
    const targetMember = group.members.find(m => m.userId.toString() === targetUserId.toString());
    if (targetMember && targetMember.role === 'creator') {
      return res.status(400).json({ success: false, message: "Cannot eject the core creator." });
    }

    // সাব-ডকুমেন্ট থেকে মেম্বার রিমুভ
    group.members.pull({ userId: targetUserId });
    await group.save();

    res.status(200).json({ success: true, message: "User node purged from group successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    👑 ৬. UPDATE MEMBER ROLE (অ্যাডমিন প্রমোশন / ডিমোশন)
========================================================== */
router.put('/:groupId/role', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { targetUserId, newRole } = req.body; // newRole can be 'admin' or 'member'
    const requesterId = req.user._id;

    if (!['admin', 'member'].includes(newRole)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found." });

    // মেম্বার রোল চেঞ্জ করার পারমিশন শুধু 'creator' এর থাকবে
    if (group.creator.toString() !== requesterId.toString()) {
      return res.status(403).json({ success: false, message: "Only the group creator can configure roles." });
    }

    const member = group.members.find(m => m.userId.toString() === targetUserId.toString());
    if (!member) {
      return res.status(404).json({ success: false, message: "Target user is not a member of this group." });
    }

    member.role = newRole;
    await group.save();

    res.status(200).json({ success: true, message: `User role updated to ${newRole} successfully.`, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ==========================================================
    🚪 ৭. LEAVE GROUP (গ্রুপ থেকে নিজে লিভ নেওয়া)
========================================================== */
router.delete('/:groupId/leave', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found." });

    // ক্রিয়েটর ডিরেক্ট লিভ নিতে পারবে না, আগে গ্রুপ ডিলিট করতে হবে বা অন্য কাউকে ওনারশিপ ট্রান্সফার করতে হবে
    if (group.creator.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: "Creator cannot leave. Please dissolve the group instead." });
    }

    group.members.pull({ userId: userId });
    await group.save();

    res.status(200).json({ success: true, message: "Successfully disconnected from group link pipeline." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;