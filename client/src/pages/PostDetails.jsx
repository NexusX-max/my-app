import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaRegHeart, FaHeart, FaRegComment, 
  FaPaperPlane, FaTrash, FaGlobe, FaClock 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, api } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /**
   * 🛠 ১. আইডি ক্লিন এবং ডাটা ফেচিং লজিক
   * অনেক সময় প্যারামিটার থেকে ':id' চলে আসে, সেটাকে আমরা ক্লিন করে নিচ্ছি।
   */
  const fetchPostDetails = useCallback(async () => {
    if (!id) return;
    
    // ক্লোন (:) থাকলে তা রিমুভ করার লজিক
    const cleanId = id.startsWith(':') ? id.slice(1) : id;

    try {
      setLoading(true);
      // তোমার ব্যাকএন্ড এপিআই পাথ অনুযায়ী কল করা হচ্ছে
      const res = await api.get(`/posts/${cleanId}`);
      
      if (res.data) {
        setPost(res.data);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error("Transmission Error:", err);
      toast.error("Neural Link Failed: Post not found");
      // পোস্ট না পাওয়া গেলে ফিডে ফেরত পাঠিয়ে দিবে
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  }, [id, api, navigate]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  // ২. লাইক হ্যান্ডলার
  const handleLike = async () => {
    const cleanId = id.startsWith(':') ? id.slice(1) : id;
    try {
      const res = await api.post(`/posts/${cleanId}/like`);
      setPost(prev => ({ 
        ...prev, 
        likesCount: res.data.likesCount, 
        isLiked: res.data.liked 
      }));
    } catch (err) {
      toast.error("Sync failed");
    }
  };

  // ৩. নতুন কমেন্ট সাবমিট করা
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const cleanId = id.startsWith(':') ? id.slice(1) : id;
    setSubmitting(true);
    
    try {
      const res = await api.post(`/posts/${cleanId}/comment`, { text: newComment });
      // নতুন কমেন্ট সবার উপরে দেখানোর জন্য
      setComments(prev => [res.data, ...prev]);
      setPost(prev => ({ ...prev, commentsCount: (prev.commentsCount || 0) + 1 }));
      setNewComment("");
      toast.success("Comment Synced!");
    } catch (err) {
      toast.error("Failed to transmit comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#020617] flex items-center justify-center font-mono text-cyan-500 animate-pulse uppercase tracking-[0.3em]">
      Accessing_Neural_Data...
    </div>
  );

  return (
    <div className="bg-[#020617] min-h-screen text-zinc-300 font-sans pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 p-4 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-cyan-500/10 hover:text-cyan-500 rounded-full transition-all text-white">
          <FaArrowLeft size={18} />
        </button>
        <h2 className="font-black text-sm uppercase tracking-widest">
          Post <span className="text-cyan-500">Details</span>
        </h2>
      </header>

      <main className="max-w-2xl mx-auto border-x border-white/5 min-h-screen bg-black/20">
        {/* Main Post Section */}
        {post && (
          <article className="p-6 border-b border-white/5">
            <div className="flex gap-4 mb-6">
              <img 
                src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.firstName}`} 
                className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                alt="av"
              />
              <div>
                <h4 className="font-bold text-white leading-none">{post.author?.firstName} {post.author?.lastName}</h4>
                <p className="text-[10px] text-cyan-500/50 font-mono mt-1 uppercase tracking-tighter">
                   ID: {post._id?.substring(0, 8)}...
                </p>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-zinc-200 mb-6">{post.text}</p>

            {post.mediaUrl && (
              <div className="rounded-[32px] overflow-hidden border border-white/10 bg-zinc-950 mb-6 shadow-2xl shadow-cyan-500/5">
                {post.mediaType === 'video' ? (
                  <video src={post.mediaUrl} controls className="w-full h-auto" />
                ) : (
                  <img src={post.mediaUrl} className="w-full h-auto" alt="post-content" />
                )}
              </div>
            )}

            <div className="flex items-center gap-8 py-4 border-t border-white/5 text-zinc-500">
              <button onClick={handleLike} className={`flex items-center gap-2 transition-all ${post.isLiked ? 'text-rose-500' : 'hover:text-rose-400'}`}>
                {post.isLiked ? <FaHeart size={20} className="drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> : <FaRegHeart size={20} />}
                <span className="text-sm font-bold">{post.likesCount || 0}</span>
              </button>
              <div className="flex items-center gap-2">
                <FaRegComment size={20} />
                <span className="text-sm font-bold">{post.commentsCount || 0}</span>
              </div>
            </div>
          </article>
        )}

        {/* Comment Input Section */}
        <div className="p-6 border-b border-white/5 bg-cyan-500/[0.02]">
          <form onSubmit={handleCommentSubmit} className="flex gap-4">
            <img 
              src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${currentUser?.firstName}`} 
              className="w-10 h-10 rounded-xl object-cover border border-white/10" 
              alt="me"
            />
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Initialize response..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm focus:outline-none focus:border-cyan-500/40 transition-all placeholder:text-zinc-600 text-white"
              />
              <button 
                type="submit" 
                disabled={submitting || !newComment.trim()}
                className="absolute right-2 top-1.5 p-2 text-cyan-500 disabled:text-zinc-700 transition-all hover:scale-110 active:scale-95"
              >
                <FaPaperPlane size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="flex flex-col">
          <div className="p-4 bg-zinc-900/30 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/40 border-b border-white/5">
            Discussion_Thread
          </div>
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={comment._id} 
                className="p-6 border-b border-white/5 hover:bg-cyan-500/[0.01] transition-all"
              >
                <div className="flex gap-4">
                  <img 
                    src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${comment.author?.firstName}`} 
                    className="w-9 h-9 rounded-xl object-cover border border-white/10" 
                    alt="av"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="text-xs font-bold text-white">
                        {comment.author?.firstName} {comment.author?.lastName}
                      </h5>
                      <span className="text-[9px] text-zinc-600 font-mono">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {comments.length === 0 && (
            <div className="p-20 text-center text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
              No transmissions found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PostDetails;