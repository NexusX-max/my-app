import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    text: {
        type: String,
        default: ""
    },
    mediaUrl: {
        type: String,
        default: ""
    },
    mediaType: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        // 🔴 এখানে 'user' এর বদলে 'author' করা হলো রাউটের সাথে মিল রাখতে
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    views: { // 🔴 এই ফিল্ডটি তোমার রাউটে দরকার ছিল তাই যোগ করা হলো
        type: Number,
        default: 0
    },
    isAiGenerated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;