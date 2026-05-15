import Post from '../models/Post.js';
import User from '../models/User.js';

/**
 * 🚀 ১. CREATE NEW POST (Fixed for DB Compatibility)
 */
export const createPost = async (req, res) => {
  try {
    const { content, text, contentType, category, mediaUrl } = req.body;
    const userId = req.user._id || req.user.id;

    // মঙ্গোডিবি স্ক্রিনশট অনুযায়ী 'text' অথবা 'content' যেকোনো একটি গ্রহণ করা
    const postText = content || text || "";

    if (!postText && !mediaUrl) {
      return res.status(400).json({ 
        status: "EMPTY_SIGNAL",
        msg: "Neural content or media is required." 
      });
    }

    const newPost = new Post({
      text: postText, // ডাটাবেসের 'text' ফিল্ডের সাথে মিল রাখা হলো
      author: userId,
      contentType: contentType || (mediaUrl ? 'image' : 'minimal'),
      category: category || 'general',
      mediaUrl: mediaUrl || '',
      isConversation: false
    });

    const savedPost = await newPost.save();
    
    const populatedPost = await Post.findById(savedPost._id).populate(
      'author', 
      'firstName lastName username activeMode avatar'
    );

    res.status(201).json({
      status: "DRIFT_INITIALIZED",
      data: populatedPost
    });

  } catch (error) {
    console.error("🔥 Post Creation Error:", error);
    res.status(500).json({ status: "CORE_FAILURE", error: error.message });
  }
};

/**
 * 🧠 ২. GET NEURAL FEED (World-Class Optimization)
 */
export const getNeuralFeed = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select('activeMode');

    if (!user) {
      return res.status(404).json({ status: "DESYNC", message: "IDENTITY_NOT_FOUND" });
    }

    // প্যাজিনেশন (Pagination for 100K Users)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // মোড অনুযায়ী ফিল্টারিং
    let query = {};
    const mode = user.activeMode || 'global';

    if (mode === 'video') query.contentType = 'video';
    else if (mode === 'chat') query.isConversation = true;
    else if (mode === 'knowledge') query.category = { $in: ['tech', 'science', 'ai'] };

    // ডাটাবেস থেকে ডাটা ফেচ করা
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName username activeMode avatar')
        .lean(), // lean() ইউজ করলে কুয়েরি সুপার ফাস্ট হয়
      Post.countDocuments(query)
    ]);

    // 🛠️ ইমেজ ইউআরএল ফিক্স: যদি লোকাল পাথ থাকে তবে সেটি ডোমেইনসহ ফুল ইউআরএল করা
    const host = req.protocol + '://' + req.get('host');
    const processedPosts = posts.map(post => {
      if (post.mediaUrl && !post.mediaUrl.startsWith('http')) {
        post.mediaUrl = `${host}/${post.mediaUrl}`;
      }
      return post;
    });

    // রেসপন্স স্ট্রাকচার (ফ্রন্টএন্ড অনুযায়ী 'data' কী ব্যবহার করা হয়েছে)
    res.status(200).json({
      status: "SYNC_COMPLETE",
      active_mode: mode,
      data: processedPosts, // আপনার ফ্রন্টএন্ড এই 'data' অ্যারেটি লুপ করবে
      meta: {
        total_signals: total,
        hasMore: total > skip + posts.length,
        sync_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("🔥 Neural Feed Sync Error:", error);
    res.status(500).json({ status: "CORE_FAILURE", data: [] }); // এরর হলে খালি ডাটা পাঠান
  }
};
