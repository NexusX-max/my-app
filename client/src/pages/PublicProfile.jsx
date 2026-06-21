import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Globe, Calendar, Radio, Heart, MessageCircle, X, 
  Send, Image, Video, Play, Volume2, VolumeX, Plus, UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * 🎥 Neural Video Player (X-Style / OnyxDrift spec)
 */
const NeuralVideoPlayer = ({ src }) => {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-[20px] bg-black border border-white/5 aspect-video max-h-[500px] flex items-center justify-center">
      <video 
        ref={videoRef}
        src={src} 
        controls 
        autoPlay
        muted={muted}
        loop
        className="max-w-full max-h-full object-contain" 
      />
      <button 
        onClick={toggleMute}
        className="absolute bottom-4 right-16 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all border border-white/10"
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </div>
  );
};

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user: currentUser } = useContext(AuthContext);
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'videos'

  // Previews modal states matching MyProfile standard
  const [selectedPhotoPost, setSelectedPhotoPost] = useState(null);
  const [selectedVideoPost, setSelectedVideoPost] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [newReelsCommentText, setNewReelsCommentText] = useState("");

  /**
   * 📡 Fetch Profile & Dynamic Posts
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
        
        if (userData.followers && currentUser) {
            const myId = currentUser._id || currentUser.id || "You";
            const followingCheck = userData.followers.some(fId => fId.toString() === myId.toString());
            setIsFollowing(followingCheck);
        }
      }
    } catch (err) {
      console.error("Neural link telemetry query error:", err);
      toast.error("Drifter not found in local nodes");
    } finally {
      setLoading(false);
    }
  }, [id, api, currentUser]);

  useEffect(() => {
    fetchPublicData();
  }, [fetchPublicData]);

  // Helpers to split list of drifter posts
  const getFilteredPhotos = () => posts.filter(p => !p.mediaType || p.mediaType === 'photo' || p.mediaType === 'image');
  const getFilteredVideos = () => posts.filter(p => p.mediaType === 'video' || p.mediaType === 'reels');

  /**
   * ⚡ Follow / Unfollow logic synced with DB
   */
  const handleFollow = async () => {
    const targetId = id?.replace(/^:/, '').trim();
    if (!currentUser) return toast.error("Please login to follow");

    try {
      if (api && typeof api.post === 'function') {
        await api.post(`/users/follow/${targetId}`);
      }
      
      setIsFollowing(!isFollowing);

      setProfile(prev => {
        const myId = currentUser._id || currentUser.id || "You";
        let updatedFollowers = [...(prev.followers || [])];

        if (isFollowing) {
          updatedFollowers = updatedFollowers.filter(f => f.toString() !== myId.toString());
        } else {
          updatedFollowers.push(myId);
        }

        return { ...prev, followers: updatedFollowers };
      });

      toast.success(isFollowing ? "Unfollowed drifter" : "Connected in OnyxDrift node");
    } catch (err) {
      toast.error("Telemetry failed to sync follow status");
    }
  };

  /**
   * ⚡ Standardizes Likes to match MyProfile toggle likes on the full modal
   */
  const handleLikePost = async (postId) => {
    const activeUsername = currentUser?.username || "You";
    
    // Perform positive instant state updates
    setPosts(prev => {
      const updatedPosts = prev.map(p => {
        if (p._id === postId) {
          const alreadyLiked = p.likes ? p.likes.includes(activeUsername) : false;
          let newLikes = p.likes ? [...p.likes] : [];
          if (alreadyLiked) {
            newLikes = newLikes.filter(u => u !== activeUsername);
          } else {
            newLikes.push(activeUsername);
          }
          const updated = { ...p, likes: newLikes };
          if (selectedPhotoPost && selectedPhotoPost._id === postId) {
            setSelectedPhotoPost(updated);
          }
          if (selectedVideoPost && selectedVideoPost._id === postId) {
            setSelectedVideoPost(updated);
          }
          return updated;
        }
        return p;
      });
      return updatedPosts;
    });

    try {
      if (api && typeof api.toggleLike === 'function') {
        await api.toggleLike(postId, activeUsername);
      }
    } catch (err) {
      console.error("api.toggleLike failed, running client-side fallback:", err);
    }
  };

  /**
   * ⚡ Add photo feedback comments
   */
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPhotoPost) return;

    const activeUser = currentUser?.username || "You";
    const tempCommentId = 'comm_' + Date.now();
    let newComment = {
      id: tempCommentId,
      user: activeUser,
      text: newCommentText.trim(),
      time: "Just now"
    };

    const updatedPost = {
      ...selectedPhotoPost,
      comments: [...(selectedPhotoPost.comments || []), newComment]
    };
    setSelectedPhotoPost(updatedPost);
    
    setPosts(prev => prev.map(p => p._id === selectedPhotoPost._id ? updatedPost : p));
    setNewCommentText("");

    try {
      if (api && typeof api.addComment === 'function') {
        const res = await api.addComment(selectedPhotoPost._id, {
          user: activeUser,
          text: newCommentText.trim()
        });
        if (res && res.data) {
          setSelectedPhotoPost(prev => ({
            ...prev,
            comments: prev.comments.map(c => c.id === tempCommentId ? res.data : c)
          }));
        }
      }
    } catch (err) {
      console.error("api.addComment failed:", err);
    }
  };

  /**
   * ⚡ Add video feedback comments
   */
  const handleAddReelsComment = async (e) => {
    e.preventDefault();
    if (!newReelsCommentText.trim() || !selectedVideoPost) return;

    const activeUser = currentUser?.username || "You";
    const tempCommentId = 'comm_' + Date.now();
    let newComment = {
      id: tempCommentId,
      user: activeUser,
      text: newReelsCommentText.trim(),
      time: "Just now"
    };

    const updatedPost = {
      ...selectedVideoPost,
      comments: [...(selectedVideoPost.comments || []), newComment]
    };
    setSelectedVideoPost(updatedPost);
    
    setPosts(prev => prev.map(p => p._id === selectedVideoPost._id ? updatedPost : p));
    setNewReelsCommentText("");

    try {
      if (api && typeof api.addComment === 'function') {
        const res = await api.addComment(selectedVideoPost._id, {
          user: activeUser,
          text: newReelsCommentText.trim()
        });
        if (res && res.data) {
          setSelectedVideoPost(prev => ({
            ...prev,
            comments: prev.comments.map(c => c.id === tempCommentId ? res.data : c)
          }));
        }
      }
    } catch (err) {
      console.error("api.addComment failed on reels:", err);
    }
  };

  if (loading) return (
    <div className="bg-black h-screen flex flex-col items-center justify-center font-mono text-cyan-500">
      <div className="w-10 h-10 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
      <span className="text-[10px] tracking-widest uppercase">Syncing_OnyxDrift_Nodes...</span>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-gray-200 pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-zinc-900 p-4 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-white/10 rounded-full transition-all text-cyan-500 hover:text-white shrink-0">
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h2 className="font-bold text-lg tracking-tight leading-none truncate text-white">
            {profile?.firstName} {profile?.lastName}
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">
            {posts.length} Transmissions Detected
          </p>
        </div>
      </header>

      {/* Hero Cover Image */}
      <section className="relative">
        <div className="h-40 md:h-48 bg-black overflow-hidden bg-zinc-950">
          {profile?.coverImg ? (
            <img src={profile.coverImg} className="w-full h-full object-cover opacity-80" alt="cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
          )}
        </div>
      </section>

      {/* Profile Info & Stats (Perfect match of the reference design visual flow) */}
      <section className="px-5 -mt-10 relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center gap-5 sm:gap-7">
          {/* Avatar with beautiful thick circular gradient stories ring exactly like reference */}
          <div className="relative shrink-0">
            <div className="p-[3.5px] bg-gradient-to-tr from-[#FFB800] via-[#FF007A] to-[#7000FF] rounded-full shadow-[0_0_20px_rgba(255,0,122,0.2)]">
              <div className="p-[2.5px] bg-black rounded-full">
                <img 
                  src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.firstName || 'NILa'}&background=06b6d4&color=fff`} 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                  alt="avatar"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Right Column inside row: Display Name & Follow statistics aligned */}
          <div className="flex-1 min-w-0 mt-8">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight flex items-center gap-1.5">
              <span className="truncate">{profile?.firstName || 'NILa'} {profile?.lastName || ''}</span>
            </h1>

            {/* Profile Follow stats layout, matching the exact order & look */}
            <div className="flex gap-5 sm:gap-8 mt-2.5">
              <div>
                <span className="block font-black text-base sm:text-lg text-white leading-none">{posts?.length || 0}</span>
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">posts</span>
              </div>
              <div>
                <span className="block font-black text-base sm:text-lg text-white leading-none">{profile?.followers?.length || 0}</span>
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">followers</span>
              </div>
              <div>
                <span className="block font-black text-base sm:text-lg text-white leading-none">{profile?.following?.length || 0}</span>
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider">following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Text block */}
        <div className="mt-5">
          <p className="text-zinc-200 text-sm sm:text-base font-semibold leading-relaxed">
            {profile?.bio && profile.bio !== "Neural network active. No custom bio transmission broadcasted." 
              ? profile.bio 
              : "Alhamdulillah for everything 🤍"
            }
          </p>
        </div>

        {/* Dynamic customized link/ref dark pill */}
        <div className="mt-3.5 flex items-center">
          <div className="bg-zinc-900 border border-zinc-800 py-1.5 px-4 rounded-full flex items-center gap-2 transition-colors cursor-pointer text-xs font-bold text-zinc-300">
            <Globe size={13} className="text-cyan-400" />
            <span className="font-mono text-zinc-200">{profile?.username || 'ni6857la'}</span>
            <span className="bg-cyan-500/15 text-cyan-400 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wide">
              1 New
            </span>
          </div>
        </div>

        {/* Mutual followed indicators with beautiful overlapping small avatars dynamically rendered */}
        {profile?.followers && profile.followers.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {profile.followers.slice(0, 3).map((fId, idx) => {
                const name = fId === (currentUser?._id || currentUser?.id) || fId === "my_default_id" || fId === "You"
                  ? (currentUser?.username || "You")
                  : fId;
                return (
                  <img 
                    key={idx}
                    src={`https://ui-avatars.com/api/?name=${name}&background=121821&color=06b6d4&bold=true&size=32`} 
                    className="w-5 h-5 rounded-full object-cover border border-black/80" 
                    alt={name}
                    referrerPolicy="no-referrer"
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              Followed by{" "}
              {profile.followers.map((fId, idx) => {
                const name = fId === (currentUser?._id || currentUser?.id) || fId === "my_default_id" || fId === "You"
                  ? (currentUser?.username || "You")
                  : fId;
                return (
                  <span key={idx} className="text-zinc-200 font-bold hover:underline cursor-pointer">
                    {idx > 0 ? (idx === profile.followers.length - 1 ? " and " : ", ") : ""}
                    {name}
                  </span>
                );
              })}
            </p>
          </div>
        )}

        {/* Action horizontal buttons row: Follow, Message, Options */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={handleFollow}
            className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm transition-all text-center cursor-pointer ${
              isFollowing 
              ? "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800" 
              : "bg-[#1877F2] hover:bg-[#1464cc] text-white shadow-lg shadow-blue-500/10 active:scale-95"
            }`}
          >
            {isFollowing ? "Connected" : "Follow"}
          </button>

          <button 
            onClick={() => {
              const targetId = id?.replace(/^:/, '').trim();
              console.log("TARGET ID =", targetId);
              if (targetId) {
                navigate(`/messages/${targetId}`);
              } else {
                toast.error("Drifter ID not found");
              }
            }}
            className="flex-1 py-3 px-6 bg-[#1877F2]/10 border border-[#1877F2]/25 hover:bg-[#1877F2]/20 text-white font-bold text-sm rounded-2xl transition-all active:scale-95 text-center cursor-pointer"
          >
            Message
          </button>

          <button 
            onClick={() => toast.success("Signal node diagnostics OK")}
            className="p-3 bg-zinc-900 border border-zinc-800 hover:bg-[#23272f] text-white rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </section>

      {/* Media Feed with Elegant Tab Icons and interactive grid */}
      <section className="mt-10 border-t border-zinc-900 pt-8 px-5">
        
        {/* Tab Selection containing ONLY the two icons with no text labels */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="grid grid-cols-2 sm:flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('photos')}
              className={`relative px-8 py-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTab === 'photos' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'text-zinc-500 hover:text-white'
              }`}
              title={`Photos (${getFilteredPhotos().length})`}
            >
              <Image size={18} className="shrink-0" />
            </button>
            
            <button 
              onClick={() => setActiveTab('videos')}
              className={`relative px-8 py-2.5 rounded-xl transition-all flex items-center justify-center ${
                activeTab === 'videos' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'text-zinc-500 hover:text-white'
              }`}
              title={`Videos (${getFilteredVideos().length})`}
            >
              <Video size={18} className="shrink-0 animate-pulse" />
            </button>
          </div>

          <div className="hidden sm:block h-[1px] flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
          
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider">
            Transmission Nodes
          </span>
        </div>

        {/* Media Grid Section representation */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'photos' ? (
            <div>
              {getFilteredPhotos().length === 0 ? (
                <div className="py-24 text-center">
                  <Radio className="text-zinc-800 text-5xl mx-auto mb-3 animate-pulse" />
                  <p className="font-mono text-[10px] text-zinc-700 tracking-[0.3em] uppercase">No Captured Photo Signal</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {getFilteredPhotos().map((post, idx) => (
                    <motion.div 
                      key={post._id || idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedPhotoPost(post)}
                      className="group relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 hover:border-cyan-500/30 transition-all cursor-pointer shadow-xl"
                    >
                      <img 
                        src={post.mediaUrl || post.image} 
                        alt="Photos transmission" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                        <span className="flex items-center gap-2 text-white font-bold text-sm">
                          <Heart size={18} className="text-rose-500 fill-rose-500" />
                          {post.likes ? post.likes.length : 0}
                        </span>
                        <span className="flex items-center gap-2 text-white font-bold text-sm">
                          <MessageCircle size={18} className="text-cyan-400 fill-cyan-400" />
                          {post.comments ? post.comments.length : 0}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {getFilteredVideos().length === 0 ? (
                <div className="py-24 text-center">
                  <Radio className="text-zinc-800 text-5xl mx-auto mb-3 animate-pulse" />
                  <p className="font-mono text-[10px] text-zinc-700 tracking-[0.3em] uppercase">No Virtual Reel Signal</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                  {getFilteredVideos().map((post, idx) => (
                    <motion.div 
                      key={post._id || idx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        console.log("VIDEO POST =", post);
                        navigate('/reels');
                      }}
                      className="group relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 hover:border-cyan-500/30 transition-all cursor-pointer shadow-xl"
                    >
                      <div className="w-full h-full relative flex items-center justify-center bg-black">
                        <video src={post.mediaUrl} className="w-full h-full object-cover opacity-60" muted />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <span className="absolute p-3 bg-cyan-500/20 rounded-full border border-cyan-400/30 text-cyan-400 group-hover:scale-110 transition-transform">
                          <Play size={18} className="fill-cyan-400 text-cyan-400" />
                        </span>
                      </div>
                      
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex justify-between text-xs text-white">
                        <span className="flex items-center gap-1.5">
                          <Heart size={14} className="text-rose-500 fill-rose-500" />
                          {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle size={14} className="text-cyan-400 fill-cyan-400" />
                          {post.comments?.length || 0}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* --- PHOTO PREVIEW FULL OVERLAY MODAL (Consistent with MyProfile) --- */}
      <AnimatePresence>
        {selectedPhotoPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-zinc-800 rounded-[30px] w-full max-w-5xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 max-h-[90vh]"
            >
              {/* Close Button Trigger */}
              <button 
                onClick={() => setSelectedPhotoPost(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-all border border-white/10 cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Media Container Box */}
              <div className="bg-black flex items-center justify-center aspect-square md:aspect-auto md:h-[80vh] overflow-hidden">
                <img 
                  src={selectedPhotoPost.mediaUrl || selectedPhotoPost.image} 
                  alt="High resolution view" 
                  className="w-full h-full object-contain max-h-[80vh]"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Feed Meta description & Real-time commenting zone */}
              <div className="p-6 flex flex-col justify-between overflow-y-auto md:h-[80vh]">
                <div className="flex flex-col gap-4">
                  {/* Avatar & Identifiers block */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.firstName}&background=06b6d4&color=fff`} 
                      className="w-10 h-10 rounded-xl object-cover border border-white/10" 
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{profile?.firstName} {profile?.lastName}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">@{profile?.username}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <p className="text-zinc-300 text-sm leading-relaxed mt-2 whitespace-pre-wrap">
                    {selectedPhotoPost.text || selectedPhotoPost.content}
                  </p>

                  <div className="text-[10px] text-zinc-500 font-mono uppercase mt-1">
                    Transmission ID: {selectedPhotoPost._id}
                  </div>

                  <hr className="border-white/5 my-2" />

                  {/* Comment Stream Container */}
                  <div className="flex flex-col gap-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <MessageCircle size={14} />
                      Signal Feedback ({selectedPhotoPost.comments ? selectedPhotoPost.comments.length : 0})
                    </h5>
                    
                    <div className="flex flex-col gap-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedPhotoPost.comments && selectedPhotoPost.comments.length > 0 ? (
                        selectedPhotoPost.comments.map((comm) => (
                          <div key={comm.id} className="bg-white/[0.02] p-3 rounded-xl border border-white/5 group transition-colors">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-cyan-400">@{comm.user}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{comm.time}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed">{comm.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-650 text-xs font-mono my-2 italic">Grid feedback empty. Broadcast your message below.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Like buttons and Submit comment form */}
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleLikePost(selectedPhotoPost._id)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/5"
                    >
                      <Heart 
                        size={16} 
                        className={`transition-all ${
                          selectedPhotoPost.likes?.includes(currentUser?.username || "You") 
                          ? 'text-rose-500 fill-rose-500 scale-110' 
                          : 'text-zinc-400 group-hover:text-white'
                        }`} 
                      />
                      {selectedPhotoPost.likes ? selectedPhotoPost.likes.length : 0} Likes
                    </button>
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Type neural feedback signal..."
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button 
                      type="submit" 
                      className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all cursor-pointer shadow-lg shrink-0"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- VIDEO PREVIEW FULL OVERLAY MODAL (Consistent with MyProfile) --- */}
      <AnimatePresence>
        {selectedVideoPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-zinc-800 rounded-[30px] w-full max-w-5xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 max-h-[90vh]"
            >
              {/* Close Button Trigger */}
              <button 
                onClick={() => setSelectedVideoPost(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-all border border-white/10 cursor-pointer"
              >
                <X size={20} />
              </button>

              {/* Simulated Reels Video Embed Container */}
              <div className="bg-black flex items-center justify-center aspect-square md:aspect-auto md:h-[80vh] overflow-hidden">
                <NeuralVideoPlayer src={selectedVideoPost.mediaUrl} />
              </div>

              {/* Feed details and Comment submissions */}
              <div className="p-6 flex flex-col justify-between overflow-y-auto md:h-[80vh]">
                <div className="flex flex-col gap-4">
                  {/* Doctor Profile view */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.firstName}&background=06b6d4&color=fff`} 
                      className="w-10 h-10 rounded-xl object-cover border border-white/10" 
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{profile?.firstName} {profile?.lastName}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">@{profile?.username}</p>
                    </div>
                  </div>

                  {/* Body Caption */}
                  <p className="text-zinc-300 text-sm leading-relaxed mt-2 whitespace-pre-wrap">
                    {selectedVideoPost.text || selectedVideoPost.content}
                  </p>

                  <div className="text-[10px] text-zinc-500 font-mono uppercase mt-1">
                    Telemetry ID: {selectedVideoPost._id}
                  </div>

                  <hr className="border-white/5 my-2" />

                  {/* Comments loop */}
                  <div className="flex flex-col gap-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <MessageCircle size={14} />
                      Live Stream Feedbacks ({selectedVideoPost.comments ? selectedVideoPost.comments.length : 0})
                    </h5>
                    
                    <div className="flex flex-col gap-3 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedVideoPost.comments && selectedVideoPost.comments.length > 0 ? (
                        selectedVideoPost.comments.map((comm) => (
                          <div key={comm.id} className="bg-white/[0.02] p-3 rounded-xl border border-white/5 transition-all">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs text-cyan-400">@{comm.user}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{comm.time}</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-relaxed">{comm.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-zinc-650 text-xs font-mono my-2 italic">No stream signal feedbacks detected.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submitting Likes and Comments */}
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleLikePost(selectedVideoPost._id)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/5"
                    >
                      <Heart 
                        size={16} 
                        className={`transition-all ${
                          selectedVideoPost.likes?.includes(currentUser?.username || "You") 
                          ? 'text-rose-500 fill-rose-500 scale-110' 
                          : 'text-zinc-400 hover:text-white'
                        }`} 
                      />
                      {selectedVideoPost.likes ? selectedVideoPost.likes.length : 0} Likes
                    </button>
                  </div>

                  <form onSubmit={handleAddReelsComment} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newReelsCommentText}
                      onChange={(e) => setNewReelsCommentText(e.target.value)}
                      placeholder="Comment on this Virtual Reel..."
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                    <button 
                      type="submit" 
                      className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all cursor-pointer shadow-lg shrink-0"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PublicProfile;
