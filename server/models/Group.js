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
}, { timestamps: true });

// ফাস্ট কুয়েরির জন্য ইনডেক্সিং
groupSchema.index({ "members.userId": 1 });

const Group = mongoose.model('Group', groupSchema);

// এই ডিফল্ট এক্সপোর্টটি না থাকার কারণেই আপনার এরর আসছিল 🔥
export default Group;