import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ['direct', 'group', 'channel'], 
      default: 'direct' 
    },
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    groupName: { 
      type: String, 
      default: null 
    },
    groupAvatar: { 
      type: String, 
      default: null 
    },
    admins: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }], 
    lastMessage: {
      text: String,
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  }, 
  { timestamps: true }
);

// ওয়ান-টু-ওয়ান এবং গ্রুপ চ্যাট দ্রুত স্ক্রোলিং ও লোডিং স্পিড বাড়ানোর জন্য ইনডেক্সিং
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ 'lastMessage.createdAt': -1 });

// ওল্ড মডেল কনফ্লিক্ট এড়ানোর সেফটি চেকসহ মডার্ন এক্সপোর্ট
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
export default Conversation;