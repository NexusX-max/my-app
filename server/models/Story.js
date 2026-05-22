import mongoose from 'mongoose';

/**
 * 🏆 ONYX DRIFT - ULTRA-SMOOTH KILLER STORY ENGINE MODEL
 * Designed for instant preloading, AI features, interactive engagement, and high-tier privacy.
 */

const interactiveElementSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['poll', 'quiz', 'question', 'countdown', 'link_share', 'emoji_slider'],
    required: true 
  },
  question: String,
  options: [String], 
  correctOptionIndex: Number, 
  countdownTarget: Date, 
  linkUrl: String, 
  linkTitle: String,
  sliderEmoji: { type: String, default: '🔥' }, 
  votes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    optionIndex: Number, 
    sliderValue: Number, 
    answerText: String, 
    votedAt: { type: Date, default: Date.now }
  }]
}, { _id: true });

const singleStorySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['photo', 'video', 'music_only'], 
    required: true 
  },
  mediaUrl: { 
    type: String, 
    required: true 
  }, 
  
  effects: {
    filterName: { type: String, default: 'normal' },
    blurBackground: { type: Boolean, default: false },
    glowEffect: { type: Boolean, default: false },
    neonTheme: String,
    animatedBorder: { type: Boolean, default: false }
  },

  music: {
    trackId: String,
    title: String,
    artist: String,
    audioUrl: String,
    lyrics: [String], 
    beatSyncAnimation: { type: Boolean, default: false }
  },

  aiMetadata: {
    generatedCaption: String,
    autoSubtitles: [{ text: String, start: Number, end: Number }], 
    appliedAiFaceEffect: String,
    backgroundRemoved: { type: Boolean, default: false }
  },

  interactiveElements: [interactiveElementSchema],

  viewers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewedAt: { type: Date, default: Date.now },
    rewatchCount: { type: Number, default: 1 },
    reactionEmoji: String 
  }],

  createdAt: { 
    type: Date, 
    default: Date.now, 
    index: true 
  }
});

const storyGroupSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  
  privacy: {
    type: { 
      type: String, 
      enum: ['everyone', 'close_friends', 'hide_from', 'custom_audience'], 
      default: 'everyone' 
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    storyLock: { type: Boolean, default: false }, 
    antiDownload: { type: Boolean, default: true } 
  },

  stories: [singleStorySchema]
}, { timestamps: true });

storyGroupSchema.index({ "stories.createdAt": 1 });

const Story = mongoose.model('Story', storyGroupSchema);
export default Story;