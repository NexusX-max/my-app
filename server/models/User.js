import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    default: ""
  },
  lastName: {
    type: String,
    trim: true,
    default: ""
  },
  // ⚡ নিউরাল সার্চ এবং ডিসপ্লের জন্য ফুল নেম
  fullName: {
    type: String,
    trim: true,
    default: ""
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, "Username must be at least 3 characters"]
  },
  nickname: {
    type: String,
    trim: true,
    default: ""
  },
  email: {
    type: String,
    unique: true,
    sparse: true, 
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false 
  },

  /* ==========================================================
      🧠 AI & Neural Search (The King's Brain)
  ========================================================== */
  bio_embeddings: {
    type: [Number],
    default: []
  },
  skills: {
    type: [String],
    default: []
  },
  aiAutopilot: {
    type: Boolean,
    default: false
  },
  aiTone: {
    type: String,
    default: "professional"
  },
  ghostMode: {
    type: Boolean,
    default: false
  },

  /* ==========================================================
      🔗 Social Ecosystem
  ========================================================== */
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  /* ==========================================================
      🔐 Security (Passkeys & OAuth)
  ========================================================== */
  passkeys: [{
    credentialID: { type: String, required: true },
    publicKey: { type: String, required: true },
    counter: { type: Number, default: 0 },
    transports: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  deviceSignature: { 
    type: String, 
    default: "" 
  },
  auth0Id: { 
    type: String,
    unique: true,
    sparse: true
  },
  onyxCode: { 
    type: String,
    unique: true,
    sparse: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  /* ==========================================================
      🎨 Profile & Aesthetics
  ========================================================== */
  activeMode: {
    type: String,
    enum: ['minimal', 'video', 'chat', 'knowledge'],
    default: 'minimal'
  },
  avatar: {
    type: String,
    default: ""
  },
  profilePic: { 
    type: String, 
    default: ""
  },
  coverImg: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: "Accessing the OnyxDrift network..."
  },
  location: {
    type: String,
    default: ""
  },
  userPublicKey: {
    type: String,
    default: ""
  }
}, {
  timestamps: true 
});

/* ==========================================================
    🔍 Onyx Neural Search Index (MongoDB Text Search)
========================================================== */
userSchema.index({ 
  username: 'text', 
  fullName: 'text', 
  firstName: 'text', 
  lastName: 'text', 
  skills: 'text',
  bio: 'text' 
}, {
  weights: {
    username: 10,
    fullName: 8,
    firstName: 5,
    skills: 5,
    bio: 2
  },
  name: "OnyxTextIndex"
});

/* ==========================================================
    🔐 Middleware & Methods
========================================================== */

/**
 * ১. পাসওয়ার্ড এনক্রিপশন এবং fullName জেনারেশন
 * লজিক আপডেট: async ফাংশন থেকে next() সরিয়ে দেওয়া হয়েছে
 */
userSchema.pre('save', async function() {
  // fullName তৈরি (যদি firstName বা lastName পরিবর্তিত হয়)
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  // পাসওয়ার্ড হ্যাশিং
  if (!this.isModified('password') || !this.password) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error("Neural encryption failed: " + error.message);
  }
});

// ২. পাসওয়ার্ড চেক মেথড
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// ৩. পাসকি কাউন্টার আপডেট
userSchema.methods.updatePasskeyCounter = async function(credID, newCounter) {
  const passkey = this.passkeys.find(pk => pk.credentialID === credID);
  if (passkey) {
    passkey.counter = newCounter;
    return await this.save();
  }
};

const User = mongoose.model('User', userSchema);
export default User;