import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    // ১. কন্টিনজেন্সি: চ্যাট টাইপ আইডেন্টিফিকেশন
    conversationId: {
      type: String, 
      required: [true, "Conversation ID is required"]
      // এখানে index: true সরিয়ে নিচে কম্পাউন্ড ইনডেক্সে দেওয়া হয়েছে
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
      index: true
    },

    // ২. সেন্ডার ডিটেইলস (Neural Identity)
    senderId: {
      type: String, 
      required: [true, "Sender ID is required"],
      index: true
    },
    senderName: { 
      type: String,
      default: "Unknown Drifter" 
    },
    senderAvatar: { 
      type: String,
      default: ""
    },

    // ৩. ইউনিক আইডেন্টিফায়ার
    tempId: { 
      type: String, 
      sparse: true  
    },

    // ৪. কন্টেন্ট এবং মিডিয়াম
    text: {
      type: String,
      trim: true,
      default: ""
    },
    media: {
      type: String, // Cloudinary image URL
      default: ""
    },
    mediaType: {
      type: String,
      enum: ["text", "image", "video", "voice", "file", "neural-thought"],
      default: "text"
    },

    // 🚀 ফিচার ১: EMOTIONAL SIGNATURE
    neuralMood: {
      type: String,
      enum: ["Neutral", "Happy", "Sad", "Enraged", "Ecstatic", "Anxious", "Neural-Flow"],
      default: "Neural-Flow"
    },

    // 🚀 ফিচার ২: THE TIME CAPSULE
    isTimeCapsule: {
      type: Boolean,
      default: false
    },
    deliverAt: {
      type: Date,
      default: Date.now,
      index: true 
    },

    // 🚀 ফিচার ৩: DIGITAL LEGACY
    isLegacyMessage: {
      type: Boolean,
      default: false
    },
    autonomousReplyEnabled: {
      type: Boolean,
      default: false 
    },

    // ৫. স্ট্যাটাস এবং মেটাডাটা
    seenBy: [
      {
        userId: String,
        seenAt: { type: Date, default: Date.now }
      }
    ],
    isEdited: {
      type: Boolean,
      default: false
    },

    // ৬. PRIVACY & SELF-DESTRUCT (Episodic Memory)
    isSelfDestruct: {
      type: Boolean,
      default: false
    },
    expireAt: {
      type: Date,
      default: null
      // এখান থেকে index: true সরানো হয়েছে কারণ নিচে TTL ইনডেক্স দেওয়া আছে
    }
  },
  { 
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ==========================================================
    📡 PERFORMANCE & OPTIMIZATION (ইন্ডেক্স সেটিংস)
========================================================== */

// ১. TTL Index: এই একটি লাইনই যথেষ্ট expireAt এর জন্য। 
// ডুপ্লিকেট ইনডেক্স এরর এড়াতে ফিল্ডের ভেতর থেকে index: true ডিলিট করা হয়েছে।
MessageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// ২. চ্যাট লোডিং স্পিড বাড়ানোর জন্য কম্পাউন্ড ইনডেক্স
MessageSchema.index({ conversationId: 1, createdAt: -1 });

// ৩. ভার্চুয়াল ফিল্ড: চেক করবে মেসেজটি কি বর্তমানে লক করা
MessageSchema.virtual('isLocked').get(function() {
  return this.deliverAt && new Date() < this.deliverAt;
});

// ৪. প্রি-সেভ হুক
MessageSchema.pre('save', function(next) {
  // যদি self-destruct অন থাকে কিন্তু expireAt দেওয়া না থাকে, তবে ৬০ সেকেন্ড ডিফল্ট
  if (this.isSelfDestruct && !this.expireAt) {
    this.expireAt = new Date(Date.now() + 60 * 1000); 
  }

  // মিডিয়া টাইপ অটো-ডিটেকশন
  if (this.media && (this.mediaType === "text" || !this.mediaType)) {
    this.mediaType = "image";
  }

  // টাইম ক্যাপসুল ভ্যালিডেশন
  if (this.deliverAt && this.deliverAt > new Date()) {
    this.isTimeCapsule = true;
  }
  
  next();
});

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export default Message;