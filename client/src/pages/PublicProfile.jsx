import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaGlobe, FaCalendarAlt, FaBroadcastTower } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * 🎥 Neural Video Player (X-Style)
 */
const NeuralVideoPlayer = ({ src }) => (
  <div className="relative group overflow-hidden rounded-[20px] bg-black border border-white/5 aspect-video max-h-[500px] flex items-center justify-center">
    <video 
      src={src} 
      controls 
      className="max-w-full max-h-full object-contain" 
    />
  </div>
);

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user: currentUser } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  /**
   * 📡 ডাটা ফেচিং: প্রোফাইল এবং ফলো স্ট্যাটাস লোড করা
   */
  const fetchPublicData = useCallback(async () => {
    const targetId = id?.replace(/^:/, '').trim();
    
    if (!targetId || targetId === 'undefined') {
        setLoading(false);
        return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/users/profile/${targetId}`);
      
      if (res.data) {
        const userData = res.data.user || res.data;
        const postData = res.data.posts || [];
        
        setProfile(userData);
        setPosts(postData);
        
        // বর্তমান ইউজার কি একে ফলো করছে? (ডাটাবেজ থেকে চেক)
        if (userData.followers && currentUser) {
            const myId = currentUser._id || currentUser.id;
            const followingCheck = userData.followers.some(fId => fId.toString() === myId.toString());
            setIsFollowing(followingCheck);
        }
      }
    } catch (err) {
      console.error("Neural link error:", err);
      if(err.response?.status === 404) toast.error("Drifter not found");
    } finally {
      setLoading(false);
    }
  }, [id, api, currentUser]);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  /**
   * ⚡ ফলো/আনফলো হ্যান্ডলার (ডাটাবেজে সেভ হবে)
   */
  const handleFollow = async () => {
    const targetId = id?.replace(/^:/, '').trim();
    if (!currentUser) return toast.error("Please login to follow");

    try {
      // ব্যাকএন্ডে রিকোয়েস্ট পাঠানো (এটি ফলো এবং আনফলো দুইটাই হ্যান্ডেল করবে)
      const res = await api.post(`/users/follow/${targetId}`);
      
      // লোকাল স্টেট আপডেট করা (ডাটাবেজ কলের পর)
      setIsFollowing(!isFollowing);

      // প্রোফাইল অবজেক্টে ফলোয়ার লিস্ট আপডেট করা যাতে সংখ্যা সাথে সাথে পরিবর্তন হয়
      setProfile(prev => {
        const myId = currentUser._id || currentUser.id;
        let updatedFollowers = [...(prev.followers || [])];

        if (isFollowing) {
          // আনফলো করলে লিস্ট থেকে বাদ দাও
          updatedFollowers = updatedFollowers.filter(f => f.toString() !== myId.toString());
        } else {
          // ফলো করলে লিস্টে যোগ করো
          updatedFollowers.push(myId);
        }

        return { ...prev, followers: updatedFollowers };
      });

      toast.success(isFollowing ? "Unfollowed" : "Following in OnyxDrift");
    } catch (err) {
      toast.error("Signal failed to sync with database");
    }
  };

  if (loading) return (
    <div className="bg-[#020617] h-screen flex flex-col items-center justify-center font-mono text-cyan-500">
      <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
      <span className="text-[10px] tracking-widest uppercase">Syncing_Database...</span>
    </div>
  );

  return (
    <div className="bg-[#020617] min-h-screen text-gray-200 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/70 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <FaArrowLeft className="text-cyan-500 text-xl" />
        </button>
        <div>
          <h2 className="font-bold text-lg tracking-tight leading-none truncate">
            {profile?.firstName} {profile?.lastName}
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
            {posts.length} Transmissions Detected
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="h-32 md:h-48 bg-zinc-950 overflow-hidden">
          {profile?.coverImg ? (
            <img src={profile.coverImg} className="w-full h-full object-cover" alt="cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-cyan-900/20 to-black" />
          )}
        </div>
        <div className="absolute -bottom-12 left-5">
          <img 
            src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.firstName}&background=06b6d4&color=fff`} 
            className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-[#020617] object-cover bg-zinc-900 shadow-2xl"
            alt="avatar"
          />
        </div>
      </section>

      {/* Profile Bio & Stats */}
      <section className="mt-14 px-5">
        <div className="flex justify-end">
          {(currentUser?._id || currentUser?.id) !== profile?._id && (
            <button 
              onClick={handleFollow}
              className={`px-8 py-2 rounded-full font-bold text-sm transition-all border ${
                isFollowing 
                ? "bg-transparent border-white/20 text-white hover:border-red-500/40 hover:bg-red-500/10" 
                : "bg-white text-black border-white hover:bg-zinc-200"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-black text-white leading-tight">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-zinc-500 text-sm font-mono">@{profile?.username || 'drifter'}</p>
          
          <p className="mt-4 text-zinc-300 text-[15px] leading-relaxed max-w-xl">
            {profile?.bio || "Neural network active. No bio transmission available."}
          </p>

          {/* Real-time Follow Counts */}
          <div className="flex gap-6 mt-5">
            <div className="flex gap-1 items-center">
              <span className="font-bold text-white">{profile?.following?.length || 0}</span>
              <span className="text-zinc-500 text-sm">Following</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="font-bold text-white">{profile?.followers?.length || 0}</span>
              <span className="text-zinc-500 text-sm">Followers</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            {profile?.location && (
                <span className="flex items-center gap-1.5"><FaGlobe className="text-cyan-800" /> {profile.location}</span>
            )}
            <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-cyan-800" /> Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'April 2026'}</span>
          </div>
        </div>
      </section>

      {/* Transmission Feed */}
      <section className="mt-8 border-t border-white/5">
        <div className="flex border-b border-white/5 bg-black/10">
          <button className="flex-1 py-4 text-sm font-bold text-cyan-500 relative">
            Transmissions
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500 mx-10 shadow-[0_0_10px_#06b6d4]" />
          </button>
          <button className="flex-1 py-4 text-sm font-bold text-zinc-600">Media</button>
        </div>

        <div className="max-w-2xl mx-auto">
          <AnimatePresence>
            {posts.length === 0 ? (
              <div className="py-24 text-center">
                  <FaBroadcastTower className="text-zinc-800 text-5xl mx-auto mb-3 animate-pulse" />
                  <p className="font-mono text-[10px] text-zinc-700 tracking-[0.3em] uppercase">No Signal</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {posts.map((post) => (
                  <motion.article 
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                    key={post._id} 
                    className="p-5 border-b border-white/5 hover:bg-white/[0.01] transition-colors"
                  >
                    <p className="text-[15px] text-zinc-200 mb-4 whitespace-pre-wrap leading-relaxed">
                      {post.content || post.text}
                    </p>
                    
                    {post.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden border border-white/10">
                        {post.mediaType === 'video' ? (
                          <NeuralVideoPlayer src={post.mediaUrl} />
                        ) : (
                          <img 
                            src={post.mediaUrl} 
                            className="w-full h-auto max-h-[600px] object-contain bg-black" 
                            alt="transmission" 
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}
                  </motion.article>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default PublicProfile;