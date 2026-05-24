import express from 'express';
import mongoose from 'mongoose';
import Group from '../models/Group.js'; 
import Message from '../models/Message.js'; 

const router = express.Router();

// --- 🛠️ HELPER MATRIX LAYER ---

// মক মিডলওয়্যার (আপনার প্রজেক্টের আসল প্রোটেকশন মিডলওয়্যার এখানে ইমপ্লিমেন্ট করবেন)
const protect = async (req, res, next) => {
  if (req.user) return next();
  return res.status(401).json({ success: false, message: "Unauthorized Node Access" });
};

// ডাটাবেজ ক্র্যাশ প্রোটেকশন: আইডি ভ্যালিডেশন হেল্পার
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);


/* ==========================================================
    📥 ০. GET GROUP MESSAGES (Easy & Clean Route Path)
    ইউআরএল: GET /api/groups/:groupId/messages
========================================================== */
router.get('/:groupId/messages', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // ১. কাস্টিং এরর আটকাতে রিয়েল-টাইম আইডি ভ্যালিডেশন ফিল্টার
    if (!isValidObjectId(groupId)) {
      return res.status(200).json({ success: true, messages: [], message: "Legacy or invalid string ID detected. Safe bypass." });
    }

    // ২. গ্রুপ নোড এক্সিস্টেন্স চেক
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group matrix node not found." });
    }

    // ৩. সিকিউরিটি চেক: ইউজার এই নোডের অথরাইজড মেম্বার কিনা
    const isMember = group.members.some(m => m.userId && m.userId.toString() === userId.toString());
    if (group.isPrivate && !isMember) {
      return res.status(403).json({ success: false, message: "Access Denied. Private Infrastructure." });
    }

    // ৪. রিলেশনাল মঙ্গুস ফাইন্ড কুয়েরি (এগ্রিগেশন রিমুভড - পারফরম্যান্স অপ্টিমাইজড)
    const messages = await Message.find({ groupId: new mongoose.Types.ObjectId(groupId) })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName username profilePic');

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages: messages || []
    });
  } catch (error) {
    console.error("Neural Transmission Error in Group Messages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ==========================================================
    🏢 ১. CREATE NEW GROUP (জেনুইন আইডি প্রোডাকশন পাইপলাইন)
    ইউআরএল: POST /api/groups/create
========================================================== */
router.post('/create', protect, async (req, res) => {
  try {
    const creatorId = req.user._id;
    const { name, description, avatar, members, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Group name is mandatory." });
    }

    // মেম্বার লিস্টের স্ট্রাকচার ইনিশিয়ালাইজেশন
    let finalMembers = [{ userId: creatorId, role: 'creator' }];

    if (members && Array.isArray(members)) {
      members.forEach(memberId => {
        const cleanId = memberId._id || memberId;
        // ডুপ্লিকেট ক্রিয়েটর এবং ইনভ্যালিড অবজেক্ট আইডি স্কিপ করার কন্ডিশন
        if (cleanId.toString() !== creatorId.toString() && isValidObjectId(cleanId)) {
          finalMembers.push({
            userId: new mongoose.Types.ObjectId(cleanId),
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
    📥 ২. GET MY GROUPS (ইউজারের সমস্ত একটিভ ক্লাস্টার লিস্ট)
    ইউআরএল: GET /api/groups/my-groups
========================================================== */
router.get('/my-groups', protect, async (req, res) => {
  try {
    const userId = req.user._id;

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
    🔍 ৩. GET SINGLE GROUP DETAILS (স্পেসিফিক নোড ডিটেইলস)
    ইউআরএল: GET /api/groups/:groupId
========================================================== */
router.get('/:groupId', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(groupId)) {
      return res.status(400).json({ success: false, message: "Invalid Group Identifier Layout." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group matrix not found." });
    }

    // পপুলেশন চেইনিং
    await group.populate([
      { path: 'creator', select: 'fullName username profilePic' },
      { path: 'members.userId', select: 'fullName username profilePic online' }
    ]);

    const isMember = group.members.some(m => m.userId && m.userId._id && m.userId._id.toString() === userId.toString());
    if (group.isPrivate && !isMember) {
      return res.status(403).json({ success: false, message: "Access Denied. Private Infrastructure." });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ==========================================================
    ➕ ৪. ADD MEMBERS TO GROUP (গ্রুপে নতুন মেম্বার সিঙ্ক করা)
    ইউআরএল: POST /api/groups/:groupId/add-members
========================================================== */
router.post('/:groupId/add-members', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body; 
    const requesterId = req.user._id;

    if (!isValidObjectId(groupId)) {
      return res.status(400).json({ success: false, message: "Invalid Matrix Parameter Setup." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found." });

    // পারমিশন এনভায়রনমেন্ট চেক
    const requester = group.members.find(m => m.userId && m.userId.toString() === requesterId.toString());
    if (!requester || (requester.role !== 'admin' && requester.role !== 'creator')) {
      return res.status(403).json({ success: false, message: "Only admins/creators can add members." });
    }

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ success: false, message: "userIds array is required." });
    }

    let addedCount = 0;
    userIds.forEach(id => {
      if (isValidObjectId(id)) {
        const alreadyMember = group.members.some(m => m.userId && m.userId.toString() === id.toString());
        if (!alreadyMember) {
          group.members.push({ userId: new mongoose.Types.ObjectId(id), role: 'member' });
          addedCount++;
        }
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
    ❌ ৫. REMOVE MEMBER / KICK FROM GROUP (মেম্বার নোড রিমুভ)
    ইউআরএল: POST /api/groups/:groupId/kick/:targetUserId
========================================================== */
router.post('/:groupId/kick/:targetUserId', protect, async (req, res) => {
  try {
    const { groupId, targetUserId } = req.params;
    const requesterId = req.user._id;

    if (!isValidObjectId(groupId) || !isValidObjectId(targetUserId)) {
      return res.status(400).json({ success: false, message: "Invalid Node Pipeline Parameters." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group node invalid." });

    const requester = group.members.find(m => m.userId && m.userId.toString() === requesterId.toString());
    if (!requester || (requester.role !== 'admin' && requester.role !== 'creator')) {
      return res.status(403).json({ success: false, message: "Action unauthorized. High level access needed." });
    }

    const targetMember = group.members.find(m => m.userId && m.userId.toString() === targetUserId.toString());
    if (targetMember && targetMember.role === 'creator') {
      return res.status(400).json({ success: false, message: "Cannot eject the core creator." });
    }

    group.members.pull({ userId: targetUserId });
    await group.save();

    res.status(200).json({ success: true, message: "User node purged from group successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ==========================================================
    👑 ৬. UPDATE MEMBER ROLE (অ্যাডমিন কনফিগারেশন)
    ইউআরএল: PUT /api/groups/:groupId/role
========================================================== */
router.put('/:groupId/role', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { targetUserId, newRole } = req.body; 
    const requesterId = req.user._id;

    if (!isValidObjectId(groupId) || !isValidObjectId(targetUserId)) {
      return res.status(400).json({ success: false, message: "Broken node data targets." });
    }

    if (!['admin', 'member'].includes(newRole)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found." });

    if (group.creator.toString() !== requesterId.toString()) {
      return res.status(403).json({ success: false, message: "Only the group creator can configure roles." });
    }

    const member = group.members.find(m => m.userId && m.userId.toString() === targetUserId.toString());
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
    🚪 ७. LEAVE GROUP (পাইপলাইন ডিসকানেক্ট অপারেশন)
    ইউআরএল: DELETE /api/groups/:groupId/leave
========================================================== */
router.delete('/:groupId/leave', protect, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(groupId)) {
      return res.status(400).json({ success: false, message: "Broken node configurations." });
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Group not found." });

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