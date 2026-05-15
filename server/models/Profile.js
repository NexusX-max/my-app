const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  // ১. ইউজার রেফারেন্স (User Account এর সাথে কানেক্টেড)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ২. বেসিক ইনফরমেশন (Public)
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  profilePic: { type: String, default: "" },
  coverImg: { type: String, default: "" },
  headline: { type: String, default: "Neural Architect" },
  bio: { type: String, maxlength: 500 },
  
  // ৩. লোকেশন ও কন্টাক্ট
  location: { type: String, default: "Dhaka, BD" },
  website: { type: String, default: "" },

  // ৪. সোশ্যাল স্ট্যাটাস (Stats)
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // ৫. OnyxDrift স্পেশাল ফিচারস
  isVerified: { type: Boolean, default: false },
  pulseScore: { type: Number, default: 0 }, // ইউজারের এনগেজমেন্ট লেভেল
  neuralNodes: { type: Number, default: 0 }, // অ্যাপের বিশেষ কোনো পয়েন্ট সিস্টেম

  // ৬. প্রাইভেসি সেটিংস (খুবই জরুরি)
  privacy: {
    showEmail: { type: Boolean, default: false },
    showLocation: { type: Boolean, default: true },
    allowMessagesFrom: { 
      type: String, 
      enum: ['everyone', 'friends', 'none'], 
      default: 'everyone' 
    }
  },

  // ৭. ড্রাফট ও হিডেন কন্টেন্ট (Owner Only)
  draftPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

}, { timestamps: true });

// ডাইনামিক ফিল্ড: ফলোয়ার কাউন্ট বের করার জন্য
ProfileSchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

module.exports = mongoose.model('Profile', ProfileSchema);