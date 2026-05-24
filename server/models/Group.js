import mongoose from 'mongoose';

/**
 * 🏢 ONYX DRIFT - ADVANCED GROUP CHAT CORE MODEL
 * Handles high-performance messaging metadata, admin controls, and encryption locks.
 */
const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isPrivate: { 
    type: Boolean, 
    default: false 
  },
  permissions: {
    canMessage: {
      type: String,
      enum: ['All', 'Admin'],
      default: 'All'
    }
  },
  members: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['creator', 'admin', 'member'], 
      default: 'member' 
    },
    joinedAt: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // ফ্রন্টএন্ডের fullName সাপোর্ট করার জন্য ভার্চুয়াল এনাবল্ড
  toObject: { virtuals: true }
});

// ⚡ ফ্রন্টএন্ডে ও ডিরেক্ট মেসেঞ্জারে 'fullName' খোঁজে, তাই ব্যাকএন্ডে ভার্চুয়াল ফিল্ড ম্যাপ করা হলো
groupSchema.virtual('fullName').get(function() {
  return this.name;
});

// ফাস্ট কুয়েরির জন্য ইনডেক্সিং
groupSchema.index({ "members.userId": 1 });

// অলরেডি মডেল রেজিস্টার্ড থাকলে সেটা ব্যবহার করবে, নয়তো নতুন তৈরি করবে (রিলোড এরর প্রিভেনশন)
const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);

export default Group;